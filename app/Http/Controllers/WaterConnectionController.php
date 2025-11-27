<?php

namespace App\Http\Controllers;

use App\Models\WaterConnection;
use App\Models\Owner;
use App\Http\Requests\WaterConnectionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WaterConnectionController extends Controller
{
    /**
     * Mostrar una lista de las pajas de agua.
     */
    public function index(Request $request): Response
    {
        $query = WaterConnection::with('owner')->withTrashed();

        // Aplicar filtro de búsqueda
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        // Aplicar filtro de propietario
        if ($ownerId = $request->input('owner_id')) {
            $query->byOwner($ownerId);
        }

        // Aplicar filtro de comunidad
        if ($community = $request->input('community')) {
            $query->byCommunity($community);
        }

        // Aplicar filtro de estado (activo/inactivo basado en soft delete)
        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->whereNull('deleted_at');
            } elseif ($status === 'inactive') {
                $query->whereNotNull('deleted_at');
            }
        }

        // Aplicar filtro de estado de pago
        if ($paymentStatus = $request->input('payment_status')) {
            $query->byPaymentStatus($paymentStatus);
        }

        // Aplicar ordenamiento
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'asc');
        
        // Si se ordena por nombre del propietario, hacer join con la tabla owners
        if ($sortBy === 'owner_name') {
            $query->join('owners', 'water_connections.owner_id', '=', 'owners.id')
                  ->orderBy('owners.name', $sortOrder)
                  ->select('water_connections.*');
        } elseif ($sortBy) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $waterConnections = $query->paginate(15)
            ->withQueryString();

        return Inertia::render('WaterConnections/Index', [
            'waterConnections' => $waterConnections,
            'filters' => $request->only(['search', 'owner_id', 'community', 'status', 'payment_status', 'sort_by', 'sort_order']),
            'communities' => Owner::COMMUNITIES,
            'statuses' => WaterConnection::STATUSES,
            'paymentStatuses' => WaterConnection::PAYMENT_STATUSES,
            'paymentStatusLabels' => WaterConnection::PAYMENT_STATUS_LABELS,
        ]);
    }

    /**
     * Mostrar el formulario para crear una nueva paja de agua.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('WaterConnections/Create', [
            'communities' => Owner::COMMUNITIES,
            'statuses' => WaterConnection::STATUSES,
            'filters' => $request->only(['search', 'community', 'status', 'payment_status']),
            'preselectedOwnerId' => $request->input('owner_id'),
        ]);
    }

    /**
     * Almacenar una nueva paja de agua en el almacenamiento.
     */
    public function store(WaterConnectionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Generar código único automáticamente
        $validated['code'] = $this->generateUniqueCode();
        
        // Establecer payment_status por defecto como array
        $validated['payment_status'] = ['al_dia'];

        WaterConnection::create($validated);

        return redirect()->route('water-connections.index', $request->only(['search', 'community', 'status', 'payment_status']))
            ->with('success', 'Paja de agua creada exitosamente.');
    }

    /**
     * Mostrar los detalles de la paja de agua especificada.
     */
    public function show(Request $request, WaterConnection $waterConnection): Response
    {
        $waterConnection->load('owner');

        return Inertia::render('WaterConnections/Show', [
            'waterConnection' => $waterConnection,
            'filters' => $request->only(['search', 'community', 'status', 'payment_status']),
        ]);
    }

    /**
     * Mostrar el formulario para editar la paja de agua especificada.
     */
    public function edit(Request $request, WaterConnection $waterConnection): Response
    {
        $waterConnection->load('owner');

        return Inertia::render('WaterConnections/Edit', [
            'waterConnection' => $waterConnection,
            'communities' => Owner::COMMUNITIES,
            'statuses' => WaterConnection::STATUSES,
            'filters' => $request->only(['search', 'community', 'status', 'payment_status']),
        ]);
    }

    /**
     * Actualizar la paja de agua especificada en el almacenamiento.
     */
    public function update(WaterConnectionRequest $request, WaterConnection $waterConnection): RedirectResponse
    {
        // No permitir cambiar el código ni el payment_status desde el formulario
        $validated = $request->safe()->except(['code', 'payment_status']);
        
        $waterConnection->update($validated);

        return redirect()->route('water-connections.index', $request->only(['search', 'community', 'status', 'payment_status']))
            ->with('success', 'Paja de agua actualizada exitosamente.');
    }

    /**
     * Eliminar la paja de agua especificada del almacenamiento (eliminación suave).
     */
    public function destroy(Request $request, WaterConnection $waterConnection): RedirectResponse
    {
        $waterConnection->delete();

        return back()->with('success', 'Paja de agua desactivada exitosamente.');
    }

    /**
     * Restaurar una paja de agua eliminada suavemente.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $waterConnection = WaterConnection::withTrashed()->findOrFail($id);
        $waterConnection->restore();

        return back()->with('success', 'Paja de agua restaurada exitosamente.');
    }

    /**
     * Buscar pajas de agua para autocompletar (endpoint API).
     */
    public function search(Request $request)
    {
        $search = $request->input('query', '');
        
        $waterConnections = WaterConnection::with('owner')
            ->search($search)
            ->where('status', 'activa')
            ->limit(10)
            ->get()
            ->map(function ($waterConnection) {
                return [
                    'id' => $waterConnection->id,
                    'code' => $waterConnection->code,
                    'owner_number' => $waterConnection->owner_number,
                    'community' => $waterConnection->community,
                    'status' => $waterConnection->status,
                    'owner' => [
                        'id' => $waterConnection->owner->id,
                        'name' => $waterConnection->owner->name,
                        'dui' => $waterConnection->owner->dui,
                        'formatted_dui' => $waterConnection->owner->formatted_dui,
                    ],
                ];
            });

        return response()->json($waterConnections);
    }

    /**
     * Obtener números de propietario usados en una comunidad específica
     * y sugerir el siguiente número disponible.
     */
    public function getOwnerNumbersByCommunity(Request $request)
    {
        $community = $request->input('community');
        
        if (!$community) {
            return response()->json([
                'used_numbers' => [],
                'last_numbers' => [],
                'suggested_next' => '1',
            ]);
        }

        // Obtener todos los números usados en esta comunidad (excluyendo soft deleted)
        $usedNumbers = WaterConnection::where('community', $community)
            ->whereNotNull('owner_number')
            ->pluck('owner_number')
            ->map(function ($number) {
                // Convertir a string y limpiar espacios
                return trim((string) $number);
            })
            ->filter()
            ->values()
            ->toArray();

        // Obtener los últimos 5 números registrados
        $lastNumbers = WaterConnection::with('owner')
            ->where('community', $community)
            ->whereNotNull('owner_number')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($wc) {
                return [
                    'owner_number' => trim((string) $wc->owner_number),
                    'owner_name' => $wc->owner->name,
                    'created_at' => $wc->created_at->format('d/m/Y'),
                ];
            });

        // Sugerir el siguiente número disponible
        $numericNumbers = array_filter($usedNumbers, function ($number) {
            return is_numeric($number);
        });

        if (empty($numericNumbers)) {
            $suggestedNext = '1';
        } else {
            $maxNumber = max(array_map('intval', $numericNumbers));
            $suggestedNext = (string) ($maxNumber + 1);
        }

        return response()->json([
            'used_numbers' => $usedNumbers,
            'last_numbers' => $lastNumbers,
            'suggested_next' => $suggestedNext,
            'total_count' => count($usedNumbers),
        ]);
    }

    /**
     * Generar un código único para la paja de agua.
     * Formato: WC-XXXXX (WC seguido de 5 dígitos con ceros a la izquierda)
     *
     * @return string
     */
    private function generateUniqueCode(): string
    {
        // Obtener el último código registrado
        $lastCode = WaterConnection::withTrashed()
            ->orderBy('code', 'desc')
            ->value('code');

        if ($lastCode) {
            // Extraer el número del código (WC-00001 -> 00001)
            $lastNumber = (int) substr($lastCode, 3);
            $newNumber = $lastNumber + 1;
        } else {
            // Primer código
            $newNumber = 1;
        }

        // Formatear con ceros a la izquierda
        return 'WC-' . str_pad($newNumber, 5, '0', STR_PAD_LEFT);
    }
}
