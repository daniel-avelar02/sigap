<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Http\Requests\OwnerRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OwnerController extends Controller
{
    /**
     * Mostrar una lista de los propietarios.
     */
    public function index(Request $request): Response
    {
        $query = Owner::query();

        // Aplicar filtro de búsqueda
        if ($search = $request->input('search')) {
            $query->search($search);
        }

        // Aplicar filtro de comunidad
        if ($community = $request->input('community')) {
            $query->byCommunity($community);
        }

        // Aplicar filtro de estado (activo/inactivo/todos)
        $status = $request->input('status', 'all');
        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'inactive') {
            $query->onlyTrashed();
        } else {
            // 'all' - incluir tanto activos como inactivos
            $query->withTrashed();
        }

        // Aplicar ordenamiento
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $owners = $query->paginate(15)
            ->withQueryString();

        return Inertia::render('Owners/Index', [
            'owners' => $owners,
            'filters' => $request->only(['search', 'community', 'status', 'sort_by', 'sort_order']),
            'communities' => Owner::COMMUNITIES,
        ]);
    }

    /**
     * Mostrar el formulario para crear un nuevo propietario.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Owners/Create', [
            'communities' => Owner::COMMUNITIES,
            'filters' => $request->only(['search', 'community', 'status']),
        ]);
    }

    /**
     * Almacenar un nuevo propietario en el almacenamiento.
     */
    public function store(OwnerRequest $request): RedirectResponse
    {
        Owner::create($request->validated());

        return redirect()->route('owners.index', $request->only(['search', 'community', 'status']))
            ->with('success', 'Propietario creado exitosamente.');
    }

    /**
     * Mostrar los detalles del propietario especificado.
     */
    public function show(Request $request, Owner $owner): Response
    {
        // Cargar la relación de pajas cuando esté implementada
        // $owner->load('waterConnections');
        
        return Inertia::render('Owners/Show', [
            'owner' => $owner,
            'waterConnectionsCount' => 0, // Placeholder
            'filters' => $request->only(['search', 'community', 'status']),
        ]);
    }

    /**
     * Mostrar el formulario para editar el propietario especificado.
     */
    public function edit(Request $request, Owner $owner): Response
    {
        return Inertia::render('Owners/Edit', [
            'owner' => $owner,
            'communities' => Owner::COMMUNITIES,
            'filters' => $request->only(['search', 'community', 'status']),
        ]);
    }

    /**
     * Actualizar el propietario especificado en el almacenamiento.
     */
    public function update(OwnerRequest $request, Owner $owner): RedirectResponse
    {
        $owner->update($request->validated());

        return redirect()->route('owners.index', $request->only(['search', 'community', 'status']))
            ->with('success', 'Propietario actualizado exitosamente.');
    }

    /**
     * Eliminar el propietario especificado del almacenamiento (eliminación suave).
     */
    public function destroy(Request $request, Owner $owner): RedirectResponse
    {
        $owner->delete();

        return back()->with('success', 'Propietario desactivado exitosamente.');
    }

    /**
     * Restaurar un propietario eliminado suavemente.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $owner = Owner::withTrashed()->findOrFail($id);
        $owner->restore();

        return back()->with('success', 'Propietario restaurado exitosamente.');
    }

    /**
     * Buscar propietarios para autocompletar (endpoint API).
     */
    public function search(Request $request)
    {
        $search = $request->input('query', '');
        
        $owners = Owner::search($search)
            ->active()
            ->limit(10)
            ->get()
            ->map(function ($owner) {
                return [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'dui' => $owner->dui,
                    'formatted_dui' => $owner->formatted_dui,
                    'community' => $owner->community,
                    'phone' => $owner->phone,
                    'address' => $owner->address,
                ];
            });

        return response()->json($owners);
    }
}
