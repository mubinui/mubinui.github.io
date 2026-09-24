// Ask about Mubin: a portfolio assistant that runs entirely in the browser.
// With a Gemini or OpenAI key it streams answers from that model, grounded in the profile below.
// Without a key it answers from a rule-based guide over the same profile.
// Voice uses the browser's own speech recognition and speech synthesis.

(() => {
    'use strict';

    const $ = sel => document.querySelector(sel);

    // The same assistant runs as a full page (chat.html) or as a floating window on the portfolio.
    const assistant = $('#assistant');
    const WIDGET = !!assistant;

    // ---------------------------------------------------------------
    // Profile: the single source every answer is grounded in
    // ---------------------------------------------------------------

    const EMAIL = 'uic.mubin@gmail.com';
    const LINKS = {
        email: { label: EMAIL, url: `mailto:${EMAIL}` },
        github: { label: 'GitHub', url: 'https://github.com/mubinui' },
        linkedin: { label: 'LinkedIn', url: 'https://www.linkedin.com/in/mubinuic/' },
        ieee: { label: 'Paper on IEEE Xplore', url: 'https://ieeexplore.ieee.org/document/10601286' },
        delaxisSite: { label: 'Delaxis site', url: 'https://mubinui.github.io/delaxis/' },
        delaxisSource: { label: 'Delaxis source', url: 'https://github.com/mubinui/delaxis' },
        ironBase: { label: 'Iron Base download', url: 'https://github.com/mubinui/iron-base/releases/latest' },
        ironBaseSource: { label: 'Iron Base source', url: 'https://github.com/mubinui/iron-base' },
        cricketSite: { label: 'Cricket Entropy site', url: 'https://mubinui.github.io/cricket-entrophy-analysis/' },
        cricketSource: { label: 'Cricket Entropy source', url: 'https://github.com/mubinui/cricket-entrophy-analysis' },
        documentRag: { label: 'DocumentRAG source', url: 'https://github.com/mubinui/DocumentRAG' },
        putItOn: { label: 'Put It On source', url: 'https://github.com/mubinui/put-it-on' },
        portfolio: { label: 'Back to the portfolio', url: 'index.html' }
    };

    const PROFILE = `
Name: Mubin Ul Islam Chowdhury. Based in Dhaka, Bangladesh.
Positioning: AI Engineer, Researcher and Trainer with 4+ years of industry R&D (since October 2022).
Current role: Software Engineer (R&D) and AI Researcher at BRAC IT Services Ltd., Dhaka (Oct 2022 to present).
Looking for: research positions and engineering roles in AI.
Contact: email ${EMAIL}; GitHub github.com/mubinui; LinkedIn linkedin.com/in/mubinuic. There is no CV download on the site; people can email him for a CV.

EXPERIENCE
- BRAC IT Services Ltd. (Oct 2022 to present), Software Engineer (R&D) and AI Researcher:
  built the BRAC IT AI Kit (self-hosted multi-agent conversational-AI platform with a visual workflow builder) and an Ollama-based RAG system (Gemma) for complex document processing;
  architected enterprise automation: a Flowable Modeler Generator (SpringBoot, LangChain4j), scalable SQL generators (Java, Python, N8N), and HRMS and procurement chatbots with automated agent routing;
  developed the BRAC University Management System (USIS) full-stack (Angular + SpringBoot), a Quarkus two-factor-authentication microservice, a reactive notification system (Spring WebFlux), and a C/C++ biometric fingerprint extension for PostgreSQL and PHP;
  led the internal "AI-Powered Development" workshop, upskilling engineering teams.
- NASA/MIT and STEMX365 Collaborative Research (2022 to present), Space Technology and AI Integration Researcher:
  collaborated directly with an Astrobee scientist (MIT) on AI for autonomous navigation and free-flying robotics aboard the International Space Station; cross-disciplinary R&D across AI, mechanical robotics and space science for operational simulations and international educational outreach.
- BRACU Mongol-Tori semi-autonomous Mars rover (Jan 2022 to Oct 2022), Team Lead:
  directed the AI development lifecycle for a team of 17 engineers; real-time object detection (YOLOv5, SSD MobileNet) across 9 rock types; OpenCV pathfinding with Arrow and ArUco marker detection.
- BRAC University (2019 to 2022), Technical Workshop Facilitator and Campus Representative: workshops on AI, neural networks and Python for data science.

FLAGSHIP PROJECTS (at BRAC IT, 2025 to 2026; mostly proprietary)
- BRAC IT AI Kit: production, self-hosted multi-agent chatbot platform (~15k lines of code). An LLM "selector" router dispatches queries to specialist agents across sequential, tree, graph and hybrid workflows; Swagger/OpenAPI importer; 50+ tools (business APIs, web search, RAG); 16 pre-built agents plus full Procurement and University Admission assistants; provider-agnostic via LiteLLM (cloud or local vLLM/Ollama); Redis multi-layer caching cuts repeat-query LLM cost by 50%+; Keycloak/RBAC auth; Prometheus and OpenTelemetry observability. Stack: Python, FastAPI, CrewAI, LiteLLM, React 19, PostgreSQL, Redis, Docker/Kubernetes. Its open-source edition is Delaxis.
- Advance Fingerprint Indexing: large-scale biometric identification and deduplication (ABIS). Two-stage retrieve-then-rerank cascade (approximate vector/LSH retrieval, then an exact geometric matcher). 100% Rank-1 identification on the FVC2002 benchmark; 100% recall@10 at up to 5001x gallery reduction; ten-finger fusion dedup gate with an auditable DUPLICATE/CLEAN/REVIEW verdict; quantified scale analysis to 10 million records. Stack: Java 25, SourceAFIS, Qdrant, PostgreSQL, MinHash-LSH, MCC/LSS-R.
- TenderSense: AI SaaS built in 48 hours at BRAC IT Code Sprint 2026 (The AI Readiness Hackathon) with teammates Arnab Dey and Lita Mouri Sarker (team Neuro Warriors); won 1st Runner-Up among 33 build-round teams. Scheduled pipelines aggregate live tenders from multiple procurement platforms; an AI bid-advisory engine matches company profiles to tender specifications and gives Bid or No-Bid decisions; Admin and Super Admin panels; real-time email alerts.
- DataAssistant: conversational, hallucination-free data visualization. A find-compute-draw architecture separates semantic retrieval, validated read-only SQL generation and deterministic chart binding, so every figure traces to a real database row. Text and low-latency live-voice modes over a shared tool surface; multi-database connectors, role-based access, full query audit logging. Stack: Python, FastAPI, Angular, Google Gemini, sqlglot, PostgreSQL, MCP, Keycloak.
- Weft (BRAC IT, proprietary): "context, woven". A service that answers from documents, spreadsheets and databases with citations, a computed confidence score, and a refusal when evidence is thin. Hybrid retrieval (dense + BM25, reciprocal rank fusion), a context graph walked with personalised PageRank for multi-hop questions, numeric questions answered by read-only SQL, hierarchical and contextual chunks, a drag-and-drop pipeline studio, an advisor, and an MCP server. 55 unit and 13 end-to-end tests.
- Cricket Entropy Analysis: information-theoretic sports analytics. Batter predictability (Shannon entropy) and exploitability (mutual information) from ball-by-ball data, with bias-corrected estimators (Miller-Madow, Jeffreys-Dirichlet), bootstrap confidence intervals and reliability gating so small-sample noise is never presented as signal. A computer-vision pipeline turns broadcast video into per-delivery clips (scoreboard-OCR state machine, YOLO, vision-language model). Public: site and source on GitHub.

OPEN SOURCE (his own projects, outside BRAC IT)
- Delaxis: the open-source edition of the BRAC IT AI Kit. Design, test and deploy AI agent workflows visually: React Flow studio, CrewAI runtime, FastAPI backend, pluggable LLMs (OpenRouter, OpenAI, Gemini, Ollama), built-in tools, one-click chatbot deployments.
- Iron Base: an AI architecture reviewer for VS Code. Finds structural problems that break as an app grows and estimates how many users it can serve; runs on the Claude, ChatGPT or Gemini account you already have, with no API key.

OTHER WORK
Bangla Document RAG (Ollama, Gemma; public source), Put It On virtual try-on (OpenCV, Gemini 2.0 Flash image generation; public source), SQL Generator (Java with LangChain4j, Python, N8N), Flowable Modeler Generator, BRAC University USIS, PostgreSQL fingerprint extension (C/C++, SourceAFIS as reference), online exam monitoring (OpenCV), HRMS and procurement chatbots (N8N).

RESEARCH
- "Precision Repairs: Achieving Accuracy During Repair Missions at the International Space Station", M. U. I. Chowdhury et al., IEEE Xplore, 2023. An autonomous approach to repairing leaks on the ISS with NASA's Astrobee robot under JAXA's Kibo-RPC guidelines; 0.03 cm precision in the KRPC simulator. Co-authored with MIT Astrobee scientist Mizanul Hoque Chowdhury.
- "Predicting Suicidal Intent from Social Media Text Posts Using Machine Learning", M. U. I. Chowdhury, DSpace, BRAC University, 2022.

TEACHING
Led BRAC IT's internal "AI-Powered Development: Enhancing Coding with Intelligent Integration" workshop; three comprehensive training sessions earned the 2026 Best Mentor Award.

AWARDS
1st Runner-Up, BRAC IT Code Sprint 2026 (with TenderSense); Best Mentor Award, BRAC IT, 2026; 2nd Runners-Up, AI Engineering Hackathon 2025 (Brain Station 23 and Poridhi); Best Team Performer, BRAC IT Townhall 2023; 3rd Place (National), 3rd Kibo Robot Programming Challenge by JAXA, 2022; Active Member, STEMX365.

EDUCATION
B.Sc. in Computer Science and Engineering, BRAC University, 2018 to 2022, CGPA 3.54/4.00. Advanced Certificate for Management Professionals (ACMP-4.0), IBA, University of Dhaka, 2025. HSC (Science), Collectorate School and College, Rangpur, GPA 5.00/5.00.
Certifications: DataCamp (Data Science and Machine Learning Specialization; Statistics; Supervised and Unsupervised Learning), Coursera (Programming for Everybody, Python), HackerRank (Problem Solving).

SKILLS
AI and ML: deep learning, computer vision, NLP, RAG, LLMs, multi-agent systems, predictive modeling, MCP.
Programming: Python, Java, C/C++, Go, JavaScript, TypeScript, SQL.
Frameworks: TensorFlow, PyTorch, scikit-learn, OpenCV, LangChain, Transformers, YOLO, SpringBoot, Angular, React.
Infrastructure: Docker, Kubernetes, GCP, Git, CI/CD, Kafka, RabbitMQ, Redis, PostgreSQL, Qdrant, DuckDB.
Mathematics: calculus, probability, linear algebra, statistics, information theory.
`.trim();

    const SYSTEM_PROMPT = `You are the assistant on Mubin Ul Islam Chowdhury's portfolio website. Visitors are usually hiring managers, recruiters, or professors considering him for research positions.

Answer only from the profile below. If something isn't in it, say you don't know and suggest emailing Mubin at ${EMAIL}. Never invent employers, dates, numbers, links or opinions. Refer to Mubin in the third person.

Keep answers short and specific: two to four sentences, or a brief list when listing several items. Lead with the most relevant fact or number. Use plain language. You may use **bold** and simple "- " lists. Do not use headings or tables.

When the visitor is using voice, answer in one to three short spoken sentences, with no lists, markdown or URLs.

PROFILE
${PROFILE}`;

    // ---------------------------------------------------------------
    // Rule-based guide: used when no key is set, or when a call fails
    // ---------------------------------------------------------------

    const INTENTS = [
        {
            id: 'greeting',
            keys: ['hi', 'hello', 'hey', 'salam', 'assalamualaikum', 'good morning', 'good evening', 'good afternoon'],
            answer: 'Hi! I can tell you about Mubin’s projects, research, experience, awards and how to reach him. What would you like to know?',
            chips: ['Who is Mubin?', 'Flagship projects', 'Research', 'How to contact him']
        },
        {
            id: 'about',
            keys: ['who', 'who is', 'introduce', 'summary', 'overview', 'profile', 'about him', 'about mubin', 'tell me about him', 'tell me about mubin', 'background'],
            answer: 'Mubin Ul Islam Chowdhury is an **AI Engineer, Researcher and Trainer** with 4+ years of industry R&D at BRAC IT Services in Dhaka. He builds production AI, including a multi-agent platform, RAG systems and fingerprint identification at scale. He co-authored IEEE-published space-robotics research with an MIT Astrobee scientist, and won the 2026 Best Mentor Award for training engineers.',
            chips: ['Flagship projects', 'Research', 'Experience', 'Is he available?']
        },
        {
            id: 'role',
            keys: ['current', 'currently', 'now', 'job', 'position', 'company', 'employer', 'brac it', 'work at', 'works at', 'title'],
            answer: 'He is a **Software Engineer (R&D) and AI Researcher at BRAC IT Services Ltd.** in Dhaka, where he has worked since October 2022. His recent work includes the BRAC IT AI Kit, Advance Fingerprint Indexing, DataAssistant and Cricket Entropy Analysis.',
            chips: ['BRAC IT AI Kit', 'Experience', 'Skills']
        },
        {
            id: 'experience',
            keys: ['experience', 'career', 'history', 'roles', 'timeline', 'worked', 'years', 'resume history'],
            answer: 'Four roles so far:\n- **BRAC IT Services**, Software Engineer (R&D) & AI Researcher, Oct 2022 to now\n- **NASA/MIT & STEMX365**, Space Technology & AI Integration Researcher, 2022 to now\n- **BRACU Mongol-Tori Mars rover**, Team Lead for 17 engineers, 2022\n- **BRAC University**, Workshop Facilitator & Campus Representative, 2019 to 2022',
            voice: 'He has 4+ years at BRAC IT Services as an R&D software engineer and AI researcher, collaborates on space-robotics research with an MIT Astrobee scientist, and led a 17-person Mars rover team at BRAC University.',
            chips: ['Mars rover', 'NASA/MIT research', 'BRAC IT AI Kit']
        },
        {
            id: 'aikit',
            keys: ['ai kit', 'brac it ai kit', 'multi agent', 'multi-agent', 'agent platform', 'agents', 'crewai', 'litellm', 'chatbot platform'],
            weight: 2,
            answer: 'The **BRAC IT AI Kit** is a production, self-hosted multi-agent chatbot platform (~15k lines). An LLM router dispatches each query to specialist agents across sequential, tree, graph and hybrid workflows, with 50+ tools and 16 pre-built agents. Multi-layer Redis caching cuts repeat-query LLM cost by **50%+**. Its open-source edition is Delaxis.',
            links: ['delaxisSite', 'delaxisSource'],
            chips: ['Delaxis', 'DataAssistant', 'Skills']
        },
        {
            id: 'fingerprint',
            keys: ['fingerprint', 'biometric', 'biometrics', 'afis', 'fvc', 'fvc2002', 'abis', 'dedup', 'deduplication', 'identification'],
            weight: 2,
            answer: '**Advance Fingerprint Indexing** is large-scale biometric identification and deduplication. A retrieve-then-rerank cascade (vector and LSH retrieval, then exact geometric matching) reaches **100% Rank-1 on FVC2002** and 100% recall@10 at up to 5001× gallery reduction, with scale analysis to 10 million records. Built in Java 25 with SourceAFIS and Qdrant.',
            chips: ['BRAC IT AI Kit', 'Research', 'Skills']
        },
        {
            id: 'tendersense',
            keys: ['tendersense', 'tender', 'tenders', 'bid', 'code sprint', 'neuro warriors', 'procurement'],
            weight: 2,
            answer: '**TenderSense** is an AI SaaS his team built in **48 hours** at BRAC IT Code Sprint 2026, winning **1st Runner-Up** among 33 build-round teams. It aggregates live tenders from procurement platforms, matches them against a company profile to recommend Bid or No-Bid, and sends email alerts. He built it with Arnab Dey and Lita Mouri Sarker.',
            chips: ['Awards', 'BRAC IT AI Kit', 'Contact']
        },
        {
            id: 'dataassistant',
            keys: ['dataassistant', 'data assistant', 'visualization', 'visualisation', 'charts', 'chart', 'dashboard'],
            weight: 2,
            answer: '**DataAssistant** is conversational data visualization that can’t make numbers up. Its find–compute–draw design separates retrieval, validated read-only SQL and deterministic chart binding, so every figure traces to a real database row. It works over text and live voice, with role-based access and full audit logging.',
            chips: ['Weft', 'BRAC IT AI Kit']
        },
        {
            id: 'cricket',
            keys: ['cricket', 'entropy', 'shannon', 'mutual information', 'sports'],
            weight: 2,
            answer: '**Cricket Entropy Analysis** measures a batter’s predictability with Shannon entropy and exploitability with mutual information, using bias-corrected estimators and bootstrap intervals so small-sample noise is never shown as signal. A vision pipeline cuts broadcast video into per-delivery clips. It’s public.',
            links: ['cricketSite', 'cricketSource'],
            chips: ['Research', 'Open source']
        },
        {
            id: 'weft',
            keys: ['weft', 'context graph', 'grounded', 'citations', 'retrieval', 'rag'],
            weight: 2,
            answer: '**Weft** answers from documents, spreadsheets and databases with citations, a computed confidence score, and a refusal when the evidence is thin. It combines hybrid retrieval, a context graph for multi-hop questions and SQL for numeric ones, with a drag-and-drop pipeline studio. It’s proprietary work at BRAC IT.',
            chips: ['Delaxis', 'Iron Base', 'DataAssistant']
        },
        {
            id: 'delaxis',
            keys: ['delaxis', 'open source ai kit', 'workflow builder', 'react flow'],
            weight: 3,
            answer: '**Delaxis** is the open-source edition of the BRAC IT AI Kit: design, test and deploy AI agent workflows visually, with a React Flow studio, a CrewAI runtime, pluggable LLMs and one-click chatbot deployments.',
            links: ['delaxisSite', 'delaxisSource'],
            chips: ['Iron Base', 'Weft']
        },
        {
            id: 'ironbase',
            keys: ['iron base', 'ironbase', 'vs code', 'vscode', 'architecture reviewer', 'extension'],
            weight: 3,
            answer: '**Iron Base** is an AI architecture reviewer for VS Code. It finds the structural problems that break as an app grows and estimates how many users it can serve, running on the Claude, ChatGPT or Gemini account you already have.',
            links: ['ironBase', 'ironBaseSource'],
            chips: ['Delaxis', 'Weft']
        },
        {
            id: 'projects',
            keys: ['projects', 'project', 'built', 'build', 'portfolio', 'work', 'flagship', 'showcase', 'products'],
            answer: 'Flagship work:\n- **BRAC IT AI Kit**, a multi-agent platform (50%+ lower repeat-query LLM cost)\n- **Advance Fingerprint Indexing** (100% Rank-1 on FVC2002)\n- **TenderSense**, built in 48 hours, 1st Runner-Up\n- **DataAssistant**, hallucination-free data charts\n- **Cricket Entropy Analysis**\n- **Weft**, grounded answers with citations\n\nOpen source: **Delaxis** and **Iron Base**.',
            voice: 'His flagship projects are the BRAC IT AI Kit multi-agent platform, fingerprint identification that hits 100 percent Rank-1 on FVC2002, TenderSense, DataAssistant and Cricket Entropy Analysis. plus Weft. He also builds open source: Delaxis and Iron Base.',
            chips: ['BRAC IT AI Kit', 'Fingerprint Indexing', 'TenderSense', 'Open source']
        },
        {
            id: 'opensource',
            keys: ['open source', 'opensource', 'github', 'repo', 'repos', 'repository', 'public'],
            answer: 'His own public projects: **Delaxis** (open-source multi-agent kit), **Iron Base** (AI architecture reviewer for VS Code) and **Cricket Entropy Analysis**. Older public repos include Bangla DocumentRAG and Put It On.',
            links: ['github', 'delaxisSource', 'ironBaseSource'],
            chips: ['Delaxis', 'Iron Base', 'Cricket Entropy']
        },
        {
            id: 'other',
            keys: ['bangla', 'put it on', 'try on', 'try-on', 'sql generator', 'flowable', 'usis', 'exam', 'proctoring', 'n8n', 'imgproxy', 'hrms'],
            answer: 'Other work includes a **Bangla Document RAG** (Ollama, Gemma), **Put It On** virtual try-on (OpenCV, Gemini), SQL generators in Java, Python and N8N, a Flowable Modeler Generator, the BRAC University **USIS** system, a PostgreSQL fingerprint extension in C/C++, online exam monitoring, and HRMS and procurement chatbots.',
            links: ['documentRag', 'putItOn'],
            chips: ['Flagship projects', 'Skills']
        },
        {
            id: 'nasa',
            keys: ['nasa', 'mit', 'astrobee', 'stemx365', 'space', 'iss', 'space station', 'robotics'],
            weight: 2,
            answer: 'Since 2022 he has collaborated with an **MIT Astrobee scientist** through STEMX365 on AI for autonomous navigation and free-flying robots aboard the International Space Station. Their paper, *Precision Repairs* (IEEE Xplore, 2023), reached 0.03 cm precision in the Kibo-RPC simulator.',
            links: ['ieee'],
            chips: ['Research', 'Awards']
        },
        {
            id: 'rover',
            keys: ['rover', 'mars', 'mongol', 'tori', 'mongol-tori', 'team lead', 'yolo', 'rock'],
            weight: 2,
            answer: 'In 2022 he was **Team Lead of BRACU Mongol-Tori**, a semi-autonomous Mars rover. He directed AI development for 17 engineers, with real-time YOLOv5 and SSD MobileNet detection across 9 rock types and OpenCV navigation using Arrow and ArUco markers.',
            chips: ['Experience', 'Awards']
        },
        {
            id: 'research',
            keys: ['research', 'publication', 'publications', 'paper', 'papers', 'ieee', 'published', 'dspace', 'suicidal', 'phd', 'researcher'],
            answer: 'Two publications:\n- **Precision Repairs: Achieving Accuracy During Repair Missions at the International Space Station**, IEEE Xplore, 2023, with an MIT Astrobee scientist\n- **Predicting Suicidal Intent from Social Media Text Posts Using Machine Learning**, DSpace, BRAC University, 2022\n\nHis applied research also covers information-theoretic analytics and biometric retrieval.',
            voice: 'He has two publications: Precision Repairs, on autonomous repair missions aboard the International Space Station, published on IEEE Xplore in 2023 with an MIT Astrobee scientist, and a 2022 machine-learning paper on predicting suicidal intent from social media posts.',
            links: ['ieee'],
            chips: ['NASA/MIT research', 'Cricket Entropy', 'Is he available?']
        },
        {
            id: 'awards',
            keys: ['award', 'awards', 'achievement', 'achievements', 'won', 'win', 'prize', 'hackathon', 'hackathons', 'runner', 'kibo', 'jaxa', 'recognition', 'competition'],
            answer: 'Recognition:\n- **1st Runner-Up**, BRAC IT Code Sprint 2026\n- **Best Mentor Award**, BRAC IT, 2026\n- **2nd Runners-Up**, AI Engineering Hackathon 2025\n- **Best Team Performer**, BRAC IT, 2023\n- **3rd Place National**, Kibo Robot Programming Challenge by JAXA, 2022',
            voice: 'He won 1st Runner-Up at BRAC IT Code Sprint 2026, the 2026 Best Mentor Award, 2nd Runners-Up at the 2025 AI Engineering Hackathon, Best Team Performer in 2023, and 3rd place nationally in JAXA’s Kibo Robot Programming Challenge.',
            chips: ['TenderSense', 'Teaching']
        },
        {
            id: 'teaching',
            keys: ['teach', 'teaching', 'trainer', 'training', 'workshop', 'mentor', 'mentoring', 'instructor'],
            answer: 'He leads BRAC IT’s internal **“AI-Powered Development”** workshop, upskilling engineering teams. Three comprehensive training sessions earned him the **2026 Best Mentor Award**. At BRAC University he also ran workshops on AI, neural networks and Python for data science.',
            chips: ['Awards', 'Experience']
        },
        {
            id: 'skills',
            keys: ['skill', 'skills', 'stack', 'languages', 'language', 'tech', 'technologies', 'tools', 'python', 'java', 'framework', 'frameworks', 'know', 'expertise'],
            answer: '- **AI/ML:** deep learning, computer vision, NLP, RAG, LLMs, multi-agent systems\n- **Languages:** Python, Java, C/C++, Go, TypeScript, SQL\n- **Frameworks:** PyTorch, TensorFlow, OpenCV, LangChain, SpringBoot, Angular, React\n- **Infrastructure:** Docker, Kubernetes, GCP, Kafka, Redis, PostgreSQL, Qdrant\n- **Maths:** probability, statistics, linear algebra, information theory',
            voice: 'His core skills are AI and machine learning, including computer vision, NLP, RAG and multi-agent systems, in Python and Java, with frameworks like PyTorch, OpenCV, LangChain and SpringBoot, deployed on Docker and Kubernetes.',
            chips: ['Flagship projects', 'Education']
        },
        {
            id: 'education',
            keys: ['education', 'degree', 'university', 'bsc', 'b.sc', 'cgpa', 'gpa', 'study', 'studied', 'iba', 'acmp', 'hsc', 'certification', 'certifications', 'certificate'],
            answer: '**B.Sc. in Computer Science and Engineering**, BRAC University (2018–2022, CGPA 3.54/4.00), and **ACMP-4.0** from IBA, University of Dhaka (2025). Certifications from DataCamp, Coursera and HackerRank.',
            chips: ['Research', 'Skills']
        },
        {
            id: 'contact',
            keys: ['contact', 'email', 'mail', 'reach', 'hire', 'hiring', 'available', 'availability', 'open to', 'opportunity', 'recruit', 'interview', 'connect', 'talk'],
            weight: 2,
            answer: 'He’s open to **research positions and AI engineering roles**. The best way to reach him is email: **uic.mubin@gmail.com**. He’s also on LinkedIn and GitHub.',
            voice: 'He’s open to research positions and AI engineering roles. The best way to reach him is by email, at u i c dot mubin at gmail dot com.',
            links: ['email', 'linkedin', 'github'],
            chips: ['Who is Mubin?', 'Flagship projects']
        },
        {
            id: 'cv',
            keys: ['cv', 'resume', 'résumé'],
            weight: 3,
            answer: 'The site doesn’t offer a CV download. Email Mubin at **uic.mubin@gmail.com** and he’ll send it.',
            links: ['email'],
            chips: ['Experience', 'Education']
        },
        {
            id: 'location',
            keys: ['where', 'location', 'based', 'dhaka', 'bangladesh', 'live', 'lives', 'relocate', 'remote'],
            answer: 'He’s based in **Dhaka, Bangladesh**. For questions about relocation or remote work, email him at uic.mubin@gmail.com.',
            links: ['email'],
            chips: ['Is he available?']
        },
        {
            id: 'links',
            keys: ['linkedin', 'social', 'profile link', 'links'],
            weight: 2,
            answer: 'You’ll find him on LinkedIn and GitHub, or by email at uic.mubin@gmail.com.',
            links: ['linkedin', 'github', 'email']
        },
        {
            id: 'assistant',
            keys: ['are you', 'you ai', 'chatgpt', 'gemini', 'openai', 'bot', 'how do you work', 'real person', 'api key', 'key'],
            answer: 'I’m a guide built into Mubin’s portfolio. Without a key I answer from a built-in guide to his work. If you connect your own Gemini or OpenAI key (top right), a model answers instead, still grounded only in his profile. Your key stays in your browser.',
            chips: ['Who is Mubin?', 'Flagship projects']
        },
        {
            id: 'thanks',
            keys: ['thanks', 'thank you', 'thx', 'great', 'awesome', 'cool', 'nice'],
            answer: 'You’re welcome! Anything else you’d like to know about Mubin’s work?',
            chips: ['Research', 'Is he available?']
        },
        {
            id: 'bye',
            keys: ['bye', 'goodbye', 'see you', 'later'],
            answer: 'Thanks for stopping by. You can reach Mubin at uic.mubin@gmail.com.',
            links: ['email', 'portfolio']
        },
        {
            id: 'help',
            keys: ['help', 'what can you', 'what can i ask', 'options', 'menu', 'topics'],
            answer: 'Ask me about his flagship projects, open-source work, research and publications, experience, awards, teaching, skills, education, or how to contact him.',
            chips: ['Flagship projects', 'Research', 'Awards', 'Contact']
        }
    ];

    const FALLBACK = {
        answer: 'I don’t have that in Mubin’s portfolio. I can talk about his projects, research, experience, awards, teaching, skills or how to reach him. For anything else, email him at **uic.mubin@gmail.com**.',
        voice: 'I don’t have that in Mubin’s portfolio. Try asking about his projects, research, experience or awards, or email him directly.',
        links: ['email'],
        chips: ['Who is Mubin?', 'Flagship projects', 'Research', 'Contact']
    };

    // Chip labels map to a question the guide understands.
    const CHIP_QUESTIONS = {
        'Who is Mubin?': 'Who is Mubin?',
        'Flagship projects': 'What are his flagship projects?',
        'Fingerprint Indexing': 'Tell me about fingerprint indexing',
        'NASA/MIT research': 'Tell me about his NASA MIT research',
        'Is he available?': 'Is he available for hire?',
        'How to contact him': 'How can I contact him?',
        'Mars rover': 'Tell me about the Mars rover',
        'Cricket Entropy': 'Tell me about Cricket Entropy Analysis',
        'Open source': 'What open source projects does he have?',
        'Contact': 'How can I contact him?',
        'Awards': 'What awards has he won?',
        'Teaching': 'Tell me about his teaching'
    };

    const normalize = text => ` ${text.toLowerCase().replace(/[^a-z0-9.+#\s-]/g, ' ').replace(/\s+/g, ' ').trim()} `;

    function ruleAnswer(question) {
        const q = normalize(question);
        let best = null;
        let bestScore = 0;
        for (const intent of INTENTS) {
            let score = 0;
            for (const key of intent.keys) {
                if (q.includes(` ${key} `) || (key.includes(' ') && q.includes(key))) {
                    score += (key.includes(' ') ? 2 : 1) * (intent.weight || 1);
                }
            }
            // Greetings only win when the message is basically a greeting.
            if (intent.id === 'greeting' && q.trim().split(' ').length > 4) score = Math.min(score, 0.5);
            if (score > bestScore) {
                bestScore = score;
                best = intent;
            }
        }
        return best && bestScore >= 1 ? best : FALLBACK;
    }

    // ---------------------------------------------------------------
    // Settings: provider, key and model live only in this browser
    // ---------------------------------------------------------------

    const STORE = 'mubin-assistant';
    const DEFAULT_MODELS = { gemini: 'gemini-3.8-flash', openai: 'gpt-4.1-mini' };
    const DEFAULT_LIVE_MODEL = 'gemini-3.8-live';
    // Achernar is Gemini's soft, warm female voice.
    const LIVE_VOICE = 'Achernar';
    const RETIRED_MODELS = ['gemini-2.5-flash'];

    const readStore = storage => {
        try { return JSON.parse(storage.getItem(STORE) || 'null'); } catch { return null; }
    };

    let settings = readStore(localStorage) || readStore(sessionStorage) || { provider: 'none', key: '', model: '', remember: false };
    if (RETIRED_MODELS.includes(settings.model)) settings.model = '';
    const liveModelName = () => settings.liveModel || DEFAULT_LIVE_MODEL;
    const liveAvailable = () => settings.provider === 'gemini' && !!settings.key;

    function persist() {
        const data = JSON.stringify(settings);
        try {
            localStorage.removeItem(STORE);
            sessionStorage.removeItem(STORE);
            if (settings.provider === 'none') return;
            (settings.remember ? localStorage : sessionStorage).setItem(STORE, data);
        } catch { /* storage unavailable: settings last for this page only */ }
    }

    const usingModel = () => settings.provider !== 'none' && settings.key;
    const modelName = () => settings.model || DEFAULT_MODELS[settings.provider] || '';

    function renderMode() {
        const live = usingModel();
        $('#modeLabel').dataset.live = String(!!live);
        $('#modeText').textContent = live
            ? `${settings.provider === 'gemini' ? 'Gemini' : 'OpenAI'} · ${modelName()}`
            : 'Offline guide';
        const label = $('#settingsLabel');
        if (label) label.textContent = live ? 'AI settings' : 'Connect AI';
    }

    // ---------------------------------------------------------------
    // Model calls: streamed straight from the browser to the provider
    // ---------------------------------------------------------------

    class ProviderError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    }

    async function* readSSE(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data:')) yield trimmed.slice(5).trim();
            }
        }
    }

    async function explainFailure(response) {
        let detail = '';
        try {
            const body = await response.json();
            detail = body.error?.message || '';
        } catch { /* no body */ }
        const s = response.status;
        if (s === 400 && /api key/i.test(detail)) return new ProviderError('The key was rejected. Check it in AI settings.', s);
        if (s === 401 || s === 403) return new ProviderError('The key was rejected. Check it in AI settings.', s);
        if (s === 404) return new ProviderError(`The model “${modelName()}” wasn’t found. Try another model in AI settings.`, s);
        if (s === 429) return new ProviderError('The provider is rate-limiting this key. Wait a moment and try again.', s);
        return new ProviderError(detail || `The provider returned an error (${s}).`, s);
    }

    async function streamModel(history, { voice, onDelta, signal }) {
        const system = voice ? `${SYSTEM_PROMPT}\n\nThe visitor is speaking by voice right now.` : SYSTEM_PROMPT;
        const turns = history.slice(-12);
        let response;
        if (settings.provider === 'gemini') {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName())}:streamGenerateContent?alt=sse`, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.key },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: system }] },
                    contents: turns.map(t => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.text }] })),
                    generationConfig: { temperature: 0.4 }
                })
            });
        } else {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.key}` },
                body: JSON.stringify({
                    model: modelName(),
                    stream: true,
                    messages: [{ role: 'system', content: system }, ...turns.map(t => ({ role: t.role === 'user' ? 'user' : 'assistant', content: t.text }))]
                })
            });
        }
        if (!response.ok) throw await explainFailure(response);
        let text = '';
        for await (const data of readSSE(response)) {
            if (data === '[DONE]') break;
            let json;
            try { json = JSON.parse(data); } catch { continue; }
            const piece = settings.provider === 'gemini'
                ? (json.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('')
                : json.choices?.[0]?.delta?.content || '';
            if (piece) {
                text += piece;
                onDelta(text, piece);
            }
        }
        if (!text.trim()) throw new ProviderError('The model returned an empty answer.', 0);
        return text;
    }

    async function testConnection(provider, key, model) {
        const saved = settings;
        settings = { ...settings, provider, key, model };
        try {
            await streamModel([{ role: 'user', text: 'Reply with the single word OK.' }], { voice: false, onDelta() {} });
            return true;
        } finally {
            settings = saved;
        }
    }

    // ---------------------------------------------------------------
    // Rendering: escaped text with a small, safe subset of formatting
    // ---------------------------------------------------------------

    const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function inline(text) {
        return escapeHtml(text)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, '<a href="mailto:$1">$1</a>');
    }

    function format(text) {
        const blocks = [];
        let list = null;
        for (const raw of text.split('\n')) {
            const line = raw.trim();
            const item = line.match(/^[-*•]\s+(.*)$/) || line.match(/^\d+[.)]\s+(.*)$/);
            if (item) {
                if (!list) {
                    list = [];
                    blocks.push(list);
                }
                list.push(`<li>${inline(item[1])}</li>`);
            } else {
                list = null;
                if (line) blocks.push(`<p>${inline(line.replace(/^#+\s*/, ''))}</p>`);
            }
        }
        return blocks.map(b => (Array.isArray(b) ? `<ul>${b.join('')}</ul>` : b)).join('');
    }

    const forSpeech = text => text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`#>]/g, '')
        .replace(/^\s*[-•]\s+/gm, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // ---------------------------------------------------------------
    // Conversation
    // ---------------------------------------------------------------

    const log = $('#log');
    const input = $('#input');
    const sendBtn = $('#sendBtn');
    const history = [];
    let busy = false;
    let controller = null;

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };

    function addMessage(role, html) {
        const row = document.createElement('div');
        row.className = `msg msg-${role}`;
        if (role === 'bot') {
            const img = document.createElement('img');
            img.className = 'msg-avatar';
            img.src = 'profile-photo/portrait-web.jpg';
            img.alt = '';
            row.appendChild(img);
        }
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = html;
        row.appendChild(bubble);
        log.appendChild(row);
        scrollDown();
        return bubble;
    }

    function addLinks(bubble, keys = []) {
        const valid = keys.map(k => LINKS[k]).filter(Boolean);
        if (!valid.length) return;
        const p = document.createElement('p');
        p.className = 'bubble-links';
        valid.forEach((link, i) => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.label;
            if (/^https?:/.test(link.url)) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
            p.appendChild(a);
            if (i < valid.length - 1) p.appendChild(document.createTextNode(' · '));
        });
        bubble.appendChild(p);
    }

    function addNote(bubble, text) {
        const p = document.createElement('p');
        p.className = 'bubble-note';
        p.textContent = text;
        bubble.appendChild(p);
    }

    function showChips(labels = []) {
        document.querySelectorAll('.suggestions').forEach(el => el.remove());
        if (!labels.length) return;
        const wrap = document.createElement('div');
        wrap.className = 'suggestions';
        labels.forEach(label => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'suggestion';
            b.textContent = label;
            b.addEventListener('click', () => ask(CHIP_QUESTIONS[label] || label));
            wrap.appendChild(b);
        });
        log.appendChild(wrap);
        scrollDown();
    }

    const typingHtml = '<span class="thinking"><canvas class="mini-sphere" width="26" height="26" aria-hidden="true"></canvas><span>Thinking…</span></span>';
    const wakeSphere = bubble => {
        const c = bubble.querySelector('.mini-sphere');
        if (c && window.DotSphere) new window.DotSphere(c, { count: 46, dotSize: 0.75 }).setState('thinking');
    };

    // Answers a question; resolves with the plain text to speak.
    async function respond(question, { voice = false, onSentence } = {}) {
        history.push({ role: 'user', text: question });
        const bubble = addMessage('bot', typingHtml);
        wakeSphere(bubble);
        const rule = ruleAnswer(question);

        if (usingModel()) {
            controller = new AbortController();
            let spokenUpTo = 0;
            try {
                const text = await streamModel(history, {
                    voice,
                    signal: controller.signal,
                    onDelta(full) {
                        bubble.innerHTML = format(full);
                        scrollDown();
                        if (onSentence) {
                            // Hand complete sentences to speech as they arrive.
                            const pending = full.slice(spokenUpTo);
                            const match = pending.match(/^[\s\S]*?[.!?](\s|$)/);
                            if (match) {
                                spokenUpTo += match[0].length;
                                onSentence(forSpeech(match[0]));
                            }
                        }
                    }
                });
                if (onSentence && spokenUpTo < text.length) onSentence(forSpeech(text.slice(spokenUpTo)));
                history.push({ role: 'model', text });
                showChips([]);
                return forSpeech(text);
            } catch (err) {
                if (err.name === 'AbortError') {
                    bubble.innerHTML = '<p>Stopped.</p>';
                    return '';
                }
                // Fall back to the built-in guide so the visitor still gets an answer.
                bubble.innerHTML = format(rule.answer);
                addLinks(bubble, rule.links);
                addNote(bubble, `${err.message} Answered by the built-in guide instead.`);
                history.push({ role: 'model', text: rule.answer });
                showChips(rule.chips);
                const spoken = forSpeech(rule.voice || rule.answer);
                if (onSentence) onSentence(spoken);
                return spoken;
            } finally {
                controller = null;
            }
        }

        // Built-in guide: a short, deliberate pause reads as considered, not canned.
        await new Promise(r => setTimeout(r, 350));
        bubble.innerHTML = format(rule.answer);
        addLinks(bubble, rule.links);
        history.push({ role: 'model', text: rule.answer });
        showChips(rule.chips);
        scrollDown();
        const spoken = forSpeech(rule.voice || rule.answer);
        if (onSentence) onSentence(spoken);
        return spoken;
    }

    async function ask(question) {
        question = question.trim();
        if (!question || busy) return;
        busy = true;
        sendBtn.disabled = true;
        showChips([]);
        addMessage('user', `<p>${escapeHtml(question)}</p>`);
        try {
            await respond(question);
        } finally {
            busy = false;
            sendBtn.disabled = !input.value.trim();
            input.focus();
        }
    }

    // Composer
    const autosize = () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
        sendBtn.disabled = busy || !input.value.trim();
    };
    input.addEventListener('input', autosize);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            $('#composer').requestSubmit();
        }
    });
    $('#composer').addEventListener('submit', e => {
        e.preventDefault();
        const q = input.value;
        input.value = '';
        autosize();
        ask(q);
    });

    // ---------------------------------------------------------------
    // Voice: listen, answer, speak, listen again
    // ---------------------------------------------------------------

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const canSpeak = 'speechSynthesis' in window;
    const micBtn = $('#micBtn');
    const voicePanel = $('#voice');
    const voiceState = $('#voiceState');
    const voiceText = $('#voiceText');
    const muteBtn = $('#voiceMute');
    const orbCanvas = WIDGET ? $('#fabDots') : $('#orb');
    const orb = window.DotSphere && orbCanvas
        ? new window.DotSphere(orbCanvas, WIDGET ? { count: 90, dotSize: 1.05, chatter: true } : { count: 520, dotSize: 1.6 })
        : null;

    let voiceOn = false;
    let muted = false;
    let recognizer = null;
    let speechQueue = [];
    let speaking = false;
    let answerDone = false;
    let lastFocus = null;

    function setVoiceState(state, label) {
        voiceState.textContent = label;
        if (orb) orb.setState(state);
    }

    function pickVoice() {
        const voices = canSpeak ? speechSynthesis.getVoices() : [];
        const english = voices.filter(v => /^en(-|_|$)/i.test(v.lang));
        // Soft female voices, best first; the browser's own voice is the last resort.
        const preferred = ['Ava (Premium)', 'Ava (Enhanced)', 'Samantha (Enhanced)', 'Allison', 'Ava', 'Samantha', 'Susan', 'Serena', 'Moira', 'Tessa', 'Karen', 'Victoria',
            'Google UK English Female', 'Google US English', 'Microsoft Jenny', 'Microsoft Aria', 'Microsoft Sonia', 'Microsoft Libby', 'Microsoft Zira'];
        for (const name of preferred) {
            const v = english.find(voice => voice.name.includes(name));
            if (v) return v;
        }
        return english.find(v => /female|woman/i.test(v.name)) || english.find(v => v.localService) || english[0] || null;
    }

    function speakNext() {
        if (!voiceOn) return;
        if (!speechQueue.length) {
            speaking = false;
            if (answerDone) listen();
            return;
        }
        const text = speechQueue.shift();
        if (muted || !canSpeak || !text) {
            speakNext();
            return;
        }
        speaking = true;
        setVoiceState('speaking', 'Speaking…');
        const u = new SpeechSynthesisUtterance(text);
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = 0.96;
        u.pitch = 1.04;
        u.onboundary = () => orb && orb.beat(0.8);
        u.onend = speakNext;
        u.onerror = speakNext;
        speechSynthesis.speak(u);
    }

    function queueSpeech(text) {
        if (!text) return;
        speechQueue.push(text);
        if (!speaking) speakNext();
    }

    function listen() {
        if (!voiceOn) return;
        setVoiceState('listening', 'Listening…');
        voiceText.textContent = '';
        let finalText = '';
        recognizer = new Recognition();
        recognizer.lang = 'en-US';
        recognizer.interimResults = true;
        recognizer.continuous = false;
        recognizer.onresult = e => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const r = e.results[i];
                if (r.isFinal) finalText += r[0].transcript;
                else interim += r[0].transcript;
            }
            voiceText.textContent = (finalText + interim).trim();
            if (orb) orb.beat(0.35);
        };
        recognizer.onerror = e => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                voiceText.textContent = 'Microphone access is blocked. Allow it in your browser to talk, or type below.';
                recognizer = null;
                endVoice(false);
            }
        };
        recognizer.onend = async () => {
            recognizer = null;
            if (!voiceOn) return;
            const heard = finalText.trim();
            if (!heard) {
                listen();
                return;
            }
            addMessage('user', `<p>${escapeHtml(heard)}</p>`);
            showChips([]);
            setVoiceState('thinking', 'Thinking…');
            answerDone = false;
            speechQueue = [];
            await respond(heard, { voice: true, onSentence: queueSpeech });
            answerDone = true;
            if (!speaking && !speechQueue.length) listen();
        };
        try {
            recognizer.start();
        } catch {
            /* already started */
        }
    }

    // ---------------------------------------------------------------
    // Gemini Live: native audio in and out over one WebSocket.
    // Used for voice whenever a Gemini key is connected.
    // ---------------------------------------------------------------

    const LIVE_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

    const LIVE_PERSONA = `You are speaking out loud with a visitor to Mubin Ul Islam Chowdhury's portfolio, as his warm, friendly assistant. Talk like a thoughtful person, not a narrator: relaxed, natural and kind, with a gentle pace. Keep each reply to one to three short sentences, then let the visitor talk. Use contractions and everyday words. Never read out lists, markdown, symbols or web addresses; say "his email" or spell the address slowly only if asked. If the visitor interrupts, stop and listen. If you don't know something, say so simply and suggest emailing Mubin.`;

    // Resamples the microphone to 16 kHz, 16-bit PCM, in ~100 ms packets.
    const MIC_WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / 16000; this.t = 0; this.prev = 0; this.out = []; }
  process(inputs) {
    const x = inputs[0] && inputs[0][0];
    if (!x) return true;
    let sum = 0;
    for (; this.t < x.length - 1; this.t += this.ratio) {
      const i = Math.floor(this.t), f = this.t - i;
      const a = i < 0 ? this.prev : x[i];
      const s = a + (x[i + 1] - a) * f;
      this.out.push(s);
      sum += s * s;
    }
    this.t -= x.length;
    this.prev = x[x.length - 1];
    if (this.out.length >= 1600) {
      const pcm = new Int16Array(this.out.length);
      for (let k = 0; k < this.out.length; k++) pcm[k] = Math.max(-1, Math.min(1, this.out[k])) * 0x7fff;
      this.port.postMessage({ pcm: pcm.buffer, level: Math.sqrt(sum / Math.max(1, this.out.length)) }, [pcm.buffer]);
      this.out = [];
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);`;

    const toBase64 = buffer => {
        const bytes = new Uint8Array(buffer);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return btoa(s);
    };

    const fromBase64 = data => {
        const s = atob(data);
        const bytes = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
        return bytes.buffer;
    };

    let live = null;

    function liveContext() {
        const recent = history.slice(-8).map(t => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${t.text}`).join('\n');
        return `${LIVE_PERSONA}\n\n${SYSTEM_PROMPT}${recent ? `\n\nCONVERSATION SO FAR (typed)\n${recent}` : ''}`;
    }

    function explainLiveClose(event) {
        const reason = (event.reason || '').trim();
        if (/api key|permission|unauthori[sz]ed/i.test(reason) || event.code === 1008) return 'Gemini rejected the key for Live voice. Check it in AI settings.';
        if (/not found|not supported|model/i.test(reason)) return `The Live model “${liveModelName()}” isn’t available for this key. Try another in AI settings.`;
        if (/quota|rate|exhausted/i.test(reason)) return 'This key has reached its Live voice limit for now. Try again later, or type your question.';
        return reason ? `Live voice stopped: ${reason}` : 'Live voice lost its connection.';
    }

    async function startLive() {
        if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode || !('WebSocket' in window)) {
            addMessage('bot', '<p>Live voice needs a current browser with microphone support. You can still type your questions here.</p>');
            return;
        }
        lastFocus = document.activeElement;
        voiceOn = true;
        if (WIDGET) setAssistant('voice');
        else voicePanel.hidden = false;
        $('#voiceEnd').focus();
        setVoiceState('thinking', 'Connecting…');
        voiceText.textContent = '';

        const session = {
            ws: null, stream: null, ctx: null, gain: null, analyser: null, node: null,
            sources: new Set(), nextTime: 0, userText: '', modelText: '', ready: false, closing: false,
            thinkTimer: 0, raf: 0
        };
        live = session;

        try {
            session.ctx = new (window.AudioContext || window.webkitAudioContext)();
            await session.ctx.resume();
            session.stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }
            });
        } catch (err) {
            stopLive();
            voiceText.textContent = err && err.name === 'NotAllowedError'
                ? 'Microphone access is blocked. Allow it in your browser to talk, or type instead.'
                : 'Couldn’t start the microphone.';
            endVoice(false);
            return;
        }
        if (live !== session) return;

        // Playback chain: sources -> gain -> analyser -> speakers.
        session.gain = session.ctx.createGain();
        session.gain.gain.value = muted ? 0 : 1;
        session.analyser = session.ctx.createAnalyser();
        session.analyser.fftSize = 512;
        session.gain.connect(session.analyser);
        session.analyser.connect(session.ctx.destination);

        const levels = new Uint8Array(session.analyser.fftSize);
        const pulse = () => {
            if (live !== session) return;
            if (session.sources.size) {
                session.analyser.getByteTimeDomainData(levels);
                let peak = 0;
                for (const v of levels) peak = Math.max(peak, Math.abs(v - 128));
                if (orb && peak > 6) orb.beat(Math.min(1, peak / 60));
            }
            session.raf = requestAnimationFrame(pulse);
        };
        session.raf = requestAnimationFrame(pulse);

        const ws = new WebSocket(`${LIVE_URL}?key=${encodeURIComponent(settings.key)}`);
        session.ws = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                setup: {
                    model: `models/${liveModelName()}`,
                    generationConfig: {
                        responseModalities: ['AUDIO'],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: LIVE_VOICE } } }
                    },
                    systemInstruction: { parts: [{ text: liveContext() }] },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                }
            }));
        };

        ws.onmessage = async event => {
            if (live !== session) return;
            let msg;
            try {
                msg = JSON.parse(typeof event.data === 'string' ? event.data : await event.data.text());
            } catch {
                return;
            }
            if (msg.setupComplete) {
                session.ready = true;
                await startLiveMic(session);
                setVoiceState('listening', 'Listening…');
                return;
            }
            if (msg.goAway) {
                voiceText.textContent = 'The session is ending soon.';
                return;
            }
            const sc = msg.serverContent;
            if (!sc) return;
            if (sc.interrupted) stopLivePlayback(session);
            if (sc.inputTranscription?.text) {
                if (session.modelText) flushLiveTurn(session);
                session.userText += sc.inputTranscription.text;
                voiceText.textContent = session.userText.trim();
                if (!session.sources.size) setVoiceState('listening', 'Listening…');
                clearTimeout(session.thinkTimer);
                session.thinkTimer = setTimeout(() => {
                    if (live === session && !session.sources.size) setVoiceState('thinking', 'Thinking…');
                }, 700);
            }
            for (const part of sc.modelTurn?.parts || []) {
                const data = part.inlineData;
                if (data && /^audio\/pcm/.test(data.mimeType || '')) {
                    const rate = +(/rate=(\d+)/.exec(data.mimeType) || [0, 24000])[1];
                    playLiveChunk(session, fromBase64(data.data), rate);
                }
            }
            if (sc.outputTranscription?.text) {
                session.modelText += sc.outputTranscription.text;
                voiceText.textContent = session.modelText.trim();
            }
            if (sc.turnComplete) flushLiveTurn(session);
        };

        ws.onerror = () => { /* the close event carries the reason */ };

        ws.onclose = event => {
            if (live !== session || session.closing) return;
            flushLiveTurn(session);
            const message = explainLiveClose(event);
            addNote(addMessage('bot', '<p>Voice ended.</p>'), message);
            stopLive();
            voiceText.textContent = message;
            endVoice(false);
        };
    }

    async function startLiveMic(session) {
        const url = URL.createObjectURL(new Blob([MIC_WORKLET], { type: 'application/javascript' }));
        try {
            await session.ctx.audioWorklet.addModule(url);
        } finally {
            URL.revokeObjectURL(url);
        }
        if (live !== session) return;
        const source = session.ctx.createMediaStreamSource(session.stream);
        const node = new AudioWorkletNode(session.ctx, 'pcm-capture');
        const sink = session.ctx.createGain();
        sink.gain.value = 0;
        source.connect(node);
        node.connect(sink);
        sink.connect(session.ctx.destination);
        session.node = node;
        node.port.onmessage = ({ data }) => {
            if (live !== session || !session.ready || session.ws.readyState !== WebSocket.OPEN) return;
            session.ws.send(JSON.stringify({
                realtimeInput: { audio: { data: toBase64(data.pcm), mimeType: 'audio/pcm;rate=16000' } }
            }));
            if (orb && !session.sources.size && data.level > 0.02) orb.beat(Math.min(0.8, data.level * 6));
        };
    }

    function playLiveChunk(session, buffer, rate) {
        const pcm = new Int16Array(buffer);
        if (!pcm.length) return;
        const audio = session.ctx.createBuffer(1, pcm.length, rate);
        const channel = audio.getChannelData(0);
        for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 0x8000;
        const src = session.ctx.createBufferSource();
        src.buffer = audio;
        src.connect(session.gain);
        const now = session.ctx.currentTime;
        session.nextTime = Math.max(session.nextTime, now + 0.03);
        src.start(session.nextTime);
        session.nextTime += audio.duration;
        session.sources.add(src);
        clearTimeout(session.thinkTimer);
        setVoiceState('speaking', 'Speaking…');
        src.onended = () => {
            session.sources.delete(src);
            if (live === session && !session.sources.size) setVoiceState('listening', 'Listening…');
        };
    }

    function stopLivePlayback(session) {
        for (const src of session.sources) {
            try { src.stop(); } catch { /* already stopped */ }
        }
        session.sources.clear();
        session.nextTime = 0;
    }

    // Writes one spoken exchange into the chat so it stays after the call.
    function flushLiveTurn(session) {
        const said = session.userText.trim();
        const answer = session.modelText.trim();
        if (said) {
            addMessage('user', `<p>${escapeHtml(said)}</p>`);
            history.push({ role: 'user', text: said });
        }
        if (answer) {
            addMessage('bot', format(answer));
            history.push({ role: 'model', text: answer });
        }
        session.userText = '';
        session.modelText = '';
    }

    function stopLive() {
        const session = live;
        if (!session) return;
        live = null;
        session.closing = true;
        flushLiveTurn(session);
        clearTimeout(session.thinkTimer);
        cancelAnimationFrame(session.raf);
        stopLivePlayback(session);
        if (session.node) session.node.port.onmessage = null;
        if (session.stream) session.stream.getTracks().forEach(t => t.stop());
        if (session.ws && session.ws.readyState <= WebSocket.OPEN) {
            try { session.ws.close(1000, 'done'); } catch { /* ignore */ }
        }
        if (session.ctx) session.ctx.close().catch(() => {});
    }

    function startVoice() {
        if (liveAvailable() && !busy) {
            startLive();
            return;
        }
        if (!Recognition) {
            addMessage('bot', '<p>Voice conversations need a browser with speech recognition, such as Chrome, Edge or Safari. You can still type your questions here.</p>');
            return;
        }
        if (busy) return;
        lastFocus = document.activeElement;
        voiceOn = true;
        if (WIDGET) setAssistant('voice');
        else voicePanel.hidden = false;
        $('#voiceEnd').focus();
        if (canSpeak) speechSynthesis.getVoices();
        listen();
    }

    function endVoice(restoreFocus = true) {
        voiceOn = false;
        stopLive();
        speechQueue = [];
        speaking = false;
        if (recognizer) {
            try { recognizer.abort(); } catch { /* ignore */ }
            recognizer = null;
        }
        if (canSpeak) speechSynthesis.cancel();
        if (controller) controller.abort();
        if (orb) orb.setState('idle');
        const close = () => {
            if (WIDGET) setAssistant('open');
            else voicePanel.hidden = true;
            micBtn.focus();
        };
        if (restoreFocus) {
            close();
        } else {
            setVoiceState('idle', 'Voice is unavailable');
            setTimeout(close, 2600);
        }
    }

    if (!Recognition && !liveAvailable()) {
        micBtn.setAttribute('aria-disabled', 'true');
        micBtn.title = 'Voice needs Chrome, Edge or Safari';
    }
    micBtn.addEventListener('click', startVoice);
    $('#voiceEnd').addEventListener('click', () => endVoice());
    if (muteBtn) muteBtn.addEventListener('click', () => {
        muted = !muted;
        muteBtn.setAttribute('aria-pressed', String(muted));
        muteBtn.setAttribute('aria-label', muted ? 'Unmute spoken replies' : 'Mute spoken replies');
        muteBtn.querySelector('use').setAttribute('href', muted ? '#i-volume-x' : '#i-volume-2');
        if (muted && canSpeak) speechSynthesis.cancel();
        if (live && live.gain) live.gain.gain.value = muted ? 0 : 1;
    });
    // Tapping the orb while it speaks interrupts it and listens again.
    const interrupt = () => {
        if (!voiceOn || !speaking) return false;
        speechQueue = [];
        if (canSpeak) speechSynthesis.cancel();
        return true;
    };
    const orbHost = $('.orb');
    if (orbHost) orbHost.addEventListener('click', interrupt);
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (voiceOn) endVoice();
        else if (WIDGET && assistant.dataset.state === 'open' && !$('#settings').open) setAssistant('closed');
    });

    // ---------------------------------------------------------------
    // Floating window: closed, open, or folded into the voice pill
    // ---------------------------------------------------------------

    function setAssistant(state) {
        if (!WIDGET) return;
        const previous = assistant.dataset.state;
        assistant.dataset.state = state;
        const panel = $('#assistantPanel');
        const fab = $('#askFab');
        const open = state === 'open';
        panel.inert = !open;
        panel.setAttribute('aria-hidden', String(!open));
        fab.setAttribute('aria-expanded', String(open));
        fab.setAttribute('aria-label', state === 'voice' ? 'Voice conversation in progress. Tap to interrupt.' : open ? 'Close the assistant' : 'Ask my AI assistant');
        $('#voiceEnd').hidden = state !== 'voice';
        if (open) setTimeout(() => input.focus(), 50);
        if (state === 'closed' && previous === 'open') fab.focus();
    }

    if (WIDGET) {
        setAssistant('closed');
        $('#askFab').addEventListener('click', () => {
            const s = assistant.dataset.state;
            if (s === 'voice') interrupt();
            else setAssistant(s === 'open' ? 'closed' : 'open');
        });
        $('#closeAssistant').addEventListener('click', () => setAssistant('closed'));
        // Any link to chat.html on the page opens the window instead of leaving.
        document.querySelectorAll('a[href="chat.html"]').forEach(a => a.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || a.classList.contains('assistant-expand')) return;
            e.preventDefault();
            setAssistant('open');
        }));
        if (location.hash === '#ask') setAssistant('open');
    }

    // ---------------------------------------------------------------
    // Settings sheet
    // ---------------------------------------------------------------

    const sheet = $('#settings');
    const keyInput = $('#apiKey');
    const modelInput = $('#model');
    const liveInput = $('#liveModel');
    const remember = $('#remember');
    const status = $('#settingsStatus');
    const keyFields = $('#keyFields');
    const providerRadios = [...document.querySelectorAll('input[name="provider"]')];
    const chosenProvider = () => providerRadios.find(r => r.checked)?.value || 'none';

    function syncSheet() {
        const p = chosenProvider();
        keyFields.hidden = p === 'none';
        $('#freeKey').hidden = p !== 'gemini';
        $('#liveField').hidden = p !== 'gemini';
        if (p === 'gemini' && !liveInput.value) liveInput.value = DEFAULT_LIVE_MODEL;
        $('#testKey').disabled = p === 'none';
        if (p !== 'none') {
            modelInput.placeholder = DEFAULT_MODELS[p];
            if (!modelInput.value || Object.values(DEFAULT_MODELS).includes(modelInput.value) || RETIRED_MODELS.includes(modelInput.value)) modelInput.value = DEFAULT_MODELS[p];
            keyInput.placeholder = p === 'gemini' ? 'Gemini API key (AIza…)' : 'OpenAI API key (sk-…)';
        }
    }

    function setStatus(text, tone = '') {
        status.textContent = text;
        status.dataset.tone = tone;
    }

    function openSettings(preferred) {
        const provider = preferred && settings.provider === 'none' ? preferred : settings.provider;
        providerRadios.forEach(r => { r.checked = r.value === provider; });
        keyInput.value = settings.key || '';
        modelInput.value = settings.model || '';
        liveInput.value = settings.liveModel || '';
        remember.checked = !!settings.remember;
        setStatus('');
        syncSheet();
        sheet.showModal();
        if (provider !== 'none') keyInput.focus();
    }
    $('#openSettings').addEventListener('click', () => openSettings());
    $('#closeSettings').addEventListener('click', () => sheet.close());
    providerRadios.forEach(r => r.addEventListener('change', () => {
        setStatus('');
        syncSheet();
    }));

    $('#testKey').addEventListener('click', async () => {
        const p = chosenProvider();
        const key = keyInput.value.trim();
        if (!key) {
            setStatus('Paste a key first.', 'error');
            keyInput.focus();
            return;
        }
        setStatus('Testing…');
        $('#testKey').disabled = true;
        try {
            await testConnection(p, key, modelInput.value.trim());
            setStatus('Connected. The key works.', 'ok');
        } catch (err) {
            setStatus(err.message || 'Couldn’t reach the provider. Check your connection.', 'error');
        } finally {
            $('#testKey').disabled = false;
        }
    });

    $('#saveSettings').addEventListener('click', () => {
        const p = chosenProvider();
        const key = keyInput.value.trim();
        if (p !== 'none' && !key) {
            setStatus('Paste a key, or choose “No key”.', 'error');
            keyInput.focus();
            return;
        }
        settings = p === 'none'
            ? { provider: 'none', key: '', model: '', remember: false }
            : {
                provider: p,
                key,
                model: modelInput.value.trim(),
                liveModel: p === 'gemini' && liveInput.value.trim() !== DEFAULT_LIVE_MODEL ? liveInput.value.trim() : '',
                remember: remember.checked
            };
        micBtn.removeAttribute('aria-disabled');
        if (!Recognition && !liveAvailable()) micBtn.setAttribute('aria-disabled', 'true');
        persist();
        renderMode();
        sheet.close();
        addMessage('bot', format(p === 'none'
            ? 'Switched to the built-in guide. Answers now come from Mubin’s portfolio without a model.'
            : p === 'gemini'
                ? `Connected to Gemini (${modelName()}). Tap the wave button for **live voice** with ${liveModelName()}.`
                : `Connected to OpenAI (${modelName()}). Ask anything about Mubin’s work.`));
    });

    // ---------------------------------------------------------------
    // Start
    // ---------------------------------------------------------------

    renderMode();
    const intro = addMessage('bot', format('Hi, I’m the assistant on Mubin’s portfolio. Ask me about his **projects, research, experience or awards**. Type, or tap the wave button to **talk**.'));
    if (!usingModel()) {
        const note = document.createElement('p');
        note.className = 'bubble-note';
        note.append('Running on the built-in guide. For free-form answers, ');
        const setup = document.createElement('button');
        setup.type = 'button';
        setup.className = 'inline-link';
        setup.textContent = 'connect a free Gemini key';
        setup.addEventListener('click', () => openSettings('gemini'));
        note.append(setup, '.');
        intro.appendChild(note);
    }
    showChips(['Who is Mubin?', 'Flagship projects', 'Research', 'Is he available?']);
    autosize();

    // Deep link: chat.html?q=… asks straight away.
    const q = new URLSearchParams(location.search).get('q');
    if (q) ask(q);
})();
