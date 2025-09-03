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
};
