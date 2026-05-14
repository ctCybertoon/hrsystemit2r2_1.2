<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payroll', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->decimal('basic_pay', 10, 2);
            $table->decimal('overtime_pay', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('net_pay', 10, 2);
            $table->date('pay_date');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('payroll');
    }
};