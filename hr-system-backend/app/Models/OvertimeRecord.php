<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OvertimeRecord extends Model {
    protected $fillable = ['employee_id', 'date', 'hours', 'status'];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }
}
