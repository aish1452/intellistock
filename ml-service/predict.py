import os
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from preprocess import load_scaler, prepare_data

def predict_demand(product_id, sales_history, horizon_days, model_dir="./models", window_size=90):
    model_path = f"{model_dir}/{product_id}/model.keras"
    
    if not os.path.exists(model_path):
        return {"error": "Model not found. Please train first."}

    model = load_model(model_path)
    scaler = load_scaler(product_id, model_dir)
    
    if scaler is None:
        return {"error": "Scaler not found."}

    X_hist, y_hist, _, df = prepare_data(sales_history, window_size)
    if len(X_hist) == 0:
        return {"error": "Not enough history to start prediction. Need at least 90 days."}

    # Get the last sequence of window_size days
    current_sequence = X_hist[-1].reshape(1, window_size, 1)
    
    predictions = []
    
    # Simple rolling standard deviation for CI based on recent data
    recent_quantities = df['quantity'].values[-window_size:]
    rolling_std = np.std(recent_quantities) if len(recent_quantities) > 0 else 5
    
    last_date = df.index[-1]
    
    for i in range(horizon_days):
        # Predict one step
        pred = model.predict(current_sequence, verbose=0)[0][0]
        
        # Add to predictions
        pred_date = last_date + pd.Timedelta(days=i+1)
        predictions.append((pred_date, pred))
        
        # Shift sequence
        current_sequence = np.append(current_sequence[0][1:], [[pred]], axis=0)
        current_sequence = current_sequence.reshape(1, window_size, 1)

    # Inverse transform
    pred_vals = np.array([p[1] for p in predictions]).reshape(-1, 1)
    pred_vals_inv = scaler.inverse_transform(pred_vals).flatten()
    
    forecast = []
    for i in range(horizon_days):
        date_str = predictions[i][0].strftime('%Y-%m-%d')
        val = float(pred_vals_inv[i])
        if val < 0:
            val = 0
            
        ci_margin = 1.96 * rolling_std
        lower_ci = max(0, val - ci_margin)
        upper_ci = val + ci_margin
        
        forecast.append({
            "date": date_str,
            "predicted_quantity": round(val),
            "lower_ci": round(lower_ci),
            "upper_ci": round(upper_ci)
        })

    return {"forecast": forecast}
