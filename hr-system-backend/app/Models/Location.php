<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Location extends Model {
    protected $fillable = ['name', 'address', 'city', 'country'];

    public function employees() {
        return $this->hasMany(Employee::class);
    }
}