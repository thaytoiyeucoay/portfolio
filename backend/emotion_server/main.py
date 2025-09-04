import os
import json
import math
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from huggingface_hub import snapshot_download, list_repo_files
except Exception:
    snapshot_download = None  # type: ignore
    list_repo_files = None  # type: ignore

import tensorflow as tf

app = FastAPI(title="Local Emotion Model Server", version="0.1.0")

# Environment variables
HF_REPO = os.environ.get("HF_REPO", "duybk/emotionsdetect")
MODEL_DIR = os.environ.get("MODEL_DIR", "")  # if provided, use local path instead of HF
TOP_K_DEFAULT = int(os.environ.get("TOP_K", "6"))

# Globals
model = None
labels: Optional[List[str]] = None


def load_labels_if_any(path: str) -> Optional[List[str]]:
    # Try common filenames
    for name in ["labels.json", "label_map.json", "id2label.json"]:
        fp = os.path.join(path, name)
        if os.path.exists(fp):
            try:
                with open(fp, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # Support formats: ["joy", "sadness", ...] or {"0": "joy", ...}
                if isinstance(data, list):
                    return [str(x) for x in data]
                if isinstance(data, dict):
                    # sort by numeric key if possible
                    try:
                        return [data[str(i)] for i in range(len(data))]
                    except Exception:
                        # fallback to values order
                        return list(data.values())
            except Exception:
                continue
    return None


def ensure_model_loaded():
    global model, labels
    if model is not None:
        return

    if MODEL_DIR:
        local_dir = MODEL_DIR
    else:
        if snapshot_download is None:
            raise RuntimeError("huggingface_hub not installed. Please pip install huggingface_hub or set MODEL_DIR.")
        local_dir = snapshot_download(
            repo_id=HF_REPO,
            allow_patterns=[
                "model.keras",
                "saved_model.pb",
                "variables/*",
                "assets/*",
                "labels.json",
                "label_map.json",
                "id2label.json",
            ],
            local_dir=os.environ.get("CACHE_DIR", None),
            local_dir_use_symlinks=False,
        )

    # Try load Keras single-file first
    keras_path = os.path.join(local_dir, "model.keras")
    if os.path.exists(keras_path):
        m = tf.keras.models.load_model(keras_path, compile=False)
    else:
        # Assume SavedModel directory structure
        m = tf.keras.models.load_model(local_dir, compile=False)

    model = m
    labels = load_labels_if_any(local_dir)


class PredictRequest(BaseModel):
    text: str
    top_k: Optional[int] = None


@app.post("/predict")
def predict(req: PredictRequest):
    try:
        ensure_model_loaded()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model load error: {e}")

    if not req.text or not isinstance(req.text, str):
        raise HTTPException(status_code=400, detail="Missing 'text' as string")

    top_k = req.top_k or TOP_K_DEFAULT

    try:
        # Many Keras text models embed preprocessing; they can accept raw string input
        # Shape [batch], dtype string
        inputs = tf.convert_to_tensor([req.text])
        preds = model.predict(inputs, verbose=0)
        # preds could be a list or a tensor
        if isinstance(preds, list):
            preds = preds[0]
        if hasattr(preds, "numpy"):
            preds = preds.numpy()
        # Expect shape (1, C)
        if len(preds.shape) == 1:
            scores = preds
        else:
            scores = preds[0]
        # Apply softmax if not in [0,1]
        if (scores < 0).any() or (scores > 1).any() or not math.isclose(float(scores.sum()), 1.0, rel_tol=1e-2):
            # assume logits
            exp = tf.exp(scores - tf.reduce_max(scores))
            scores = (exp / tf.reduce_sum(exp)).numpy()
        # Build label-score pairs
        if labels and len(labels) == len(scores):
            pairs = [{"label": labels[i], "score": float(scores[i])} for i in range(len(scores))]
        else:
            pairs = [{"label": str(i), "score": float(scores[i])} for i in range(len(scores))]
        # Sort and top_k
        pairs.sort(key=lambda x: x["score"], reverse=True)
        return {"results": pairs[:top_k]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")


@app.get("/")
def root():
    return {"status": "ok", "repo": HF_REPO, "model_dir": MODEL_DIR or "hf_cache", "labels": bool(labels)}
