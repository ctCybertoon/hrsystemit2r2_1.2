<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class LeaveAppointment extends Model {
    protected $fillable = [
        'employee_id', 'leave_type_id',
        'start_date', 'end_date', 'reason', 'status'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
    public function leaveType() {
        return $this->belongsTo(LeaveType::class);
    }
}