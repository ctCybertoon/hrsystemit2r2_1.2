<?php
namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller {

    public function index() {
        return response()->json(Location::all());
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required|string']);
        $location = Location::create($request->all());
        return response()->json($location, 201);
    }

    public function show($id) {
        return response()->json(Location::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $location = Location::findOrFail($id);
        $location->update($request->all());
        return response()->json($location);
    }

    public function destroy($id) {
        Location::findOrFail($id)->delete();
        return response()->json(['message' => 'Location deleted']);
    }
}