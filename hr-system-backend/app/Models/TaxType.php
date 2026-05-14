<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TaxType extends Model {
    protected $fillable = ['name', 'rate', 'description'];

    public function employeeTax() {
        return $this->hasMany(EmployeeTax::class);
    }
}