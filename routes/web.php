<?php

use App\Http\Controllers\MonthlyPaymentController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\WaterConnectionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rutas de propietarios
    Route::resource('owners', OwnerController::class)->withTrashed(['show', 'edit']);
    Route::post('/owners/{id}/restore', [OwnerController::class, 'restore'])->name('owners.restore');
    
    // API de búsqueda de propietarios
    Route::get('/api/owners/search', [OwnerController::class, 'search'])->name('owners.search');

    // Rutas de pajas de agua
    Route::resource('water-connections', WaterConnectionController::class)->withTrashed(['show', 'edit']);
    Route::post('/water-connections/{id}/restore', [WaterConnectionController::class, 'restore'])->name('water-connections.restore');
    
    // API de búsqueda de pajas de agua
    Route::get('/api/water-connections/search', [WaterConnectionController::class, 'search'])->name('water-connections.search');
    
    // API para búsqueda de pajas para punto de cobro
    Route::get('/api/water-connections/search-for-payment', [WaterConnectionController::class, 'searchForPayment'])->name('water-connections.search-payment');
    
    // API para obtener números de propietario por comunidad
    Route::get('/api/water-connections/owner-numbers-by-community', [WaterConnectionController::class, 'getOwnerNumbersByCommunity'])->name('water-connections.owner-numbers-by-community');

    // Rutas de pagos mensuales
    Route::resource('monthly-payments', MonthlyPaymentController::class)->only(['index', 'create', 'store', 'show']);
});

require __DIR__.'/auth.php';
