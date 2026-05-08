# 🧬 Helix23 — AI-Based Genomic Risk Stratification & Drug Response Prediction

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-Transformer-EE4C2C?style=for-the-badge&logo=pytorch)
![TensorFlow](https://img.shields.io/badge/TensorFlow-DNN-FF6F00?style=for-the-badge&logo=tensorflow)
![FastAPI](https://img.shields.io/badge/FastAPI-ML%20Backend-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![IEEE](https://img.shields.io/badge/IEEE-ADSSSC%202026-00629B?style=for-the-badge&logo=ieee)

**Accepted at ADSSSC IEEE Conference 2026 — Sahrdaya College of Engineering & Technology, Kerala**

*Final Year B.Tech Computer Engineering Major Project — University of Mumbai*

*Indian Copyright Registered — Certificate No. LD-20250179327*

</div>

---

##  Overview

**Helix23** is a research-grade, full-stack clinical decision support system that uses deep learning to solve two precision medicine problems simultaneously:

**1. Genomic Risk Stratification** — Classifies patients into 5 risk categories (Very Low → Very High) by integrating real-world genetic variant data from ClinVar, GWAS Catalog, and the 1000 Genomes Project across ~1,000 patients.

**2. Drug Response Prediction** — Predicts whether a patient's response to a drug will be Effective, Resistant, or Toxic using pharmacogenomics data from PharmGKB covering 1,068 drugs and 1,195 genes.

### Novel Contributions
- **VICS** — Variant Impact Composite Score: integrates ClinVar pathogenicity, GWAS effect sizes, population allele frequencies, and functional consequence severity into a single continuous [0,1] risk score
- **GBS** — Gene Burden Score: aggregates variant-level VICS across genes, validated against known disease genes (BRCA1, CFTR, LDLR)
- **BioBERT Embeddings** — Semantic encoding of clinical significance descriptions, disease/trait annotations, study metadata, and molecular consequences into 324 categorical features

---

##  Model Results

### Genomic Risk Stratification (Transformer)
| Metric | Value |
|---|---|
| Test Accuracy | **83.05%** |
| Test Samples | 3,396,734 |
| Best Validation Accuracy | 87.42% |
| High-Risk Precision | **98%** |
| Very Low Risk Recall | **100%** |
| Val–Test Gap | < 5% |

### Drug Response Prediction (DNN — Best Model)
| Metric | Value |
|---|---|
| Test Accuracy | **97.92%** |
| Test F1-Score | 97.93% |
| Toxic Class Recall | **88.52%** (only 2.53% of data) |
| Val–Test Gap | **+0.08%** |

---

##  System Architecture

```
┌──────────────────────────────────────────────────────────┐
│              React + Vite Frontend (Tailwind)             │
│                     localhost:5173                        │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼──────────────────────────────┐
│           Node.js / Express REST API (JWT Auth)           │
│              MongoDB Database — localhost:5000            │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼──────────────────────────────┐
│         FastAPI ML Backend — localhost:8000               │
│  Genomic Risk Transformer (best_model.pt, input_dim=320) │
│  Drug Response DNN (dnn_best_model.h5)                   │
└──────────────────────────────────────────────────────────┘
```

---

##  ML Models & Datasets

### Model 1: Genomic Risk Stratification

**Architecture:** Multi-head self-attention Transformer (256 embed dim, 8 heads, 4 layers)

**Datasets:**
- ClinVar (58,916 clinical variant annotations, even chromosomes 2–22)
- GWAS Catalog (genome-wide association studies, p-value < 5×10⁻⁸)
- 1000 Genomes Project Phase 3 (~1,000 patients, 5 continental ancestry groups)

**Feature Engineering (1,387 total features):**
- 53 engineered numeric features: VICS, GBS, ASAFD (5 populations), HWE deviation, LD clustering, Phase I/II/Transport/Target pathway loads, MDIRS, gene centrality, chromosomal density
- 10 PCA components (68.3% variance explained)
- 324 BioBERT text embedding features (MC: 50-dim, CLNSIG: 30-dim, DISEASE: 100-dim, STUDY: 75-dim, JOURNAL: 25-dim)
- ~1,000 patient genotype columns

**Per-Class Test Performance:**
| Risk Category | Support | Precision | Recall | F1 |
|---|---|---|---|---|
| Very Low | 2,348,981 (69.2%) | 0.81 | **1.00** | 0.89 |
| Low | 310,128 (9.1%) | 0.94 | 0.20 | 0.32 |
| Moderate | 109,925 (3.2%) | 0.89 | 0.24 | 0.38 |
| High | 272,173 (8.0%) | **0.98** | 0.81 | 0.88 |
| Very High | 355,527 (10.5%) | **0.96** | 0.49 | 0.65 |

---

### Model 2: Drug Response Prediction

**Architecture:** Deep Neural Network — 256 → 128 → 64 → 3 classes with dropout (0.5, 0.4, 0.3), BatchNorm, L1/L2 regularization, class weights

**Dataset:** PharmGKB (16,038 pharmacogenomic associations, 1,068 drugs, 1,195 genes)

**Feature Engineering (476 total):**
- CYP family features (CYP1/2/3/4 membership)
- Drug mechanism binary indicators (10 classes: Anticoagulant, Immunosuppressant, Analgesic, etc.)
- Allele impact scoring (star allele nomenclature)
- Metabolizer phenotype scores (Poor=1 → Ultrarapid=5)
- Drug-gene interaction frequency matrix
- Text-derived features from pharmacogenomic sentences

**Ensemble Models also trained:** Random Forest, Extra Trees, XGBoost, LightGBM, CatBoost, Stacking Ensemble (all >94% test accuracy, all val-test gap <1.1%)

**Target classes:** 0 = Resistant (43.9%), 1 = Effective (53.6%), 2 = Toxic (2.5%)

---

##  Tech Stack

| Layer | Technology |
|---|---|
| ML Models | PyTorch (Transformer), TensorFlow/Keras (DNN), scikit-learn, XGBoost, LightGBM, CatBoost |
| Text Embeddings | BioBERT (S-PubMedBERT-MS-MARCO via sentence-transformers) |
| ML Backend | Python, FastAPI, Uvicorn |
| REST API | Node.js, Express.js |
| Database | MongoDB |
| Frontend | React, Vite, Tailwind CSS |
| Auth | JWT |

---

##  Running Locally

You need **3 terminals** running simultaneously. Run them in this order.

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally on port 27017

---

### Terminal 1 — ML API (FastAPI)

```bash
cd ml_api

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install fastapi uvicorn torch scikit-learn pandas numpy

# Start the ML server
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

 Expected output:
```
Uvicorn running on http://0.0.0.0:8000
Model loaded on cpu (input_dim=320)
```

> Note: A sklearn version warning on startup is harmless — ignore it.

---

### Terminal 2 — Node.js Backend

```bash
cd server

npm install

# Create a .env file inside /server with these two lines:
# MONGO_URI=mongodb://127.0.0.1:27017/helix23
# JWT_SECRET=yoursecretkey

node server.js
```

 Expected output:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected
```

---

### Terminal 3 — React Frontend

```bash
cd client

npm install

npm run dev
```

 Open **http://localhost:5173** in your browser.

---

##  Project Structure

```
Helix23-Final/
├── ml_api/
│   ├── app.py               # FastAPI prediction endpoints
│   └── best_model.pt        # Trained PyTorch Transformer (~38MB)
├── server/
│   ├── server.js            # Express entry point
│   ├── routes/              # API route definitions
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # MongoDB schemas
│   └── config/              # DB config
├── client/
│   ├── src/                 # React components and pages
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

##  Research Paper

**Title:** AI-Based Genomic Risk Stratification and Drug Response Prediction: A Multi-Modal Deep Learning Framework

**Conference:** [ADSSSC IEEE Conference 2026](https://adsssc.sahrdaya.ac.in/) — Sahrdaya College of Engineering & Technology, Thrissur, Kerala (April 9–10, 2026)

**Paper ID:** 817 | Status: **Accepted**

**Authors:**
| Name | Institution |
|---|---|
| Abdul Jawad Parkar | Pillai College of Engineering, New Panvel |
| Vinayak Sathisan MV | Pillai College of Engineering, New Panvel |
| Aryan Prasad Oak | Pillai College of Engineering, New Panvel |
| Atharva Shankar Kalokhe | Pillai College of Engineering, New Panvel |

**Supervisor:** Prof. Rashmi Gourkar, Pillai College of Engineering

**Copyright:** Indian Copyright Certificate No. LD-20250179327, Application No. LD-41361/2025-CO (dated 13/10/2025)

---

##  Full Results Summary

| Model | Test Accuracy | F1-Score | Val–Test Gap |
|---|---|---|---|
| Genomic Risk Transformer | 83.05% | 0.80 | Stable |
| Drug Response DNN | 97.92% | 97.93% | +0.08% |
| LightGBM | 97.80% | 97.80% | 0.00% |
| XGBoost | 97.59% | 97.53% | +0.29% |
| Stacking Ensemble | 97.59% | 97.62% | +0.04% |

---

# Demo Video

Click below to watch the complete working demo of the project:

[▶ Watch Working Demo](demo/Working-demo.mp4)

---

##  Notes

- `best_model.pt` (Transformer) is required for the genomic risk endpoint — do not delete
- ML API defaults to CPU; CUDA GPU is supported automatically if available
- MongoDB must be running locally before starting the Node server
- The sklearn version warning on API startup is non-critical and can be ignored
- Even-numbered chromosomes only (2, 4, 6, 8 ... 22) were used for training — full genome expansion is future work

---

##  License

MIT License — see [LICENSE](./LICENSE)
