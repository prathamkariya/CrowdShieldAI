"""
CrowdShield AI - XGBoost Model Training Script
Trains two models:
  1. Risk Classifier (Low/Moderate/High/Critical)
  2. Crush Window Regressor (predicted minutes to crush)
"""

import os
import sys
import io
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, mean_absolute_error, mean_squared_error
from sklearn.utils.class_weight import compute_class_weight
import xgboost as xgb
import joblib

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# -- Config ------------------------------------------------
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'enriched_dataset.csv')

FEATURES = [
    'net_flow', 'occupancy_proxy', 'flow_to_width_ratio',
    'weather_encoded', 'rolling_pressure_5min', 'pressure_delta',
    'congestion_ratio', 'width_adjusted_density', 'composite_risk_score',
    'festival_peak', 'transport_arrival_burst'
]

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# -- Load Data ---------------------------------------------
print("[1/5] Loading dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"      Loaded {len(df)} rows, {len(df.columns)} columns")

# Verify all feature columns exist
missing = [f for f in FEATURES if f not in df.columns]
if missing:
    raise ValueError(f"Missing feature columns in dataset: {missing}")

# Show class distribution
print("\n[2/5] Risk Level Distribution:")
print(df['risk_level'].value_counts().to_string())
print()

# ==========================================================
# MODEL 1 - Risk Level Classifier
# ==========================================================
print("=" * 50)
print("[3/5] Training Model 1: Risk Level Classifier (XGBoost)")
print("=" * 50)

X = df[FEATURES].values
y_raw = df['risk_level'].values

# Encode labels
le = LabelEncoder()
y = le.fit_transform(y_raw)
print(f"      Label mapping: {dict(zip(le.classes_.tolist(), le.transform(le.classes_).tolist()))}")

# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"      Train: {len(X_train)}, Test: {len(X_test)}")

# Handle class imbalance with sample weights
unique_classes = np.unique(y_train)
class_weights = compute_class_weight('balanced', classes=unique_classes, y=y_train)
weight_dict = dict(zip(unique_classes.tolist(), class_weights.tolist()))
sample_weights = np.array([weight_dict[cls] for cls in y_train])
print(f"      Class weights computed for {len(weight_dict)} classes")

# Train classifier
classifier = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    use_label_encoder=False,
    eval_metric='mlogloss',
    random_state=42
)
classifier.fit(X_train, y_train, sample_weight=sample_weights)

# Evaluate
y_pred = classifier.predict(X_test)
print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# Save classifier & encoder
classifier_path = os.path.join(OUTPUT_DIR, 'risk_classifier.joblib')
encoder_path = os.path.join(OUTPUT_DIR, 'label_encoder.joblib')
joblib.dump(classifier, classifier_path)
joblib.dump(le, encoder_path)
print(f"      Saved: risk_classifier.joblib")
print(f"      Saved: label_encoder.joblib")

# ==========================================================
# MODEL 2 - Crush Window Regressor
# ==========================================================
print("\n" + "=" * 50)
print("[4/5] Training Model 2: Crush Window Regressor (XGBoost)")
print("=" * 50)

# Filter to non-Low risk only
df_risky = df[df['risk_level'] != 'Low'].copy()
print(f"      Filtered to {len(df_risky)} non-Low rows (from {len(df)} total)")

X_reg = df_risky[FEATURES].values
y_reg = df_risky['predicted_crush_window_min'].values

X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=42
)
print(f"      Train: {len(X_train_r)}, Test: {len(X_test_r)}")

# Train regressor
regressor = xgb.XGBRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
regressor.fit(X_train_r, y_train_r)

# Evaluate
y_pred_r = regressor.predict(X_test_r)
mae = mean_absolute_error(y_test_r, y_pred_r)
rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
print(f"\n--- Regression Metrics ---")
print(f"      MAE:  {mae:.3f} minutes")
print(f"      RMSE: {rmse:.3f} minutes")

# Save regressor
regressor_path = os.path.join(OUTPUT_DIR, 'crush_regressor.joblib')
joblib.dump(regressor, regressor_path)
print(f"      Saved: crush_regressor.joblib")

# -- Done --------------------------------------------------
print("\n" + "=" * 50)
print("[5/5] TRAINING COMPLETE")
print(f"      Models saved to: {OUTPUT_DIR}")
print(f"        - risk_classifier.joblib")
print(f"        - crush_regressor.joblib")
print(f"        - label_encoder.joblib")
print("=" * 50)
