<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder {
    public function run(): void {
        // Create department and location first
        $department = Department::create([
            'name' => 'Human Resources',
            'description' => 'HR Department'
        ]);

        $location = Location::create([
            'name' => 'Main Office',
            'address' => 'Lapasan',
            'city' => 'CDO',
            'country' => 'Philippines'
        ]);

        // Create employee user
        $user = User::create([
            'username' => 'employee1',
            'email'    => 'employee1@hr.com',
            'password' => Hash::make('employee123'),
            'role'     => 'employee',
        ]);

        Employee::create([
            'user_id'       => $user->id,
            'department_id' => $department->id,
            'location_id'   => $location->id,
            'first_name'    => 'Juan',
            'last_name'     => 'Dela Cruz',
            'email'         => 'employee1@hr.com',
            'phone'         => '09123456789',
            'position'      => 'Staff',
            'salary'        => 25000,
            'hire_date'     => '2024-01-01',
            'status'        => 'active',
        ]);
    }
}