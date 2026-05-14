<?php
namespace App\Http\Controllers;

use App\Models\EmployeeTax;
use App\Models\TaxType;
use Illuminate\Http\Request;

class TaxController extends Controller {

    public function index() {
        return response()->json(
            EmployeeTax::with(['employee', 'taxType'])->get()
        );
    }

    public function store(Request $request) {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'tax_type_id' => 'required|exists:tax_types,id',
            'amount'      => 'required|numeric',
            'tax_date'    => 'required|date',
        ]);
        $tax = EmployeeTax::create($request->all());
        return response()->json($tax, 201);
    }

    public function show($id) {
        return response()->json(EmployeeTax::with(['employee', 'taxType'])->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $tax = EmployeeTax::findOrFail($id);
        $tax->update($request->all());
        return response()->json($tax);
    }

    public function destroy($id) {
        EmployeeTax::findOrFail($id)->delete();
        return response()->json(['message' => 'Tax record deleted']);
    }

    public function taxTypes() {
        return response()->json(TaxType::all());
    }
}