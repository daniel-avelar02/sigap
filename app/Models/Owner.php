<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Owner extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Tipos de propietarios
     */
    const OWNER_TYPES = [
        'natural' => 'Persona Natural',
        'organization' => 'Organización/Empresa',
    ];

    /**
     * Las 9 comunidades de la asociación de agua
     */
    const COMMUNITIES = [
        'La Pandeadura',
        'La Puerta',
        'Loma Larga',
        'Rodeo 1',
        'Rodeo 2',
        'San Francisco',
        'San Rafael',
        'San Rafael (Los Pinos)',
        'San Rafael (Los Pinos Cantarera)',
    ];

    /**
     * Mapeo de colores Tailwind para cada comunidad
     */
    const COMMUNITY_COLORS = [
        'La Pandeadura' => 'yellow',
        'La Puerta' => 'orange',
        'Loma Larga' => 'purple',
        'Rodeo 1' => 'red',
        'Rodeo 2' => 'pink',
        'San Francisco' => 'green',
        'San Rafael' => 'blue',
        'San Rafael (Los Pinos)' => 'cyan',
        'San Rafael (Los Pinos Cantarera)' => 'teal',
    ];

    /**
     * Los atributos que se pueden asignar en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'owner_type',
        'dui',
        'tax_id',
        'phone',
        'email',
        'address',
        'community',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    /**
     * Accessor para obtener el DUI formateado con guion
     *
     * @return string|null
     */
    public function getFormattedDuiAttribute(): ?string
    {
        if (!$this->dui) {
            return null;
        }
        
        // DUI: 8 dígitos + 1 verificador (12345678-9)
        if (strlen($this->dui) === 9) {
            return substr($this->dui, 0, 8) . '-' . substr($this->dui, 8, 1);
        }
        
        return $this->dui;
    }

    /**
     * Accessor para obtener el NIT formateado
     *
     * @return string|null
     */
    public function getFormattedTaxIdAttribute(): ?string
    {
        if (!$this->tax_id) {
            return null;
        }
        
        // Remover cualquier guion existente
        $clean = str_replace('-', '', $this->tax_id);
        
        // NIT: 0210-090676-001-4 (formato: 4-6-3-1)
        if (strlen($clean) === 14) {
            return substr($clean, 0, 4) . '-' . 
                   substr($clean, 4, 6) . '-' . 
                   substr($clean, 10, 3) . '-' . 
                   substr($clean, 13, 1);
        }
        
        return $this->tax_id;
    }

    /**
     * Accessor para obtener la identificación formateada según el tipo
     *
     * @return string|null
     */
    public function getFormattedIdentificationAttribute(): ?string
    {
        if ($this->owner_type === 'organization') {
            return $this->formatted_tax_id;
        }
        
        return $this->formatted_dui;
    }

    /**
     * Accessor para obtener el teléfono formateado con guion
     *
     * @return string|null
     */
    public function getFormattedPhoneAttribute(): ?string
    {
        if (!$this->phone || strlen($this->phone) !== 8) {
            return $this->phone;
        }
        
        return substr($this->phone, 0, 4) . '-' . substr($this->phone, 4, 4);
    }

    /**
     * Scope para buscar propietarios por nombre, DUI o NIT
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        // Remover guiones del término de búsqueda para DUI/NIT
        $searchClean = str_replace('-', '', $search);

        return $query->where(function ($q) use ($search, $searchClean) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('dui', 'like', "%{$searchClean}%")
              ->orWhere('tax_id', 'like', "%{$searchClean}%");
        });
    }

    /**
     * Scope para filtrar por comunidad
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $community
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCommunity($query, ?string $community)
    {
        if (!$community) {
            return $query;
        }

        return $query->where('community', $community);
    }

    /**
     * Scope para obtener solo propietarios activos
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    /**
     * Relación con pajas de agua (water connections)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function waterConnections(): HasMany
    {
        return $this->hasMany(WaterConnection::class);
    }
}
