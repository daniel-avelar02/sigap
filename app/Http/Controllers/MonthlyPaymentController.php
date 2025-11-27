<?php

namespace App\Http\Controllers;

use App\Http\Requests\MonthlyPaymentRequest;
use App\Models\MonthlyPayment;
use App\Models\Owner;
use App\Models\SystemSetting;
use App\Models\WaterConnection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MonthlyPaymentController extends Controller
{
    /**
     * Muestra el listado de pagos mensuales con filtros.
     */
    public function index(Request $request): Response
    {
        $query = MonthlyPayment::with(['waterConnection.owner', 'user']);

        // Filtro de búsqueda (por número de recibo, código de paja, nombre de propietario)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('waterConnection', function ($wcQuery) use ($search) {
                      $wcQuery->where('code', 'like', "%{$search}%")
                              ->orWhere('owner_number', 'like', "%{$search}%")
                              ->orWhereHas('owner', function ($ownerQuery) use ($search) {
                                  $ownerQuery->where('name', 'like', "%{$search}%");
                              });
                  });
            });
        }

        // Filtro por comunidad
        if ($community = $request->input('community')) {
            $query->whereHas('waterConnection', function ($wcQuery) use ($community) {
                $wcQuery->where('community', $community);
            });
        }

        // Filtro por año
        if ($year = $request->input('year')) {
            $query->where('payment_year', $year);
        }

        // Filtro por rango de fechas
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('payment_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('payment_date', '<=', $dateTo);
        }

        // Ordenar por fecha de pago descendente
        $query->orderByDesc('payment_date')
              ->orderByDesc('id');

        $payments = $query->paginate(15)->withQueryString();

        // Calcular total de la página actual
        $pageTotal = $payments->sum('total_amount');

        return Inertia::render('MonthlyPayments/Index', [
            'payments' => $payments,
            'pageTotal' => $pageTotal,
            'filters' => $request->only(['search', 'community', 'year', 'date_from', 'date_to']),
            'communities' => Owner::COMMUNITIES,
        ]);
    }

    /**
     * Muestra el formulario de registro de pago (punto de cobro).
     */
    public function create(Request $request): Response
    {
        return Inertia::render('MonthlyPayments/Create', [
            'monthlyFee' => SystemSetting::getMonthlyFee(),
            'currentMonth' => (int) date('n'),
            'currentYear' => (int) date('Y'),
        ]);
    }

    /**
     * Registra un nuevo pago mensual (o múltiples meses).
     */
    public function store(MonthlyPaymentRequest $request): RedirectResponse
    {
        $selectedMonths = $request->selected_months;
        $monthsCount = count($selectedMonths);
        
        // Generar un ID de grupo si hay múltiples meses
        $paymentGroupId = $monthsCount > 1 ? MonthlyPayment::generatePaymentGroupId() : null;
        
        $createdPayments = [];
        $paymentDate = $request->payment_date ?? now();
        
        // Crear un pago por cada mes seleccionado
        foreach ($selectedMonths as $monthYear) {
            // Parsear el formato YYYY-M
            [$year, $month] = explode('-', $monthYear);
            $year = (int) $year;
            $month = (int) $month;
            
            // Generar número de recibo único para cada pago
            $receiptNumber = MonthlyPayment::generateReceiptNumber();
            
            // Crear el pago
            $payment = MonthlyPayment::create([
                'water_connection_id' => $request->water_connection_id,
                'payment_month' => $month,
                'payment_year' => $year,
                'payment_date' => $paymentDate,
                'receipt_number' => $receiptNumber,
                'payment_group_id' => $paymentGroupId,
                'months_count' => $monthsCount,
                'payer_name' => $request->payer_name,
                'payer_dui' => $request->payer_dui,
                'monthly_fee_amount' => $request->monthly_fee_amount,
                'total_amount' => $request->monthly_fee_amount,
                'notes' => $request->notes,
                'user_id' => auth()->id(),
            ]);
            
            $createdPayments[] = $payment;
        }

        // Actualizar el estado de pago de la paja
        $waterConnection = WaterConnection::find($request->water_connection_id);
        $waterConnection->updatePaymentStatus();

        // Redirigir al comprobante del primer pago
        $message = $monthsCount === 1 
            ? __('custom.payment_registered')
            : "Se registraron exitosamente {$monthsCount} pagos mensuales.";

        return redirect()
            ->route('monthly-payments.show', $createdPayments[0])
            ->with('success', $message);
    }

    /**
     * Muestra el comprobante de pago.
     */
    public function show(Request $request, MonthlyPayment $monthlyPayment): Response
    {
        $monthlyPayment->load(['waterConnection.owner', 'user']);

        // Si el pago pertenece a un grupo, cargar los otros pagos del grupo
        $relatedPayments = null;
        if ($monthlyPayment->payment_group_id) {
            $relatedPayments = MonthlyPayment::byPaymentGroup($monthlyPayment->payment_group_id)
                ->orderBy('payment_year')
                ->orderBy('payment_month')
                ->get();
        }

        return Inertia::render('MonthlyPayments/Show', [
            'payment' => $monthlyPayment,
            'relatedPayments' => $relatedPayments,
        ]);
    }
}
