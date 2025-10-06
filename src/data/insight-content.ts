export type InsightContent = {
  title: string;
  content: string; // Markdown with GFM + math
};

// Map slug -> content
export const INSIGHT_CONTENT: Record<string, InsightContent> = {
  "gpu-vs-cpu": {
    title: "GPU vs CPU cho AI/ML",
    content: `

The comparison between **GPU (Graphics Processing Unit)** and **CPU (Central Processing Unit)** is central to understanding the computational demands of Artificial Intelligence (AI) and Machine Learning (ML). Both are indispensable, yet they are designed with fundamentally different architectures and trade-offs.

## Architectural Characteristics
- **CPU**: Designed for *low-latency* operations and versatility. Typically contains 4–64 cores, each with large caches and sophisticated control logic. Excellent at handling sequential tasks, complex branching, and operating system (OS)-level multitasking.
- **GPU**: Designed for *high-throughput* computing with thousands of simpler cores. Specialized for Single Instruction, Multiple Data (SIMD) execution, which is ideal for matrix multiplications and tensor operations in neural networks.

## Performance Considerations
- **Training Phase**: Deep learning training involves billions of parameters and matrix operations. GPUs can provide **10×–100× acceleration** compared to CPUs due to parallelization.
- **Inference Phase**: Performance depends on model size and environment. CPUs are efficient for small, latency-sensitive models on edge devices, while GPUs dominate in large-scale inference and batch processing in data centers.
- **Memory Bandwidth**: GPUs provide higher bandwidth (e.g., 600+ GB/s) compared to CPUs (~100 GB/s), which is crucial for large tensor computations.

## Cost and Energy Efficiency
- **CPUs**: Lower initial cost, energy-efficient for small workloads, suitable for cloud-based microservices and real-time inference.  
- **GPUs**: Higher cost and power consumption but reduce total training time, making them more cost-effective for large-scale projects.

## Application Context
- **CPUs excel** in: data preprocessing, feature engineering, running traditional ML algorithms (e.g., decision trees, SVMs), and lightweight inference at the edge.  
- **GPUs excel** in: deep learning, reinforcement learning, large-scale simulation, and workloads requiring massive parallelism.  

## Hybrid Trend
Modern AI/ML pipelines increasingly adopt **heterogeneous computing**, where CPUs orchestrate task scheduling, preprocessing, and model deployment, while GPUs handle heavy tensor computation. This synergy leverages the strengths of both.  

---

**References**:  
- Patterson, D. & Hennessy, J. (2017). *Computer Organization and Design: RISC-V Edition*. Morgan Kaufmann.  
- NVIDIA. (2020). [GPU vs CPU Differences](https://developer.nvidia.com/blog/cpu-gpu-heterogeneous-computing/).  
- Jouppi, N. P. et al. (2017). "In-Datacenter Performance Analysis of a Tensor Processing Unit." *ISCA*.  
     
-----
-----     
`
  },
  "fake-news-gnn": {
    title: "Fake News Detection with GNN",
    content: `# Fake News Detection with GNN

Graph Neural Networks (GNNs) model relationships among users, posts, and publishers rather than treating each article as an independent text sample. This captures the propagation structure of misinformation.

## Why GNN over pure text models?
- Text-only models (BERT, RoBERTa) rely on linguistic signals; they struggle when adversaries paraphrase content.
- GNN adds graph context: who shared the post, how communities interact, and temporal cascade patterns.

## Graph schema
- Nodes: { User, Post, Publisher }
- Edges: (User)-[shares]->(Post), (Publisher)-[publishes]->(Post), (User)-[follows]->(User)

A typical hetero-graph uses a Relational-GCN or Heterogeneous GAT to learn type-specific message passing.

## Training objective
Binary classification on posts: real vs fake. Loss:

$$
\mathcal{L}= -\frac{1}{N} \sum_{i=1}^{N} \big[y_i\log p_i + (1-y_i)\log(1-p_i)\big]
$$

where $p_i$ is the predicted probability from the post embedding after GNN layers.

## Practical tips
- Cold-start: bootstrap with text encoder (e.g., MiniLM) and fuse with GNN output.
- Imbalance: use focal loss or class-weighted BCE.
- Robustness: apply time-split evaluation to avoid leakage across propagation cascades.

## Takeaway
GNNs complement text classifiers by leveraging propagation and social context—key signals for detecting coordinated misinformation.
`
  },
  "captioning-ai": {
    title: "Image Captioning with CNN/ViT + Transformer",
    content: `# Image Captioning with CNN/ViT + Transformer

Image captioning generates natural language descriptions of images by bridging vision encoders and language decoders.

## Architecture
- Vision encoder: CNN (ResNet) or ViT to obtain a sequence of visual tokens.
- Text decoder: Transformer (causal) attends to visual tokens.
- Training: teacher forcing with cross-entropy; fine-tune with RL (CIDEr optimization) if needed.

## Loss
Given target sequence $y_{1:T}$ and logits $z_t$:

$$ \mathcal{L}_{CE} = -\sum_{t=1}^{T} \log \, \mathrm{softmax}(z_t)[y_t] $$

## Evaluation
- BLEU, METEOR, ROUGE-L, CIDEr.
- Human eval for fluency and faithfulness.

## Tips
- Use CLIP-ViT as encoder for stronger semantics.
- Beam search or nucleus sampling depending on precision vs creativity.
- Add object tags (DETIC/OWL-ViT) as prompts to improve coverage.
`
  },
  "vector-db-101": {
    title: "Vector Databases 101 for RAG",
    content: `# Vector Databases 101 for RAG

Retrieval-Augmented Generation (RAG) relies on a vector database to fetch semantically similar chunks given a query embedding.

## Core steps
1. Chunking documents (by tokens or semantic boundaries).
2. Embedding chunks and queries (e.g., bge, e5, OpenAI, Cohere).
3. Indexing with ANN structures (HNSW, IVF-PQ, ScaNN).
4. Query-time reranking (cross-encoder) and fusion (MMR, Recency).

## Similarity
For normalized embeddings, cosine similarity equals dot product:

$$ s(\mathbf{q},\mathbf{x}) = \frac{\mathbf{q}\cdot\mathbf{x}}{\|\mathbf{q}\|\,\|\mathbf{x}\|} $$

## Quality levers
- Good chunking (titles, section headers) boosts recall.
- Domain-specific embeddings improve precision.
- Reranking and metadata filters reduce hallucination.

## Popular choices
- Pinecone, Weaviate, Milvus, Qdrant, FAISS.

## Takeaway
Treat the vector DB as a relevance engine—optimize data prep, embeddings, and ranking as much as model prompting.
`
  },
  "lora-qlora": {
    title: "Fine-tuning LLMs with LoRA & QLoRA",
    content: `# Fine-tuning LLMs with LoRA & QLoRA

Low-Rank Adaptation (LoRA) injects trainable low-rank matrices into attention and MLP layers, drastically reducing trainable params. QLoRA quantizes base weights (4-bit) and trains LoRA adapters on top—minimal VRAM, strong quality.

## LoRA
For weight $W \\in \\mathbb{R}^{d_{out}\\times d_{in}}$, learn $\\Delta W = A B$ where $A\\in\\mathbb{R}^{d_{out}\\times r}, B\\in\\mathbb{R}^{r\\times d_{in}}$ and rank $r\\ll \\min(d_{out},d_{in})$.

## QLoRA
- Base model in 4-bit (NF4) with double quantization.
- Optimizer: Paged AdamW to handle memory spikes.
- Train only adapters; merge at export if needed.

## Tips
- Choose small r (4–16) first; scale if underfit.
- Freeze norm/embeddings; tune target modules (q, k, v, o, mlp).
- Validate with task-specific metrics (BLEU, Rouge, accuracy).

## When to use
- Domain adaptation, style control, instruction tuning with limited budget.
`
  },
  "llm-serving-scale": {
    title: "LLM Serving at Scale (vLLM & TensorRT-LLM)",
    content: `# LLM Serving at Scale (vLLM & TensorRT-LLM)

Serving large models requires efficient KV cache management, batching, and kernel fusion.

## vLLM
- PagedAttention for dynamic KV cache paging.
- Continuous batching to keep GPUs saturated.
- OpenAI-compatible server; great for throughput.

## TensorRT-LLM
- Graph optimization and kernel fusion on NVIDIA GPUs.
- FP8/INT8 with calibration for latency gains.
- Strong single-query latency and deployment to Triton.

## Practical notes
- Pin batch sizes per SKU; measure TTFT and TPOT.
- Enable CUDA graphs where possible.
- Profile with Nsight Systems; watch HtoD copies and memory fragmentation.

## Takeaway
Pick vLLM for easy, high-throughput serving; use TensorRT-LLM for low-latency GPU-optimized paths.
`
  },
  "prompt-engineering": {
    title: "Prompt Engineering cho AI",
    content: `# Prompt Engineering cho AI

Prompt engineering là nghệ thuật thiết kế đầu vào để AI models hoạt động hiệu quả nhất. Đây là skill quan trọng trong kỷ nguyên LLM.

## Các kỹ thuật cơ bản

### 1. Zero-shot Prompting
Đưa ra instruction trực tiếp mà không có example:
\`\`\`
"Phân loại email sau đây: spam hoặc không spam"
\`\`\`

### 2. Few-shot Learning
Cung cấp một vài ví dụ trước khi yêu cầu:
\`\`\`
Email: "Chúc mừng! Bạn đã thắng 1 tỷ đồng..." → Spam
Email: "Họp team lúc 2h chiều nay" → Không spam
Email: "Click link này để nhận quà..." → ?
\`\`\`

### 3. Chain-of-Thought (CoT)
Yêu cầu AI suy nghĩ từng bước:
\`\`\`
"Giải bài toán này từng bước:
Bước 1: Xác định dữ liệu đã cho
Bước 2: Áp dụng công thức
Bước 3: Tính toán"
\`\`\`

## Best Practices

### Cấu trúc prompt rõ ràng
- **Role**: "Bạn là chuyên gia AI..."  
- **Context**: "Dựa trên dữ liệu sau..."
- **Task**: "Hãy phân tích và đưa ra..."
- **Format**: "Trả lời theo định dạng JSON"

### Các ký tự đặc biệt
- \`###\` để phân tách sections
- \`"""\` để bao quanh văn bản cần xử lý
- \`[SYSTEM]\`, \`[USER]\`, \`[ASSISTANT]\` cho role-based prompts

## Advanced Techniques

### ReAct (Reasoning + Acting)
\`\`\`
Thought: Tôi cần tìm thông tin về dân số Việt Nam
Action: search("dân số Việt Nam 2024")
Observation: Kết quả cho thấy...
Thought: Bây giờ tôi có đủ thông tin để trả lời
\`\`\`

### Tree of Thoughts
Khám phá nhiều hướng suy nghĩ song song để tìm giải pháp tối ưu.

## Lưu ý khi implement

### 1. Context Length
- Theo dõi token limit của model
- Sử dụng sliding window cho văn bản dài
- Prioritize thông tin quan trọng nhất

### 2. Temperature Settings
- Low (0.1-0.3): Cho factual tasks
- Medium (0.5-0.7): Cho creative tasks  
- High (0.8-1.0): Cho brainstorming

### 3. Testing & Iteration
- A/B test different prompt versions
- Measure performance với metrics cụ thể
- Collect user feedback để cải thiện

## Takeaway
Prompt engineering không chỉ là viết instruction - đó là thiết kế conversation flow hiệu quả giữa human và AI.
`
  },
  "mlops-docker-k8s": {
    title: "MLOps với Docker & Kubernetes",
    content: `# MLOps với Docker & Kubernetes

MLOps pipeline production-ready cần containerization và orchestration để scale và maintain models hiệu quả.

## Docker cho ML Models

### Dockerfile Structure
\`\`\`dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model artifacts
COPY models/ /app/models/
COPY src/ /app/src/

WORKDIR /app
EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### Multi-stage Build
\`\`\`dockerfile
# Build stage
FROM python:3.9 as builder
RUN pip install --user torch torchvision

# Runtime stage  
FROM python:3.9-slim
COPY --from=builder /root/.local /root/.local
\`\`\`

## Kubernetes Deployment

### Deployment YAML
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model-api
  template:
    metadata:
      labels:
        app: ml-model-api
    spec:
      containers:
      - name: api
        image: ml-model:v1.0.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
          limits:
            memory: "2Gi" 
            cpu: "1000m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
\`\`\`

### Service & Ingress
\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model-api
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ml-model-ingress
spec:
  rules:
  - host: ml-api.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ml-model-service
            port:
              number: 80
\`\`\`

## Monitoring & Observability

### Metrics Collection
- **Prometheus** cho system metrics
- **Grafana** cho visualization
- **Custom metrics**: prediction latency, accuracy, drift detection

### Logging Strategy
\`\`\`python
import logging
import json

logger = logging.getLogger(__name__)

def log_prediction(input_data, prediction, confidence, latency):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "prediction": prediction,
        "confidence": confidence,
        "latency_ms": latency,
        "input_hash": hashlib.md5(str(input_data).encode()).hexdigest()
    }
    logger.info(json.dumps(log_entry))
\`\`\`

## CI/CD Pipeline

### GitLab CI Example
\`\`\`yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - pytest tests/
    - python -m pytest --cov=src tests/

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/ml-model-api api=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/ml-model-api
  only:
    - main
\`\`\`

## Best Practices

### 1. Model Versioning
- Semantic versioning cho models
- Model registry (MLflow, DVC)
- A/B testing infrastructure

### 2. Resource Management
- GPU node pools cho training
- CPU nodes cho inference
- Horizontal Pod Autoscaler based on metrics

### 3. Security
- Image scanning với Trivy/Clair
- Secret management với Vault
- Network policies để isolate workloads

## Takeaway
MLOps success = reliable containerization + robust orchestration + comprehensive monitoring + automated CI/CD.
`
  },
};
