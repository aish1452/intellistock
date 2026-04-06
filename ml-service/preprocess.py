import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import pickle
import os

def prepare_data(sales_history: list[dict], window_size=60):
    df = pd.DataFrame(sales_history)
    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date')
    
    # Resample to daily freq and fill missing days with 0
    df = df.resample('D').sum().fillna(0)
    
    # Ensure we match at least window_size
    diff_len = window_size + 1 - len(df)
    if diff_len > 0:
        # Prepend zeros to make it exactly window_size + 1 length if needed
        # Or better just pad at the beginning
        pad_dates = pd.date_range(end=df.index[0] - pd.Timedelta(days=1), periods=diff_len, freq='D')
        pad_df = pd.DataFrame({'quantity': [0]*diff_len}, index=pad_dates)
        df = pd.concat([pad_df, df])
        
    data = df['quantity'].values.reshape(-1, 1)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    X, y = [], []
    for i in range(window_size, len(scaled_data)):
        X.append(scaled_data[i-window_size:i, 0])
        y.append(scaled_data[i, 0])
        
    X, y = np.array(X), np.array(y)
    
    if len(X) > 0:
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
    return X, y, scaler, df

def save_scaler(scaler, product_id, model_dir="./models"):
    os.makedirs(f"{model_dir}/{product_id}", exist_ok=True)
    with open(f"{model_dir}/{product_id}/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

def load_scaler(product_id, model_dir="./models"):
    try:
        with open(f"{model_dir}/{product_id}/scaler.pkl", "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        return None
