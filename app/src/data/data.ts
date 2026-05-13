export const PROJECTS = [
  {
    title: "XML_Parsing - RPC_Server",
    imageUrl: "/assets/images/xml.png",
    description:
      "XML file uploaded to a relational database. First we have a non-relational database, where we make X-Path queries. Then the data is processed, and goes into a relational database. API's where created to make queries.",
    githubUrl: "https://github.com/DiogoBernardes/TP2-IS",
    videoUrl: "https://youtu.be/s4XdCShQvlY",
    type: "University",
    tech: ["XML", "X-Path", "SQL", "REST API"],
  },
  {
    title: "T-Pot Honeypot",
    imageUrl: "/assets/images/honey.png",
    description:
      "In this project, T-Pot was installed in a Google Cloud instance, using the repository linked below. Gathering valuable information from the hackers attacks, and then analysing it for a mini project.",
    githubUrl: "https://github.com/telekom-security/tpotce",
    videoUrl: "https://youtu.be/fe6f_AdqOiM",
    type: "University",
    tech: ["GCP", "Docker", "Security", "T-Pot"],
  },
  {
    title: "Journeys - Mobile App",
    imageUrl: "/assets/images/journeys.png",
    description:
      "This app has the purpose to be a travels management app, allowing users to create trips, share those trips, add locations to the trips, etc. For this project, an API was made.  ",
    githubUrl: "https://github.com/yourusername/project3",
    videoUrl: "https://youtu.be/y3Dcxy0BGRA",
    type: "University",
    tech: ["Mobile", "REST API", "Maps"],
  },
  {
    title: "Talent Management App",
    imageUrl: "/assets/images/c_sharp.png",
    description: "In C#, this project is a talent management web app.",
    githubUrl: "https://github.com/kromenz/TP-ES2",
    videoUrl: "https://youtu.be/LIPNNmdEoNg",
    type: "University",
    tech: ["C#", "ASP.NET", "SQL"],
  },
  {
    title: "Majorities Board Game w/ AI",
    imageUrl: "/assets/images/maj.png",
    description:
      "In Python, this project consists in the Majorities Board game, can be played in duos, or against the computer, with the Random, Monte Carlo and Greedy algorithms.",
    githubUrl: "https://github.com/kromenz/Majorities",
    videoUrl: "https://youtu.be/KBlNqazdbkM",
    type: "University",
    tech: ["Python", "AI", "Monte Carlo", "Algorithms"],
  },
  {
    title: "Web Scrapping / Sentiment Analysis",
    imageUrl: "/assets/images/aoop_tp3.png",
    description:
      "In this project, a Python script was made to scrap information in the IMDb website, to gather comments in movies. After, using a notebook created in Kaggle, the dataset is processed and given the positive or negative quotation. Then this information is passed to Kibana, using Elastic. The dashboard created gives a visual interpretation of the data gathered.",
    githubUrl: "https://github.com/diogoPinheiro11/tp3-project",
    videoUrl: "https://www.youtube.com/watch?v=zZJqdd4O98g",
    type: "University",
    tech: ["Python", "Kaggle", "Elastic", "Kibana"],
  },
  {
    title: "Phaser Racing Game",
    imageUrl: "/assets/images/phaser.png",
    description:
      "In this project, a racing game in 2D, using the Phaser Framework.",
    githubUrl: "https://github.com/kromenz/TECMUL---TP1---28234",
    type: "University",
    tech: ["Phaser", "JavaScript", "Game Dev"],
  },
  {
    title: "PHP Expense Management App",
    imageUrl: "/assets/images/php.png",
    description:
      "This project is an Expense Managament Web App, using PHP for backend, and HTML, Bootstrap for the frontend.",
    githubUrl: "https://github.com/diogoPinheiro11/php-project",
    type: "University",
    tech: ["PHP", "Bootstrap", "MySQL"],
  },
  {
    title: "Borgwarner Testing Apps",
    imageUrl: "/assets/images/borg.png",
    description:
      "In cooperation with Borgwarner, this project was degined to investigate applications that provided usefull insights in testing of web apps, in this case a Python web app. ",
    githubUrl: "https://github.com/diogoPinheiro11/borgwarner-test-app",
    type: "Work",
    tech: ["Python", "Testing", "Web"],
  },
  {
    title: "Money Map",
    imageUrl: "/assets/images/moneymap.png",
    description:
      "Expense management application developed with React and Prisma, helping you monitor and organize your finances in a simple and intuitive way. ",
    githubUrl: "https://github.com/kromenz/Money-Map",
    type: "Personal",
    tech: ["React", "Prisma", "TypeScript"],
  },
  {
    title: "n2yo-api example",
    description:
      "Micro service in Node + Typescript, in which the n2yo API is consumed, exposing a simple endpoint. ",
    githubUrl: "https://github.com/kromenz/n2yo-api",
    type: "Personal",
    tech: ["Node.js", "TypeScript", "REST API"],
  },
  {
    title: "Face-Detection — Real-time detection, tracking & recognition",
    imageUrl: "/assets/images/face_det.png",
    description:
      "A small, practical project that runs real-time face detection → landmark refinement → tracking → recognition with a focus on being fast and configurable. It uses a hybrid approach: a fast detector (OpenCV Haar), landmark-based refinement, lightweight trackers (KCF/CSRT) and face_recognition encodings for identity matching. Includes a persistent cache for face encodings so you don't re-encode images every run. ",
    githubUrl: "https://github.com/kromenz/Face-Detection",
    type: "Personal",
    tech: ["Python", "OpenCV", "face_recognition", "AI"],
  },
  {
    title: "Magic Graph / Reports",
    imageUrl: "/assets/images/magic.png",
    description:
      "Small demo project. It collects collectible-card data (example: Scryfall for Magic: The Gathering), stores it in Neo4J, and produces a PDF report rendered from HTML using Node + TypeScript and Puppeteer.",
    githubUrl: "https://github.com/kromenz/magic-graph-report",
    type: "Personal",
    tech: ["Node.js", "TypeScript", "Neo4J", "Puppeteer"],
  },
];

