<?php

namespace App\Http\Controllers;

use App\Models\OtherPayment;
use App\Models\WaterConnection;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OtherPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $paymentType = $request->input('payment_type');
        $community = $request->input('community');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = OtherPayment::with(['waterConnection.owner', 'user'])
            ->orderByDesc('payment_date');

        // Búsqueda por código de paja, número de propietario, nombre del propietario o DUI
        if ($search) {
            $searchClean = str_replace('-', '', $search);
            
            $query->where(function ($q) use ($search, $searchClean) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhere('payer_name', 'like', "%{$search}%")
                  ->orWhere('payer_dui', 'like', "%{$searchClean}%")
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

        // Filtro por tipo de pago
        if ($paymentType) {
            $query->ofType($paymentType);
        }

        // Filtro por comunidad
        if ($community) {
            $query->byCommunity($community);
        }

        // Filtro por rango de fechas
        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        } elseif ($startDate) {
            $query->where('payment_date', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('payment_date', '<=', $endDate);
        }

        $otherPayments = $query->paginate(15)->withQueryString();

        return Inertia::render('OtherPayments/Index', [
            'otherPayments' => $otherPayments,
            'filters' => [
                'search' => $search,
                'payment_type' => $paymentType,
                'community' => $community,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'paymentTypes' => OtherPayment::PAYMENT_TYPES,
            'communities' => WaterConnection::COMMUNITIES,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('OtherPayments/Create', [
            'paymentTypes' => OtherPayment::PAYMENT_TYPES,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'water_connection_id' => 'required|exists:water_connections,id',
            'payment_type' => 'required|in:' . implode(',', array_keys(OtherPayment::PAYMENT_TYPES)),
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payer_name' => 'required|string|max:255',
            'payer_dui' => 'required|string|size:10',
            'additional_notes' => 'nullable|string|max:1000',
            'payment_date' => 'required|date',
        ]);

        // Generar número de recibo único
        $validated['receipt_number'] = OtherPayment::generateReceiptNumber();
        $validated['user_id'] = auth()->id();

        // Formatear DUI (eliminar guiones para almacenar)
        $validated['payer_dui'] = str_replace('-', '', $validated['payer_dui']);

        $otherPayment = OtherPayment::create($validated);

        return redirect()->route('other-payments.show', $otherPayment)
            ->with('success', 'Pago registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(OtherPayment $otherPayment): Response
    {
        $otherPayment->load(['waterConnection.owner', 'user']);

        return Inertia::render('OtherPayments/Show', [
            'otherPayment' => $otherPayment,
            'paymentTypeName' => $otherPayment->payment_type_name,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OtherPayment $otherPayment): RedirectResponse
    {
        $otherPayment->delete();

        return redirect()->route('other-payments.index')
            ->with('success', 'Pago eliminado exitosamente.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id): RedirectResponse
    {
        $otherPayment = OtherPayment::withTrashed()->findOrFail($id);
        $otherPayment->restore();

        return redirect()->route('other-payments.index')
            ->with('success', 'Pago restaurado exitosamente.');
    }

    /**
     * Get payments by water connection (API endpoint).
     */
    public function getByWaterConnection(Request $request)
    {
        $waterConnectionId = $request->input('water_connection_id');

        if (!$waterConnectionId) {
            return response()->json(['error' => 'water_connection_id is required'], 400);
        }

        $payments = OtherPayment::where('water_connection_id', $waterConnectionId)
            ->with('user')
            ->orderByDesc('payment_date')
            ->get();

        // Calcular totales por tipo
        $totalsByType = OtherPayment::where('water_connection_id', $waterConnectionId)
            ->select('payment_type', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_type => $item->total];
            });

        return response()->json([
            'payments' => $payments,
            'totals_by_type' => $totalsByType,
            'grand_total' => $payments->sum('amount'),
        ]);
    }

    /**
     * Get statistics by payment type (API endpoint).
     */
    public function getStatsByType(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $community = $request->input('community');

        $query = OtherPayment::query();

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        if ($community) {
            $query->byCommunity($community);
        }

        $stats = $query->select('payment_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('payment_type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->payment_type,
                    'type_name' => OtherPayment::PAYMENT_TYPES[$item->payment_type] ?? $item->payment_type,
                    'count' => $item->count,
                    'total' => $item->total,
                ];
            });

        return response()->json([
            'statistics' => $stats,
            'grand_total' => $stats->sum('total'),
            'total_transactions' => $stats->sum('count'),
        ]);
    }
}
