<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model {
    protected $table = 'attendance'; // ✅ add this

    protected $fillable = [
        'employee_id', 'date', 'time_in', 'time_out', 'status'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}