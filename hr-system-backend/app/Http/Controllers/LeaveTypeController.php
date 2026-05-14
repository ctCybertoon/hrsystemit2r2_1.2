<?php
namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller {

    public function index() {
        return response()->json(LeaveType::all());
    }

    public function store(Request $request) {
        $request->validate([
            'name'     => 'required|string',
            'max_days' => 'required|integer'
        ]);
        $leaveType = LeaveType::create($request->all());
        return response()->json($leaveType, 201);
    }

    public function show($id) {
        return response()->json(LeaveType::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $leaveType = LeaveType::findOrFail($id);
        $leaveType->update($request->all());
        return response()->json($leaveType);
    }

    public function destroy($id) {
        LeaveType::findOrFail($id)->delete();
        return response()->json(['message' => 'Leave type deleted']);
    }
}