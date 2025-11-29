<?php

use App\Http\Controllers\InstallmentPlanController;
use App\Http\Controllers\MonthlyPaymentController;
use App\Http\Controllers\OtherPaymentController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\UnifiedPaymentController;
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

    // Rutas de pagos unificados (nuevo flujo multi-tipo)
    Route::resource('payments', UnifiedPaymentController::class)->only(['create', 'store', 'show']);

    // Rutas de planes de cuotas
    Route::resource('installment-plans', InstallmentPlanController::class)->withTrashed(['show', 'edit']);
    Route::post('/installment-plans/{id}/restore', [InstallmentPlanController::class, 'restore'])->name('installment-plans.restore');
    Route::post('/installment-plans/{installment_plan}/cancel', [InstallmentPlanController::class, 'cancel'])->name('installment-plans.cancel');
    Route::post('/installment-plans/{installment_plan}/reactivate', [InstallmentPlanController::class, 'reactivate'])->name('installment-plans.reactivate');
    
    // Rutas de pagos de cuotas
    Route::get('/installment-plans/{installment_plan}/create-payment', [InstallmentPlanController::class, 'createPayment'])->name('installment-plans.create-payment');
    Route::post('/installment-plans/{installment_plan}/payments', [InstallmentPlanController::class, 'storePayment'])->name('installment-plans.store-payment');
    Route::get('/installment-plans/{installment_plan}/payments/{payment}/receipt', [InstallmentPlanController::class, 'showPaymentReceipt'])->name('installment-plans.payment-receipt');
    
    // API de planes de cuotas
    Route::get('/api/installment-plans/by-connection/{waterConnectionId}', [InstallmentPlanController::class, 'getByConnection'])->name('installment-plans.by-connection');
    Route::get('/api/installment-plans/{installment_plan}/pending-installments', [InstallmentPlanController::class, 'getPendingInstallments'])->name('installment-plans.pending-installments');
    
    // Rutas de otros pagos
    Route::resource('other-payments', OtherPaymentController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::post('/other-payments/{id}/restore', [OtherPaymentController::class, 'restore'])->name('other-payments.restore');
    
    // API de otros pagos
    Route::get('/api/other-payments/by-connection', [OtherPaymentController::class, 'getByWaterConnection'])->name('other-payments.by-connection');
    Route::get('/api/other-payments/stats-by-type', [OtherPaymentController::class, 'getStatsByType'])->name('other-payments.stats-by-type');
});

require __DIR__.'/auth.php';
