// Dữ liệu thông tin cá nhân cho RAG
export const personalData = {
  basicInfo: {
    name: "Khánh Duy Bùi",
    title: "AI Engineer",
    location: "Vietnam",
    email: "contact@khanhduy.dev",
    linkedin: "https://linkedin.com/in/khanhduy-bui",
    github: "https://github.com/khanhduy-bui"
  },
  
  education: [
    {
      degree: "Bachelor of Computer Science",
      school: "University of Technology",
      year: "2020-2024",
      gpa: "3.8/4.0",
      achievements: [
        "Graduated with honors",
        "Best thesis award in AI/ML track",
        "Dean's list for 6 consecutive semesters"
      ]
    }
  ],
  
  experience: [
    {
      position: "AI Engineer",
      company: "Tech Innovation Lab",
      duration: "2024 - Present",
      responsibilities: [
        "Developed and deployed machine learning models for production systems",
        "Built RAG (Retrieval-Augmented Generation) systems using LangChain and vector databases",
        "Implemented computer vision solutions for automated quality control",
        "Collaborated with cross-functional teams to integrate AI solutions into existing products"
      ],
      technologies: ["Python", "TensorFlow", "PyTorch", "LangChain", "FastAPI", "Docker"]
    },
    {
      position: "Machine Learning Intern",
      company: "AI Startup Inc",
      duration: "Summer 2023",
      responsibilities: [
        "Assisted in developing NLP models for text classification",
        "Performed data preprocessing and feature engineering",
        "Created data visualization dashboards using Streamlit"
      ],
      technologies: ["Python", "Scikit-learn", "Pandas", "Streamlit", "SQL"]
    }
  ],
  
  skills: {
    programming: ["Python", "JavaScript", "TypeScript", "Java", "C++"],
    aiml: [
      "Machine Learning", "Deep Learning", "Natural Language Processing",
      "Computer Vision", "RAG Systems", "LLM Fine-tuning"
    ],
    frameworks: [
      "TensorFlow", "PyTorch", "LangChain", "Hugging Face Transformers",
      "React", "Next.js", "FastAPI", "Flask"
    ],
    tools: ["Docker", "Git", "AWS", "Google Cloud", "Jupyter", "VS Code"],
    databases: ["PostgreSQL", "MongoDB", "Pinecone", "Chroma", "SQLite"]
  },
  
  projects: [
    {
      name: "AI-Powered Portfolio Website",
      description: "Personal portfolio with integrated RAG chatbot using Next.js, Gemini AI, and vector search",
      technologies: ["Next.js", "TypeScript", "Gemini AI", "SQLite", "Tailwind CSS"],
      features: [
        "Interactive 3D animations with Three.js",
        "RAG-based chatbot for answering questions about experience",
        "Real-time project showcase with live demos",
        "Responsive design with modern UI/UX"
      ],
      github: "https://github.com/khanhduy-bui/portfolio",
      demo: "https://khanhduy.dev"
    },
    {
      name: "Smart Document Analysis System",
      description: "RAG system for analyzing and querying large document collections",
      technologies: ["Python", "LangChain", "Pinecone", "Streamlit", "OpenAI"],
      features: [
        "Multi-format document ingestion (PDF, DOCX, TXT)",
        "Semantic search with vector embeddings",
        "Question-answering with source citations",
        "Real-time document processing pipeline"
      ]
    },
    {
      name: "Computer Vision Quality Control",
      description: "Automated defect detection system for manufacturing",
      technologies: ["Python", "OpenCV", "TensorFlow", "FastAPI", "Docker"],
      features: [
        "Real-time image processing and analysis",
        "Custom CNN model for defect classification",
        "REST API for integration with production systems",
        "Performance monitoring and alerting"
      ]
    },
    {
      name: "Fake News Detection with GNN",
      description: "Graph Neural Network approach to identify misinformation",
      technologies: ["Python", "PyTorch Geometric", "NetworkX", "BERT"],
      features: [
        "Social network analysis for news propagation patterns",
        "Multi-modal approach combining text and graph features",
        "Real-time classification with 92% accuracy",
        "Explainable AI for decision transparency"
      ]
    }
  ],
  
  achievements: [
    "Winner of National AI Competition 2023",
    "Published research paper on 'Efficient RAG Systems for Vietnamese Language'",
    "Speaker at Vietnam AI Summit 2024",
    "Contributor to open-source ML libraries with 500+ GitHub stars"
  ],
  
  interests: [
    "Artificial Intelligence and Machine Learning",
    "Large Language Models and RAG Systems",
    "Computer Vision and Image Processing",
    "Open Source Development",
    "Tech Innovation and Startups"
  ],
  
  languages: [
    { language: "Vietnamese", level: "Native" },
    { language: "English", level: "Fluent (IELTS 7.5)" },
    { language: "Japanese", level: "Basic (N4)" }
  ]
};

// Chuyển đổi dữ liệu thành text để tạo embeddings
export function getPersonalDataAsText(): string {
  const data = personalData;
  
  return `
# Thông tin cá nhân - Khánh Duy Bùi

## Thông tin cơ bản
Tên: ${data.basicInfo.name}
Chức danh: ${data.basicInfo.title}
Địa điểm: ${data.basicInfo.location}
Email: ${data.basicInfo.email}
LinkedIn: ${data.basicInfo.linkedin}
GitHub: ${data.basicInfo.github}

## Học vấn
${data.education.map(edu => `
- ${edu.degree} tại ${edu.school} (${edu.year})
- GPA: ${edu.gpa}
- Thành tích: ${edu.achievements.join(', ')}
`).join('\n')}

## Kinh nghiệm làm việc
${data.experience.map(exp => `
### ${exp.position} tại ${exp.company} (${exp.duration})
Trách nhiệm:
${exp.responsibilities.map(r => `- ${r}`).join('\n')}
Công nghệ: ${exp.technologies.join(', ')}
`).join('\n')}

## Kỹ năng
### Lập trình: ${data.skills.programming.join(', ')}
### AI/ML: ${data.skills.aiml.join(', ')}
### Frameworks: ${data.skills.frameworks.join(', ')}
### Tools: ${data.skills.tools.join(', ')}
### Databases: ${data.skills.databases.join(', ')}

## Dự án nổi bật
${data.projects.map(project => `
### ${project.name}
${project.description}
Công nghệ: ${project.technologies.join(', ')}
Tính năng:
${project.features.map(f => `- ${f}`).join('\n')}
${project.github ? `GitHub: ${project.github}` : ''}
${project.demo ? `Demo: ${project.demo}` : ''}
`).join('\n')}

## Thành tích
${data.achievements.map(achievement => `- ${achievement}`).join('\n')}

## Sở thích
${data.interests.map(interest => `- ${interest}`).join('\n')}

## Ngôn ngữ
${data.languages.map(lang => `- ${lang.language}: ${lang.level}`).join('\n')}
`;
}
