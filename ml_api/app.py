from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import RobustScaler

INVALID_INPUT_DETAIL = "Invalid data, enter correct data"


class MultiHeadAttention(nn.Module):
    def __init__(self, embed_dim, num_heads, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(
            embed_dim, num_heads, dropout=dropout, batch_first=True
        )
        self.norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        x = x.unsqueeze(1)
        attn_out, _ = self.attention(x, x, x)
        x = self.norm(x + self.dropout(attn_out))
        return x.squeeze(1)


class GenomicRiskTransformer(nn.Module):
    def __init__(
        self, input_dim, embed_dim=256, num_heads=8, num_layers=4, num_classes=5, dropout=0.3
    ):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, embed_dim),
            nn.LayerNorm(embed_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
        )
        self.attention_layers = nn.ModuleList(
            [MultiHeadAttention(embed_dim, num_heads, dropout) for _ in range(num_layers)]
        )
        self.ff_layers = nn.ModuleList(
            [
                nn.Sequential(
                    nn.Linear(embed_dim, embed_dim * 4),
                    nn.GELU(),
                    nn.Dropout(dropout),
                    nn.Linear(embed_dim * 4, embed_dim),
                    nn.LayerNorm(embed_dim),
                    nn.Dropout(dropout),
                )
                for _ in range(num_layers)
            ]
        )
        self.risk_head = nn.Sequential(
            nn.Linear(embed_dim, embed_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(embed_dim // 2, embed_dim // 4),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(embed_dim // 4, num_classes),
        )

    def forward(self, x):
        x = self.input_proj(x)
        for attn, ff in zip(self.attention_layers, self.ff_layers):
            x = x + attn(x)
            x = x + ff(x)
        return self.risk_head(x)


app = FastAPI(title="Genomic Risk Stratification API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientData(BaseModel):
    features: list[float]


RISK_CLASSES = [
    "Very Low Risk",
    "Low Risk",
    "Moderate Risk",
    "High Risk",
    "Very High Risk",
]

DRUG_DESCRIPTIONS = {
    "Effective": "Favorable genomic signal for expected treatment benefit.",
    "Resistant": "Intermediate genomic signal with possible reduced response.",
    "Toxic": "Elevated genomic signal for adverse drug response.",
}


@app.on_event("startup")
def load_model():
    global model, scaler, device

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_path = Path(__file__).parent / "best_model.pt"
    if not model_path.exists():
        raise RuntimeError(f"Model checkpoint not found at {model_path}")

    try:
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    except TypeError:
        checkpoint = torch.load(model_path, map_location=device)
    state_dict = checkpoint["model_state_dict"]
    scaler_state = checkpoint["scaler_state"]

    scaler = RobustScaler()
    scaler.__dict__.update(scaler_state.__dict__)

    input_dim = state_dict["input_proj.0.weight"].shape[1]
    model = GenomicRiskTransformer(
        input_dim=input_dim,
        embed_dim=256,
        num_heads=8,
        num_layers=4,
        num_classes=5,
        dropout=0.3,
    ).to(device)
    model.load_state_dict(state_dict)
    model.eval()

    print(f"Model loaded on {device} (input_dim={input_dim})")


def _prepare_features(features: list[float]) -> np.ndarray:
    data = np.array(features, dtype=np.float32).reshape(1, -1)

    expected_dim = model.input_proj[0].in_features
    if data.shape[1] < expected_dim:
        padded = np.zeros((1, expected_dim), dtype=np.float32)
        padded[:, : data.shape[1]] = data
        data = padded
    elif data.shape[1] > expected_dim:
        data = data[:, :expected_dim]

    if not np.isfinite(data).all():
        raise HTTPException(status_code=400, detail=INVALID_INPUT_DETAIL)

    non_zero_count = int(np.count_nonzero(np.abs(data) > 1e-9))
    if non_zero_count < 8:
        raise HTTPException(status_code=400, detail=INVALID_INPUT_DETAIL)

    if float(np.std(data)) < 1e-8:
        raise HTTPException(status_code=400, detail=INVALID_INPUT_DETAIL)

    return data


def _infer(data: np.ndarray):
    scaled = scaler.transform(data)
    x_tensor = torch.tensor(scaled, dtype=torch.float32).to(device)

    with torch.no_grad():
        logits = model(x_tensor)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()

    pred_idx = int(np.argmax(probs))
    return pred_idx, probs


def _risk_payload(pred_idx: int, probs: np.ndarray):
    return {
        "predicted_risk_level": RISK_CLASSES[pred_idx],
        "confidence": f"{probs[pred_idx] * 100:.2f}%",
        "probabilities": {
            RISK_CLASSES[i]: float(probs[i]) for i in range(len(RISK_CLASSES))
        },
    }


def _drug_payload(probs: np.ndarray):
    response_probabilities = {
        "Effective": float(probs[0] + probs[1]),
        "Resistant": float(probs[2]),
        "Toxic": float(probs[3] + probs[4]),
    }

    classification = max(response_probabilities, key=response_probabilities.get)
    confidence = response_probabilities[classification]

    top_signals = sorted(
        [(RISK_CLASSES[i], float(probs[i])) for i in range(len(RISK_CLASSES))],
        key=lambda item: item[1],
        reverse=True,
    )[:2]
    top_signal_text = ", ".join(
        [f"{label} ({score * 100:.1f}%)" for label, score in top_signals]
    )

    return {
        "classification": classification,
        "confidence": f"{confidence * 100:.2f}%",
        "description": DRUG_DESCRIPTIONS[classification],
        "why": (
            f"Derived from strongest risk signals: {top_signal_text}."
            if top_signal_text
            else "Derived from model probability distribution."
        ),
        "response_probabilities": response_probabilities,
        "risk_probabilities": {
            RISK_CLASSES[i]: float(probs[i]) for i in range(len(RISK_CLASSES))
        },
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict_risk(data: PatientData):
    try:
        features = _prepare_features(data.features)
        pred_idx, probs = _infer(features)
        return _risk_payload(pred_idx, probs)
    except HTTPException as error:
        raise error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/predict/drug")
def predict_drug(data: PatientData):
    try:
        features = _prepare_features(data.features)
        _, probs = _infer(features)
        return _drug_payload(probs)
    except HTTPException as error:
        raise error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
