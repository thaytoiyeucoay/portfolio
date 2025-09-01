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
};
