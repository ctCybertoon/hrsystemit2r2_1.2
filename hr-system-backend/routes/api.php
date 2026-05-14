<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\LeaveAppointmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\TaxController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/users', function() {
        return response()->json(\App\Models\User::all());
    });
    Route::delete('/users/{id}', function($id) {
        \App\Models\User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);

        });

    Route::apiResource('employees',         EmployeeController::class);
    Route::apiResource('departments',       DepartmentController::class);
    Route::apiResource('locations',         LocationController::class);
    Route::apiResource('leave-types',       LeaveTypeController::class);
    Route::apiResource('leave-appointments',LeaveAppointmentController::class);
    Route::apiResource('attendance',        AttendanceController::class);
    Route::apiResource('overtime',          OvertimeController::class);
    Route::apiResource('payroll',           PayrollController::class);
    Route::apiResource('tax',               TaxController::class);

    // Extra leave actions
    Route::patch('/leave-appointments/{id}/approve', [LeaveAppointmentController::class, 'approve']);
    Route::patch('/leave-appointments/{id}/reject',  [LeaveAppointmentController::class, 'reject']);

    // Tax types list
    Route::get('/tax-types', [TaxController::class, 'taxTypes']);
});