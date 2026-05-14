<?php
namespace App\Http\Controllers;

use App\Models\LeaveAppointment;
use Illuminate\Http\Request;

class LeaveAppointmentController extends Controller {

    public function index() {
        return response()->json(
            LeaveAppointment::with(['employee', 'leaveType'])->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'reason'        => 'nullable|string',
        ]);
        $leave = LeaveAppointment::create($request->all());
        return response()->json($leave, 201);
    }

    public function show($id) {
        return response()->json(
            LeaveAppointment::with(['employee', 'leaveType'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id) {
        $leave = LeaveAppointment::findOrFail($id);
        $leave->update($request->all());
        return response()->json($leave);
    }

    public function destroy($id) {
        LeaveAppointment::findOrFail($id)->delete();
        return response()->json(['message' => 'Leave appointment deleted']);
    }

    public function approve($id) {
        $leave = LeaveAppointment::findOrFail($id);
        $leave->update(['status' => 'approved']);
        return response()->json(['message' => 'Leave approved']);
    }

    public function reject($id) {
        $leave = LeaveAppointment::findOrFail($id);
        $leave->update(['status' => 'rejected']);
        return response()->json(['message' => 'Leave rejected']);
    }
}