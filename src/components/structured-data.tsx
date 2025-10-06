export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "#person",
        "name": "Khánh Duy Bùi",
        "alternateName": "Duy Bùi",
        "description": "AI Engineer & Full-Stack Developer specialized in LLM, RAG, Computer Vision, and modern web technologies.",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "image": "/avatar.jpg",
        "sameAs": [
          "https://www.linkedin.com/in/khanhduyhust160804",
          "https://github.com/thaytoiyeucoay"
        ],
        "jobTitle": "AI Engineer & Full-Stack Developer",
        "worksFor": {
          "@type": "EducationalOrganization",
          "name": "Hanoi University of Science and Technology"
        },
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Hanoi University of Science and Technology"
        },
        "knowsAbout": [
          "Artificial Intelligence",
          "Machine Learning",
          "Deep Learning",
          "Large Language Models",
          "RAG Systems",
          "Computer Vision",
          "Natural Language Processing",
          "React",
          "Next.js",
          "PyTorch",
          "TensorFlow",
          "LangChain"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Hai Phong",
          "addressCountry": "Vietnam"
        },
        "email": "duy.bk1608@gmail.com",
        "telephone": "+84862607525"
      },
      {
        "@type": "WebSite",
        "@id": "#website",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "name": "Khánh Duy Bùi Portfolio",
        "description": "AI Engineer & Full-Stack Developer Portfolio showcasing projects in Machine Learning, RAG Systems, and modern web development.",
        "publisher": {
          "@id": "#person"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "WebPage",
        "@id": "#webpage",
        "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "name": "Khánh Duy Bùi — AI Engineer & Full-Stack Developer Portfolio",
        "isPartOf": {
          "@id": "#website"
        },
        "about": {
          "@id": "#person"
        },
        "description": "Portfolio of Khánh Duy Bùi - AI Engineer & Full-Stack Developer. Featuring projects in Machine Learning, RAG Systems, Emotion Detection, and modern web applications.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            }
          ]
        }
      },
      {
        "@type": "ItemList",
        "name": "AI & Development Projects",
        "description": "Portfolio projects showcasing AI and full-stack development skills",
        "itemListElement": [
          {
            "@type": "SoftwareApplication",
            "position": 1,
            "name": "Chatbot RAG System",
            "description": "Document-based question answering system using Retrieval-Augmented Generation",
            "applicationCategory": "AI Application",
            "operatingSystem": "Web Browser"
          },
          {
            "@type": "SoftwareApplication", 
            "position": 2,
            "name": "Emotion Detection",
            "description": "Text emotion analysis using Hugging Face Transformers",
            "applicationCategory": "AI Application",
            "operatingSystem": "Web Browser"
          },
          {
            "@type": "SoftwareApplication",
            "position": 3,
            "name": "Cat vs Dog Classifier",
            "description": "Image classification using TensorFlow.js and MobileNet",
            "applicationCategory": "AI Application", 
            "operatingSystem": "Web Browser"
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
