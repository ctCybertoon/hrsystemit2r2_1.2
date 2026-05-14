<?php
namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller {

    public function index() {
        return response()->json(Department::all());
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required|string']);
        $dept = Department::create($request->all());
        return response()->json($dept, 201);
    }

    public function show($id) {
        return response()->json(Department::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $dept = Department::findOrFail($id);
        $dept->update($request->all());
        return response()->json($dept);
    }

    public function destroy($id) {
        Department::findOrFail($id)->delete();
        return response()->json(['message' => 'Department deleted']);
    }
}