// Ujjwal's Resume and Professional Data for AI Assistant
const resumeData = {
  // Basic information - Public, shareable information
  basics: {
    name: "Ujjwal Gupta",
    headline: "Computer Science Student & AI Enthusiast",
    summary: "Computer Science student at UT Dallas with expertise in AI/ML, augmented reality, and data analysis. Known for collaborative leadership and creative problem-solving skills. Recently won Best Software award at TAMUHack 2025.",
    location: "Dallas, TX",
    funFacts: [
      "Won 3rd Best Software award at TAMUHack 2025",
      "Served as Best Freshman Cadet in the Texas A&M Corps of Cadets",
      "Led developer teams across multiple organizations"
    ]
  },

  // Professional skills - Public
  skills: {
    languages: ["Python", "C++", "JavaScript", "TypeScript", "R", "C#", "Golang", "Git", "SQL", "HTML", "CSS"],
    tools: [
      "PyTorch", "TensorFlow", "AWS", "GCP", "Azure", "Excel", "Splunk", "PowerBI", "Tableau",
      "Spark", "Jira", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "Snowflake",
      "BigQuery", "REST", "React", "Next", "Node.js", "OpenCV", "YOLOv8", "XGBoost", "Pinecone"
    ],
    ai_ml_skills: [
      "Computer Vision", "Deep Learning", "RAG", "LLMs", "NNs", "Airflow", "MLflow",
      "Jenkins", "NLTK", "SpaCy", "BERT", "GPT", "LSTMs"
    ],
    soft: [
      "Problem Solving", "Team Leadership", "Project Management",
      "Communication", "Collaboration", "Adaptability",
      "Time Management", "Creativity", "Critical Thinking"
    ]
  },

  // Project highlights - Public
  projects: [
    {
      name: "Ted Med - Georgia Tech Hacklytics",
      description: "Built an AI-powered robot with Computer Vision and Speech Analytics, achieving 92% emotion recognition accuracy and improved interaction effectiveness by 30%.",
      technologies: ["RAG", "LangChain", "OpenAI", "RoBERTa", "Gemini", "Whisper", "ElevenLabs", "OpenCV", "YOLO", "CNNs"],
      highlight: "Achieved 92% emotion recognition accuracy through speech modulation",
      date: "Feb 2025"
    },
    {
      name: "NLP Car Servicing Chatbot",
      description: "Developed an AI-driven car service chatbot that optimized automotive service experience.",
      technologies: ["NLP", "RAG frameworks", "Machine Learning"],
      highlight: "Increased user satisfaction by 45% and reduced query resolution time by 15%",
      date: "Jul 2024"
    },
    {
      name: "TAMUhack 2025 Project",
      description: "Developed software solution that won 3rd Best Software award at TAMUhack 2025.",
      technologies: ["Machine Learning", "Web Development"],
      highlight: "Recognized as 3rd Best Software at TAMUhack 2025",
      date: "Jan 2025"
    }
  ],

  // Education - Public
  education: [
    {
      institution: "University of Texas at Dallas",
      degree: "BS Computer Science",
      status: "Junior",
      expectedGraduation: "May 2027",
      activities: "Active in computer science research and projects"
    },
    {
      institution: "Texas A&M University, College Station",
      degree: "BS Computer Science",
      status: "Sophomore",
      expectedGraduation: "Dec 2024",
      activities: "Corps of Cadets, Google Developers Group, TAMU Blockchain Club, Aggie Data Science Society, Aggie Coding club, International Student club, Hindu Yuva"
    }
  ],

  // Work experience - Public
  experience: [
    {
      position: "Augmented Reality Developer",
      company: "Snap Inc.",
      duration: "Sep 2024 - Nov 2024",
      highlights: [
        "Developed AR environments with Lens Studio, C++, Unity, and AI-driven hand tracking",
        "Integrated ML components for emotion and gesture recognition, improving user engagement by 25%",
        "Collaborated with cross-functional teams to resolve performance issues"
      ]
    },
    {
      position: "Business Analyst",
      company: "HP Tech Ventures",
      duration: "Aug 2024 - Oct 2024",
      highlights: [
        "Researched AI startups, evaluated KPIs, and analyzed business models using Python, Snowflake, Airflow, and PowerBI",
        "Supported due diligence using Hugging Face, LangChain, Coinbase, and GitLab datasets"
      ]
    },
    {
      position: "Supervisor",
      company: "Rupali Real Estates",
      duration: "Jun 2021 - Jun 2023",
      highlights: [
        "Planned construction material allocation and tracked equipment for interiors",
        "Improved procurement workflows by 20% and analyzed market trends with Tableau"
      ]
    }
  ],

  // Leadership roles - Public
  leadership: [
    {
      position: "President",
      organization: "Google Developers Group at TAMU",
      duration: "Jul 2024 - Present"
    },
    {
      position: "Co-Founder and Developer Team Lead",
      organization: "Tlato Startup",
      duration: "Aug 2024 - Present"
    },
    {
      position: "Developer Lead",
      organization: "Texas A&M Blockchain",
      duration: "Aug 2023 - Present"
    },
    {
      position: "Cadet",
      organization: "The Texas A&M Corps of Cadet",
      duration: "Aug 2023 - Dec 2023"
    },
    {
      position: "Sports Captain",
      organization: "S.P.S.E.C.",
      duration: "Jul 2021 - Jun 2022"
    },
    {
      position: "Tech Squad Lead",
      organization: "S.P.S.E.C.",
      duration: "Aug 2019 - Jun 2022"
    }
  ],

  // Personal qualities - Public but more subjective
  qualities: {
    collaborative: "Thrives in team environments and values diverse perspectives, serving in multiple leadership roles across organizations.",
    innovative: "Constantly explores new technologies and approaches to solve complex problems, as demonstrated in AR development and AI projects.",
    adaptable: "Quickly learns new skills and adjusts to changing requirements, having worked across different domains from AR to business analysis.",
    communicative: "Effectively translates technical concepts for diverse stakeholders, a skill refined through leadership experiences."
  },

  // Contact information - Semi-private
  contact: {
    email: "ujjwalgupta2294@gmail.com",
    linkedin: "https://linkedin.com/in/ujjwalgupta-/",
    github: "https://github.com/22Ujjwal",
    location: "Dallas, TX"
  },
  
  // Personality traits
  personality: [
    "Outgoing",
    "People-oriented",
    "Responsible",
    "Respectful",
    "Driven"
  ],
  
  // Prepared responses for common questions
  commonResponses: {
    aboutUjjwal: "Ujjwal is a Computer Science student with experience in AI, AR development, and data analysis. He's a people person who thrives in collaborative environments and has worked on multiple innovative projects. He recently won Best Software award at TAMUHack 2025! He's been an AR Developer at Snap Inc. and Business Analyst at HP Tech Ventures. Ujjwal is also the President of the Google Developers Group at TAMU and holds leadership positions in multiple organizations.",
    
    skills: "Ujjwal's technical skills span multiple domains including Python, C++, JavaScript, AI technologies like PyTorch and TensorFlow, and cloud platforms like AWS, GCP, and Azure. He has expertise in Computer Vision, Deep Learning, RAG, and LLMs. His soft skills include team leadership, project management, and exceptional communication that helps him collaborate effectively across diverse teams.",
    
    projects: "Ujjwal has worked on several impressive projects, including an AI-powered healthcare robot called Ted Med that achieved 92% emotion recognition accuracy, an NLP car servicing chatbot that increased user satisfaction by 45%, and an award-winning project at TAMUHack 2025 that earned 3rd Best Software recognition.",
    
    education: "Ujjwal is currently a Junior pursuing a BS in Computer Science at the University of Texas at Dallas with an expected graduation in May 2027. Previously, he was a Sophomore at Texas A&M University studying General Engineering and Computer Science. While at TAMU, he was recognized as Best Freshman Cadet in the Corps of Cadets program.",
    
    experience: "Ujjwal has worked as an Augmented Reality Developer at Snap Inc., where he developed AR environments with Lens Studio and integrated AI-driven tracking that improved user engagement by 25%. He was also a Business Analyst at HP Tech Ventures where he evaluated AI startups and analyzed business models. Prior to that, he worked part-time as a Supervisor at Rupali Real Estates, improving procurement workflows by 20%.",
    
    leadership: "Ujjwal has an impressive leadership background. He's currently the President of the Google Developers Group at TAMU, Co-Founder and Developer Team Lead for the Tlato project, and Developer Lead for Texas A&M Blockchain. He was also recognized as Best Freshman Cadet in the Texas A&M Corps of Cadets among over 700 cadets.",
    
    contactInfo: "You can connect with Ujjwal via email at ujjwalgupta2294@gmail.com. He's also on LinkedIn at linkedin.com/in/ujjwalgupta-/ and GitHub at github.com/22Ujjwal. He's currently based in Dallas, TX.",
    
    unavailableInfo: "I'm sorry, but as Ujjwal's AI assistant, I don't have authorization to share that specific information. If you'd like to know more about that, I'd recommend reaching out to Ujjwal directly. Can I help you with anything else about Ujjwal's professional background or projects?"
  }
};

// Export the data
export default resumeData; 