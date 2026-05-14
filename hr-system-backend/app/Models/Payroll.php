<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model {
    protected $table = 'payroll'; // ✅ add this line
    
    protected $fillable = [
        'employee_id', 'basic_pay', 'overtime_pay',
        'deductions', 'net_pay', 'pay_date'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}