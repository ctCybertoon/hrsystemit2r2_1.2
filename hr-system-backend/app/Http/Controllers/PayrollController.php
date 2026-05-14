<?php
namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;

class PayrollController extends Controller {

    public function index() {
        return response()->json(
            Payroll::with('employee')->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'employee_id'  => 'required|exists:employees,id',
            'basic_pay'    => 'required|numeric',
            'overtime_pay' => 'nullable|numeric',
            'deductions'   => 'nullable|numeric',
            'net_pay'      => 'required|numeric',
            'pay_date'     => 'required|date',
        ]);
        $payroll = Payroll::create($request->all());
        return response()->json($payroll, 201);
    }

    public function show($id) {
        return response()->json(Payroll::with('employee')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $payroll = Payroll::findOrFail($id);
        $payroll->update($request->all());
        return response()->json($payroll);
    }

    public function destroy($id) {
        Payroll::findOrFail($id)->delete();
        return response()->json(['message' => 'Payroll record deleted']);
    }
}