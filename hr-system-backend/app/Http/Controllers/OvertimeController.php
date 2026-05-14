<?php
namespace App\Http\Controllers;

use App\Models\OvertimeRecord;
use Illuminate\Http\Request;

class OvertimeController extends Controller {

    public function index() {
        return response()->json(
            OvertimeRecord::with('employee')->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'hours'       => 'required|numeric|min:0',
        ]);
        $overtime = OvertimeRecord::create($request->all());
        return response()->json($overtime, 201);
    }

    public function show($id) {
        return response()->json(OvertimeRecord::with('employee')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $overtime = OvertimeRecord::findOrFail($id);
        $overtime->update($request->all());
        return response()->json($overtime);
    }

    public function destroy($id) {
        OvertimeRecord::findOrFail($id)->delete();
        return response()->json(['message' => 'Overtime record deleted']);
    }
}