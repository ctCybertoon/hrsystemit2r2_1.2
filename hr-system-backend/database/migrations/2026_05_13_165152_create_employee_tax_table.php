<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('employee_tax', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('tax_type_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('tax_date');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('employee_tax');
    }
};