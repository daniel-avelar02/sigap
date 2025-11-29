<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Models\WaterConnection;
use App\Models\MonthlyPayment;
use App\Models\OtherPayment;
use App\Models\InstallmentPlan;
use App\Models\InstallmentPlanPayment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Muestra el panel principal con estadísticas del sistema.
     */
    public function index(): Response
    {
        // KPIs principales
        $totalOwners = Owner::count();
        $totalConnections = WaterConnection::count();
        $activeConnections = WaterConnection::where('status', 'activa')->count();
        $suspendedConnections = WaterConnection::where('status', 'suspendida')->count();

        // Estados de pago
        $connectionsUpToDate = WaterConnection::whereJsonContains('payment_status', 'al_dia')->count();
        $connectionsInArrears = WaterConnection::where(function ($query) {
            $query->whereJsonContains('payment_status', 'en_mora')
                  ->orWhereJsonContains('payment_status', 'en_mora_medidor')
                  ->orWhereJsonContains('payment_status', 'en_mora_instalacion');
        })->count();

        // Ingresos del mes actual
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $monthlyIncome = MonthlyPayment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->sum('total_amount');

        $otherPaymentsIncome = OtherPayment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->sum('amount');

        $installmentIncome = InstallmentPlanPayment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->sum('amount_paid');

        $unifiedPaymentsIncome = Payment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->sum('total_amount');

        $totalMonthIncome = $monthlyIncome + $otherPaymentsIncome + $installmentIncome + $unifiedPaymentsIncome;

        // Ingresos por tipo (mes actual)
        $incomeByType = [
            ['type' => 'Cuotas Mensuales', 'amount' => (float) $monthlyIncome],
            ['type' => 'Otros Pagos', 'amount' => (float) $otherPaymentsIncome],
            ['type' => 'Planes de Cuotas', 'amount' => (float) $installmentIncome],
            ['type' => 'Pagos Unificados', 'amount' => (float) $unifiedPaymentsIncome],
        ];

        // Tendencia de ingresos (últimos 6 meses)
        $incomesTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            $monthly = MonthlyPayment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('total_amount');
            
            $other = OtherPayment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('amount');
            
            $installment = InstallmentPlanPayment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('amount_paid');

            $unified = Payment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('total_amount');
            
            $incomesTrend[] = [
                'month' => $date->locale('es')->isoFormat('MMM YYYY'),
                'monthly' => (float) $monthly,
                'other' => (float) $other,
                'installment' => (float) $installment,
                'unified' => (float) $unified,
                'total' => (float) ($monthly + $other + $installment + $unified),
            ];
        }

        // Distribución por comunidad
        $connectionsByCommunity = WaterConnection::select('community', DB::raw('count(*) as total'))
            ->groupBy('community')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                return [
                    'community' => $item->community,
                    'total' => $item->total,
                ];
            });

        // Planes de cuotas activos
        $activePlans = InstallmentPlan::where('status', 'activo')->count();
        $completedPlans = InstallmentPlan::where('status', 'completado')->count();
        $cancelledPlans = InstallmentPlan::where('status', 'cancelado')->count();

        // Planes por tipo
        $installationPlans = [
            'active' => InstallmentPlan::where('status', 'activo')->where('plan_type', 'instalacion')->count(),
            'completed' => InstallmentPlan::where('status', 'completado')->where('plan_type', 'instalacion')->count(),
            'cancelled' => InstallmentPlan::where('status', 'cancelado')->where('plan_type', 'instalacion')->count(),
        ];

        $meterPlans = [
            'active' => InstallmentPlan::where('status', 'activo')->where('plan_type', 'medidor')->count(),
            'completed' => InstallmentPlan::where('status', 'completado')->where('plan_type', 'medidor')->count(),
            'cancelled' => InstallmentPlan::where('status', 'cancelado')->where('plan_type', 'medidor')->count(),
        ];

        // Pagos recientes (últimos 10)
        $recentPayments = $this->getRecentPayments();

        // Top 5 comunidades por ingresos (mes actual)
        $topCommunities = MonthlyPayment::join('water_connections', 'monthly_payments.water_connection_id', '=', 'water_connections.id')
            ->select('water_connections.community', DB::raw('SUM(monthly_payments.total_amount) as total'))
            ->whereYear('monthly_payments.payment_date', $currentYear)
            ->whereMonth('monthly_payments.payment_date', $currentMonth)
            ->groupBy('water_connections.community')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'community' => $item->community,
                    'amount' => (float) $item->total,
                ];
            });

        // Estadísticas de otros pagos por tipo (mes actual)
        $otherPaymentsByType = OtherPayment::select('payment_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->groupBy('payment_type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->payment_type,
                    'type_name' => OtherPayment::PAYMENT_TYPES[$item->payment_type] ?? $item->payment_type,
                    'count' => $item->count,
                    'total' => (float) $item->total,
                ];
            });

        return Inertia::render('Dashboard', [
            'kpis' => [
                'totalOwners' => $totalOwners,
                'totalConnections' => $totalConnections,
                'activeConnections' => $activeConnections,
                'suspendedConnections' => $suspendedConnections,
                'connectionsUpToDate' => $connectionsUpToDate,
                'connectionsInArrears' => $connectionsInArrears,
                'totalMonthIncome' => (float) $totalMonthIncome,
                'activePlans' => $activePlans,
                'completedPlans' => $completedPlans,
                'cancelledPlans' => $cancelledPlans,
            ],
            'installationPlans' => $installationPlans,
            'meterPlans' => $meterPlans,
            'incomeByType' => $incomeByType,
            'incomesTrend' => $incomesTrend,
            'connectionsByCommunity' => $connectionsByCommunity,
            'topCommunities' => $topCommunities,
            'otherPaymentsByType' => $otherPaymentsByType,
            'recentPayments' => $recentPayments,
        ]);
    }

    /**
     * Obtiene los pagos más recientes del sistema.
     */
    private function getRecentPayments()
    {
        $recentPayments = collect();

        // Pagos mensuales recientes
        $monthlyPayments = MonthlyPayment::with(['waterConnection.owner', 'user'])
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'monthly',
                    'type_label' => 'Cuota Mensual',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'amount' => (float) $payment->total_amount,
                    'owner_name' => $payment->waterConnection->owner->name ?? 'N/A',
                    'water_connection_number' => $payment->waterConnection->owner_number ?? 'N/A',
                    'community' => $payment->waterConnection->community ?? 'N/A',
                ];
            });

        // Otros pagos recientes
        $otherPayments = OtherPayment::with(['waterConnection.owner', 'user'])
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'other',
                    'type_label' => OtherPayment::PAYMENT_TYPES[$payment->payment_type] ?? 'Otro',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'amount' => (float) $payment->amount,
                    'owner_name' => $payment->waterConnection->owner->name ?? 'N/A',
                    'water_connection_number' => $payment->waterConnection->owner_number ?? 'N/A',
                    'community' => $payment->waterConnection->community ?? 'N/A',
                ];
            });

        // Pagos de cuotas recientes
        $installmentPayments = InstallmentPlanPayment::with(['installmentPlan.waterConnection.owner', 'user'])
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'installment',
                    'type_label' => 'Plan de Cuotas',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'amount' => (float) $payment->amount_paid,
                    'owner_name' => $payment->installmentPlan->waterConnection->owner->name ?? 'N/A',
                    'water_connection_number' => $payment->installmentPlan->waterConnection->owner_number ?? 'N/A',
                    'community' => $payment->installmentPlan->waterConnection->community ?? 'N/A',
                ];
            });

        // Pagos unificados recientes
        $unifiedPayments = Payment::with(['waterConnection.owner', 'user'])
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'type' => 'unified',
                    'type_label' => 'Pago Unificado',
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'amount' => (float) $payment->total_amount,
                    'owner_name' => $payment->waterConnection->owner->name ?? 'N/A',
                    'water_connection_number' => $payment->waterConnection->owner_number ?? 'N/A',
                    'community' => $payment->waterConnection->community ?? 'N/A',
                ];
            });

        // Combinar todos los pagos y ordenar por fecha
        $recentPayments = collect()
            ->merge($monthlyPayments)
            ->merge($otherPayments)
            ->merge($installmentPayments)
            ->merge($unifiedPayments)
            ->sortByDesc('payment_date')
            ->take(5)
            ->values();

        return $recentPayments;
    }
}
