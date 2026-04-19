"""
CrowdShield AI - ML Prediction Microservice
Flask server that loads pre-trained XGBoost models and exposes
a /predict endpoint for real-time risk classification.

Run: python ml_service.py
"""

import os
import sys
import io
import numpy as np
import joblib
from flask import Flask, request, jsonify

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# -- Config ------------------------------------------------
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

FEATURES = [
    'net_flow', 'occupancy_proxy', 'flow_to_width_ratio',
    'weather_encoded', 'rolling_pressure_5min', 'pressure_delta',
    'congestion_ratio', 'width_adjusted_density', 'composite_risk_score',
    'festival_peak', 'transport_arrival_burst'
]

# -- Load Models -------------------------------------------
print("[INIT] Loading ML models...")
try:
    classifier = joblib.load(os.path.join(MODEL_DIR, 'risk_classifier.joblib'))
    regressor = joblib.load(os.path.join(MODEL_DIR, 'crush_regressor.joblib'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.joblib'))
    print("[INIT] ML models loaded successfully")
    models_loaded = True
except FileNotFoundError as e:
    print(f"[ERROR] Model file not found: {e}")
    print("        Run train_model.py first to generate the model files.")
    sys.exit(1)

# -- Flask App ---------------------------------------------
app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "models_loaded": models_loaded,
        "service": "CrowdShield AI ML Microservice"
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Accepts sensor feature JSON, returns risk classification
    and crush window prediction.
    """
    try:
        data = request.get_json(force=True)

        # Validate all features are present
        missing = [f for f in FEATURES if f not in data]
        if missing:
            return jsonify({
                "error": f"Missing features: {missing}"
            }), 400

        # Build feature vector in exact order
        X = np.array([[float(data[f]) for f in FEATURES]])

        # -- Classification --------------------------------
        risk_encoded = classifier.predict(X)
        risk_label = label_encoder.inverse_transform(risk_encoded)[0]

        # Get class probabilities
        proba = classifier.predict_proba(X)[0]
        class_names = label_encoder.classes_
        probabilities = {name: round(float(p), 4) for name, p in zip(class_names, proba)}

        # Confidence = probability of the predicted class
        confidence = round(float(max(proba)), 4)

        # -- Regression (only for non-Low risk) ------------
        crush_window = None
        if risk_label != 'Low':
            crush_window_raw = regressor.predict(X)[0]
            crush_window = round(float(max(1, min(19, crush_window_raw))), 1)

        return jsonify({
            "risk_level": risk_label,
            "crush_window_min": crush_window,
            "confidence": confidence,
            "probabilities": probabilities
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -- Start Server ------------------------------------------
if __name__ == '__main__':
    print("\n==========================================")
    print("  CROWDSHIELD AI - ML SERVICE ON PORT 5001")
    print("==========================================\n")
    app.run(host='0.0.0.0', port=5001, debug=False)
