import os
import numpy as np
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from preprocess import prepare_data, save_scaler
from model import build_lstm_model
from datetime import datetime

def train_model(product_id, sales_data, model_dir="./models", window_size=90):
    X, y, scaler, df = prepare_data(sales_data, window_size=window_size)
    
    if len(X) < 10: # Not enough data
        return {"error": "Not enough data to train model. Minimum required sequences not met."}

    # Chronological split (80/20)
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    # If not enough validation data, use all for train
    if len(X_val) == 0:
        X_train, y_train = X, y
        X_val, y_val = X, y

    model = build_lstm_model(window_size)
    
    os.makedirs(f"{model_dir}/{product_id}", exist_ok=True)
    model_path = f"{model_dir}/{product_id}/model.keras"
    
    callbacks = [
        EarlyStopping(patience=10, restore_best_weights=True),
        ModelCheckpoint(model_path, save_best_only=True)
    ]
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=16,
        callbacks=callbacks,
        verbose=0
    )
    
    # Save the trained model and scaler
    model.save(model_path)
    save_scaler(scaler, product_id, model_dir)
    
    # Calculate simple MAPE on val set
    y_pred = model.predict(X_val)
    y_pred_inv = scaler.inverse_transform(y_pred)
    y_val_inv = scaler.inverse_transform(y_val.reshape(-1, 1))
    
    # Avoid div by zero
    y_val_inv_safe = np.where(y_val_inv == 0, 1e-5, y_val_inv)
    mape = np.mean(np.abs((y_val_inv - y_pred_inv) / y_val_inv_safe)) * 100
    mae = np.mean(np.abs(y_val_inv - y_pred_inv))

    return {
        "mape": float(mape),
        "mae": float(mae),
        "training_date": datetime.now().isoformat()
    }
