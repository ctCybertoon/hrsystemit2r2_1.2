<?php
namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller {

    public function index() {
        return response()->json(
            Employee::with(['user', 'department', 'location'])->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'user_id'       => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'location_id'   => 'required|exists:locations,id',
            'first_name'    => 'required|string',
            'last_name'     => 'required|string',
            'email'         => 'required|email|unique:employees',
            'position'      => 'required|string',
            'salary'        => 'required|numeric',
            'hire_date'     => 'required|date',
        ]);

        $employee = Employee::create($request->all());
        return response()->json($employee, 201);
    }

    public function show($id) {
        $employee = Employee::with(['user', 'department', 'location'])->findOrFail($id);
        return response()->json($employee);
    }

    public function update(Request $request, $id) {
        $employee = Employee::findOrFail($id);
        $employee->update($request->all());
        return response()->json($employee);
    }

    public function destroy($id) {
        Employee::findOrFail($id)->delete();
        return response()->json(['message' => 'Employee deleted']);
    }
}