export const WORK_EXPERIENCE = [
  {
    title: "Petiscas Restaurant",
    position: "Waiter",
    date: "Jul 2022 - Sep 2022",
    responsibilities: [
      "Provided excellent customer service, ensuring quick and efficient service which resulted in positive feedback and increased customer satisfaction.",
      "Managed reservations and table organization to optimize the restaurant's capacity during peak hours.",
      "Coordinated with the kitchen staff to ensure orders were fulfilled correctly and in a timely manner.",
      "Developed strong communication and customer service skills.",
      "Learned to work effectively under pressure in a dynamic and fast-paced environment.",
      "Improved time management and organizational skills to handle multiple tasks simultaneously.",
      "Enhanced teamwork and collaboration skills to ensure a smooth dining experience for guests.",
    ],
    skills: [
      "Customer Service",
      "Communication",
      "Time Management",
      "Teamwork",
      "Working Under Pressure",
    ],
  },
  {
    title: "BorgWarner",
    position: "Summer Internship",
    date: "Jul 2024 - Aug 2024",
    responsibilities: [
      "I began my internship at BorgWarner focusing on integrating Jasper with Python to generate various reports for the factory's production lines. My key responsibilities include:",
      [
        "Developing Python scripts to interface with JasperReports for automated report generation;",
        "Reworking and customizing detailed reports to meet the diverse needs of different production lines;",
        "Collaborating with team members to troubleshoot and resolve any issues related to data and report generation.",
      ],
      "Developed an application from scratch for suggestions, allowing operators or any company personnel to make proposals for improvements. A supervisor would then be assigned to evaluate and, if viable, oversee the implementation process.",
      "Throughout my internship, I was fully integrated into the department's processes and was consistently tested in various situations, always making myself available to assist wherever needed.",
    ],
    skills: [
      "Python",
      "JasperReports",
      "Report Automation",
      "Problem Solving",
      "Team Collaboration",
    ],
  },
  {
    title: "BorgWarner",
    position: "Software Developer Intern",
    date: "Sep 2024 - Jun 2025",
    responsibilities: [
      "I am continuing my internship at BorgWarner, focusing on the development of a new project, Maintenance Management System (MMS). This system streamlines all aspects of factory maintenance.",

      "Key contributions and features of the MMS include:",

      [
        "Frontend Interface for SAP: enables the opening/closing of corrective and preventive work orders, including autonomous (operator-led) and predictive maintenance modules.",
        "Real-Time Notifications: sends SMS alerts to technicians when maintenance is requested, logs technician inputs (e.g., time tracking, photos upload).",
        "System Integration and Reporting: transfers data to SAP via RPA and auto-generates shift/daily reports (using Jasper).",
      ],

      "I also collaborate with the Digital Transformation team to identify the factory needs, refine system features, and ensure seamless integration with existing SAP workflows.",

      "My involvement in this MMS project demonstrates my ability to manage complex, multi-faceted initiatives in a demanding production environment.",
    ],
    skills: [
      "SAP Integration",
      "Frontend Development",
      "RPA",
      "JasperReports",
      "Real-time Notifications",
      "Requirements Gathering",
      "Project Management",
    ],
  },
  {
    title: "Worldover",
    position: "Junior Backend Developer",
    date: "Nov 2025 - Jun 2026",
    responsibilities: [
      "Worked on the document management system of a B2B compliance platform, focused on documentation, formulations, and regulatory workflows.",

      "Main responsibilities and contributions included:",

      [
        "Document Generation: built customer-specific documents such as reports, dossiers, declarations, technical sheets, ingredient lists, and compliance documents, including DOCX, Excel and PDF exports.",
        "Configurable Document System: contributed to a generic document engine with support for dynamic tables, metadata, headers/footers, logos, pagination, conditional fields, formatting, totals, and generation parameters.",
        "Backend Development: worked with TypeScript, Node.js, tRPC, and Next.js, using AWS Neptune (graph database) and Gremlin to model and query complex relationships between documents, products, raw materials, formulations, batches, and lab tests.",
        "Internal Tools: improved internal workflows for document creation, template configuration, status tracking, and visibility of client-specific document availability.",
      ],

      "Contributed to making the document system more automated, configurable, and scalable, enabling faster delivery of client-specific requirements and better internal document management.",
    ],
    skills: [
      "TypeScript",
      "Node.js",
      "tRPC",
      "Next.js",
      "AWS Neptune",
      "Gremlin",
      "Graph Databases",
      "PDF / DOCX / Excel Generation",
      "Document Engine Design",
    ],
    attachments: [
      {
        name: "letter-of-recommendation.pdf",
        url: "/docs/Rafael_Letter_of_Recommendation.pdf",
      },
    ],
  },
];
