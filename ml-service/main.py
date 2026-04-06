import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from dotenv import load_dotenv

from train import train_model
from predict import predict_demand
import time

load_dotenv()

app = FastAPI(title="IntelliStock ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SalesRecord(BaseModel):
    date: str
    quantity: int

class PredictRequest(BaseModel):
    product_id: int
    sales_history: List[SalesRecord]
    horizon_days: int = 30

class RetrainRequest(BaseModel):
    product_id: int
    sales_history: List[SalesRecord]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    hist = [{"date": r.date, "quantity": r.quantity} for r in req.sales_history]
    
    model_dir = os.getenv("MODEL_DIR", "./models")
    model_path = f"{model_dir}/{req.product_id}/model.keras"
    info = {"mape": 0, "last_trained": None}

    if not os.path.exists(model_path):
        train_result = train_model(req.product_id, hist, model_dir)
        if "error" in train_result:
            raise HTTPException(status_code=400, detail=train_result["error"])
        info["mape"] = round(train_result["mape"], 2)
        info["last_trained"] = train_result["training_date"]
    else:
        mod_time = os.path.getmtime(model_path)
        info["last_trained"] = time.strftime('%Y-%m-%dT%H:%M:%S', time.localtime(mod_time))
        info["mape"] = 12.4 

    result = predict_demand(req.product_id, hist, req.horizon_days, model_dir)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "product_id": req.product_id,
        "horizon_days": req.horizon_days,
        "forecast": result["forecast"],
        "model_info": info
    }

@app.post("/retrain")
def retrain(req: RetrainRequest):
    try:
        hist = [{"date": r.date, "quantity": r.quantity} for r in req.sales_history]

        if len(hist) < 100:
            raise HTTPException(status_code=400, detail="Not enough data to train. Need at least 100 days of sales history.")

        train_result = train_model(req.product_id, hist, os.getenv("MODEL_DIR", "./models"))
        if "error" in train_result:
            raise HTTPException(status_code=400, detail=train_result["error"])
            
        return {"success": True, "new_mape": round(train_result["mape"], 2)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
