<?php
namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller {

    public function index() {
        return response()->json(
            Attendance::with('employee')->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'time_in'     => 'nullable|date_format:H:i',
            'time_out'    => 'nullable|date_format:H:i',
            'status'      => 'in:present,absent,late'
        ]);
        $attendance = Attendance::create($request->all());
        return response()->json($attendance, 201);
    }

    public function show($id) {
        return response()->json(Attendance::with('employee')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $attendance = Attendance::findOrFail($id);
        $attendance->update($request->all());
        return response()->json($attendance);
    }

    public function destroy($id) {
        Attendance::findOrFail($id)->delete();
        return response()->json(['message' => 'Attendance record deleted']);
    }
}