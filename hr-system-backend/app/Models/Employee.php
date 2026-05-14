<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model {
    protected $fillable = [
        'user_id', 'department_id', 'location_id',
        'first_name', 'last_name', 'email', 'phone',
        'position', 'salary', 'hire_date', 'status'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function department() {
        return $this->belongsTo(Department::class);
    }
    public function location() {
        return $this->belongsTo(Location::class);
    }
    public function leaveAppointments() {
        return $this->hasMany(LeaveAppointment::class);
    }
    public function attendance() {
        return $this->hasMany(Attendance::class);
    }
    public function overtimeRecords() {
        return $this->hasMany(OvertimeRecord::class);
    }
    public function payroll() {
        return $this->hasMany(Payroll::class);
    }
    public function employeeTax() {
        return $this->hasMany(EmployeeTax::class);
    }
}
