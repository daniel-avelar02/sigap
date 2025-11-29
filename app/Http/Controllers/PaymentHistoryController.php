<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPayment;
use App\Models\OtherPayment;
use App\Models\InstallmentPlanPayment;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Collection;

class PaymentHistoryController extends Controller
{
    /**
     * Muestra el historial unificado de todos los pagos del sistema.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $paymentType = $request->input('payment_type');
        $community = $request->input('community');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $perPage = 15;

        // Obtener todos los tipos de pagos
        $allPayments = collect();

        // 1. Pagos Mensuales
        if (!$paymentType || $paymentType === 'monthly') {
            $monthlyQuery = MonthlyPayment::with(['waterConnection.owner', 'user']);
            
            $this->applySearchFilter($monthlyQuery, $search);
            $this->applyCommunityFilter($monthlyQuery, $community);
            $this->applyDateFilter($monthlyQuery, $startDate, $endDate);
            
            $monthlyPayments = $monthlyQuery->get()->map(function ($payment) {
                // Verificar que la conexión exista
                if (!$payment->waterConnection || !$payment->waterConnection->owner) {
                    return null;
                }
                
                return [
                    'id' => $payment->id,
                    'type' => 'monthly',
                    'type_label' => 'Pago Mensual',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'water_connection' => $payment->waterConnection,
                    'owner' => $payment->waterConnection->owner,
                    'amount' => $payment->total_amount,
                    'details' => [
                        'month' => $payment->payment_month,
                        'year' => $payment->payment_year,
                        'months_paid' => $payment->months_paid ?? [],
                    ],
                    'user' => $payment->user,
                    'deleted_at' => $payment->deleted_at,
                ];
            })->filter();
            
            $allPayments = $allPayments->merge($monthlyPayments);
        }

        // 2. Otros Pagos
        if (!$paymentType || $paymentType === 'other') {
            $otherQuery = OtherPayment::with(['waterConnection.owner', 'user']);
            
            $this->applySearchFilter($otherQuery, $search);
            $this->applyCommunityFilter($otherQuery, $community);
            $this->applyDateFilter($otherQuery, $startDate, $endDate, 'payment_date');
            
            $otherPayments = $otherQuery->get()->map(function ($payment) {
                // Verificar que la conexión exista
                if (!$payment->waterConnection || !$payment->waterConnection->owner) {
                    return null;
                }
                
                return [
                    'id' => $payment->id,
                    'type' => 'other',
                    'type_label' => 'Otro Pago',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'water_connection' => $payment->waterConnection,
                    'owner' => $payment->waterConnection->owner,
                    'amount' => $payment->amount,
                    'details' => [
                        'payment_type' => $payment->payment_type,
                        'payment_type_label' => OtherPayment::PAYMENT_TYPES[$payment->payment_type] ?? $payment->payment_type,
                        'description' => $payment->description,
                    ],
                    'user' => $payment->user,
                    'deleted_at' => $payment->deleted_at,
                ];
            })->filter();
            
            $allPayments = $allPayments->merge($otherPayments);
        }

        // 3. Pagos de Cuotas
        if (!$paymentType || $paymentType === 'installment') {
            $installmentQuery = InstallmentPlanPayment::with(['installmentPlan.waterConnection.owner', 'user']);
            
            // Búsqueda
            if ($search) {
                $searchClean = str_replace('-', '', $search);
                $installmentQuery->where(function ($q) use ($search, $searchClean) {
                    $q->where('receipt_number', 'like', "%{$search}%")
                      ->orWhereHas('installmentPlan.waterConnection', function ($wcQuery) use ($search, $searchClean) {
                          $wcQuery->where('code', 'like', "%{$search}%")
                                  ->orWhere('owner_number', 'like', "%{$search}%")
                                  ->orWhereHas('owner', function ($ownerQuery) use ($search, $searchClean) {
                                      $ownerQuery->where('name', 'like', "%{$search}%")
                                                 ->orWhere('dui', 'like', "%{$searchClean}%");
                                  });
                      });
                });
            }
            
            // Filtro por comunidad
            if ($community) {
                $installmentQuery->whereHas('installmentPlan.waterConnection', function ($wcQuery) use ($community) {
                    $wcQuery->where('community', $community);
                });
            }
            
            // Filtro por fechas
            $this->applyDateFilter($installmentQuery, $startDate, $endDate);
            
            $installmentPayments = $installmentQuery->get()->map(function ($payment) {
                // Verificar que el plan y la conexión existan
                if (!$payment->installmentPlan || !$payment->installmentPlan->waterConnection) {
                    return null;
                }
                
                return [
                    'id' => $payment->id,
                    'type' => 'installment',
                    'type_label' => 'Pago de Cuota',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'water_connection' => $payment->installmentPlan->waterConnection,
                    'owner' => $payment->installmentPlan->waterConnection->owner,
                    'amount' => $payment->amount_paid,
                    'details' => [
                        'installment_plan_id' => $payment->installment_plan_id,
                        'installments_paid' => $payment->installments_paid,
                    ],
                    'user' => $payment->user,
                    'deleted_at' => null,
                ];
            })->filter(); // Eliminar elementos nulos
            
            $allPayments = $allPayments->merge($installmentPayments);
        }

        // Ordenar por fecha de pago descendente
        $allPayments = $allPayments->sortByDesc('payment_date')->values();

        // Paginación manual
        $total = $allPayments->count();
        $currentPage = $request->input('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        
        $paginatedPayments = $allPayments->slice($offset, $perPage)->values();

        return Inertia::render('PaymentHistory/Index', [
            'payments' => [
                'data' => $paginatedPayments,
                'current_page' => $currentPage,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
                'links' => $this->generatePaginationLinks($currentPage, ceil($total / $perPage), $request),
            ],
            'filters' => [
                'search' => $search,
                'payment_type' => $paymentType,
                'community' => $community,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'communities' => Owner::COMMUNITIES,
            'paymentTypes' => [
                'monthly' => 'Pagos Mensuales',
                'other' => 'Otros Pagos',
                'installment' => 'Pagos de Cuotas',
            ],
            'otherPaymentTypes' => OtherPayment::PAYMENT_TYPES,
        ]);
    }

    /**
     * Aplicar filtro de búsqueda.
     */
    private function applySearchFilter($query, $search)
    {
        if ($search) {
            $searchClean = str_replace('-', '', $search);
            
            $query->where(function ($q) use ($search, $searchClean) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('waterConnection', function ($wcQuery) use ($search, $searchClean) {
                      $wcQuery->where('code', 'like', "%{$search}%")
                              ->orWhere('owner_number', 'like', "%{$search}%")
                              ->orWhereHas('owner', function ($ownerQuery) use ($search, $searchClean) {
                                  $ownerQuery->where('name', 'like', "%{$search}%")
                                             ->orWhere('dui', 'like', "%{$searchClean}%");
                              });
                  });
            });
        }
    }

    /**
     * Aplicar filtro de comunidad.
     */
    private function applyCommunityFilter($query, $community)
    {
        if ($community) {
            $query->whereHas('waterConnection', function ($wcQuery) use ($community) {
                $wcQuery->where('community', $community);
            });
        }
    }

    /**
     * Aplicar filtro de fechas.
     */
    private function applyDateFilter($query, $startDate, $endDate, $dateColumn = 'payment_date')
    {
        if ($startDate && $endDate) {
            $query->whereBetween($dateColumn, [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where($dateColumn, '>=', $startDate);
        } elseif ($endDate) {
            $query->where($dateColumn, '<=', $endDate);
        }
    }

    /**
     * Generar links de paginación.
     */
    private function generatePaginationLinks($currentPage, $lastPage, Request $request)
    {
        $links = [];
        $queryParams = $request->except('page');

        // Link anterior
        $links[] = [
            'url' => $currentPage > 1 ? route('payment-history.index', array_merge($queryParams, ['page' => $currentPage - 1])) : null,
            'label' => 'Anterior',
            'active' => false,
        ];

        // Links de páginas
        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = [
                'url' => route('payment-history.index', array_merge($queryParams, ['page' => $i])),
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        // Link siguiente
        $links[] = [
            'url' => $currentPage < $lastPage ? route('payment-history.index', array_merge($queryParams, ['page' => $currentPage + 1])) : null,
            'label' => 'Siguiente',
            'active' => false,
        ];

        return $links;
    }
}
