<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class EmployeeTax extends Model {
    protected $fillable = ['employee_id', 'tax_type_id', 'amount', 'tax_date'];

    protected $table = 'employee_tax'; 
    
    public function employee() {
        return $this->belongsTo(Employee::class);
    }
    public function taxType() {
        return $this->belongsTo(TaxType::class);
    }
}