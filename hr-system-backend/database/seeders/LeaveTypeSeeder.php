<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder {
    public function run(): void {
        $types = [
            ['name' => 'Vacation Leave',   'max_days' => 15, 'description' => 'Annual vacation leave'],
            ['name' => 'Sick Leave',        'max_days' => 15, 'description' => 'Medical or health-related leave'],
            ['name' => 'Emergency Leave',   'max_days' => 5,  'description' => 'Unexpected emergency situations'],
            ['name' => 'Maternity Leave',   'max_days' => 105,'description' => 'Leave for childbirth'],
            ['name' => 'Paternity Leave',   'max_days' => 7,  'description' => 'Leave for new fathers'],
            ['name' => 'Bereavement Leave', 'max_days' => 3,  'description' => 'Leave due to death of a family member'],
        ];

        foreach ($types as $type) {
            LeaveType::create($type);
        }
    }
}