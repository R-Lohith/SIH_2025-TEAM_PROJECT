from flask import Flask, request, jsonify
from generate_map import generate_map, get_route_osrm, get_location_fuzzy
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Correct Excel path (use raw string or os.path.join)
excel_file = r"F:\SIH\client\TamilWards\tn_enhanced_safety_analysis_20250915_122616.xlsx"

@app.route('/generate_route', methods=['GET'])
def gen_route():
    from_place = request.args.get('from')
    to_place = request.args.get('to')
    mode = request.args.get('mode', 'car')

    if not from_place or not to_place:
        return jsonify({"error": "Missing 'from' or 'to' parameters"}), 400

    # Check if Excel file exists
    if not os.path.exists(excel_file):
        return jsonify({"error": f"Excel file not found at {excel_file}"}), 500

    try:
        from_lat, from_lon, _, _ = get_location_fuzzy(from_place, excel_file)
        to_lat, to_lon, _, _ = get_location_fuzzy(to_place, excel_file)
    except Exception as e:
        return jsonify({"error": f"Failed to read Excel: {str(e)}"}), 500

    if None in [from_lat, from_lon, to_lat, to_lon]:
        return jsonify({"error": "One or both places not found in the data"}), 400

    # Get route
    try:
        route_coords = get_route_osrm(from_lat, from_lon, to_lat, to_lon, profile=mode)
        _, html = generate_map(from_place, to_place, mode)
    except Exception as e:
        return jsonify({"error": f"Route generation failed: {str(e)}"}), 500

    return jsonify({
        'html': html,
        'directions': route_coords,
        'from': {'lat': from_lat, 'lng': from_lon, 'address': from_place},
        'to': {'lat': to_lat, 'lng': to_lon, 'address': to_place},
        'transportMode': mode,
        'duration': len(route_coords) * 0.5,  # Placeholder
        'distance': len(route_coords) * 0.1   # Placeholder
    }), 200


@app.route('/generate_and_save_route', methods=['GET'])
def generate_and_save_route():
    from_place = request.args.get('from')
    to_place = request.args.get('to')
    mode = request.args.get('mode', 'car')

    if not from_place or not to_place:
        return jsonify({"error": "Missing 'from' or 'to' parameters"}), 400

    try:
        filename, _ = generate_map(from_place, to_place, mode, '../public')
    except Exception as e:
        return jsonify({"error": f"Failed to generate map: {str(e)}"}), 500

    return jsonify({"filename": filename}), 200


if __name__ == '__main__':
    app.run(port=5001, debug=True)
