/*
  All the text shown on the site lives in this file. script.js reads CONTENT
  and renders it into the page on load — to change any wording (or add/remove
  a job, skill, language, project, etc.), edit the data here; you shouldn't
  need to touch index.html or script.js for text changes.
*/
const CONTENT = {
  // Labels for the nav bar links, keyed to match the section IDs in index.html
  nav: { about: "About", skills: "Skills", languages: "Languages", experience: "Experience", education: "Education", projects: "Projects", contact: "Contact" },

  // Top banner: name, role, tagline, and the two CTA buttons
  hero: {
    eyebrow: "Hello, I'm",
    role: "React Developer | Frontend Engineer | Fintech Specialist",
    tagline: "React developer with a bachelor's degree in computer science and hands-on experience delivering front-end applications for banking, fintech, and real estate automation. Based in Zurich with a Swiss work permit and immediately available.",
    contactBtn: "Get in Touch",
    cvBtn: "Download CV"
  },

  // Bio paragraph + the personal-details grid (Nationality, Civil Status, etc.)
  about: {
    tag: "About",
    heading: "A little about me",
    bio: "React developer with a bachelor's degree in computer science and hands-on experience delivering front-end applications for the banking, fintech, and real estate automation sectors. Previous professional experience at Lyst Technologies includes building and testing front-end interfaces for banking clients and designing complex BIRT data reports. Based in Zurich with Swiss work permit and immediately available.",
    // Work permit deliberately comes first: it answers a Swiss recruiter's
    // very first question before they have to ask it.
    info: [
      { label: "Work Permit", value: "B Permit — no sponsorship required", highlight: true },
      { label: "Nationality", value: "Lebanese" },
      { label: "Civil Status", value: "Married" },
      { label: "Birth Date", value: "19th October 1998" },
      // value as an array renders each entry on its own line (see script.js renderAbout)
      { label: "Contact", value: ["nadimghazal71@gmail.com", "+41 76 794 85 18"] }
    ]
  },

  // One card per skill category
  skills: {
    tag: "Skills",
    heading: "What I bring to the table",
    categories: [
      { icon: "⚛️", title: "Frontend", items: "React, HTML5, CSS3, TypeScript, JavaScript (ES6+), Responsive Design" },
      { icon: "📊", title: "Reporting", items: "BIRT Report Design, Data Validation, Business Analysis" },
      { icon: "🗄️", title: "Backend / DB", items: "Java, C++, PHP, SQL, Database Maintenance" },
      { icon: "🛠️", title: "Tools", items: "Chrome DevTools, Microsoft Office, Postman (basic)" }
    ]
  },

  // pct controls how full each proficiency bar renders (0-100)
  languages: {
    tag: "Languages",
    heading: "Languages I speak",
    list: [
      { name: "English", level: "Professional Proficiency (C1)", pct: 90 },
      { name: "German", level: "A2 — currently studying B1", pct: 45 },
      { name: "Arabic", level: "Native", pct: 100 }
    ]
  },

  // Work history, newest first. bullets can be an empty array if there's nothing to list
  experience: {
    tag: "Experience",
    heading: "Where I've worked",
    jobs: [
      {
        date: "Oct 2024 — Jan 2026",
        title: "Freelance React Developer",
        org: "Remote",
        bullets: [
          "Developing frontend components in React",
          "Building and maintaining responsive UI features for a web-based template editor"
        ]
      },
      {
        date: "Nov 2023 — Sep 2024",
        title: "Software Developer / Technical Consultant",
        org: "Lyst Technologies | Beirut, Lebanon",
        bullets: [
          "Developed and manually tested frontend components for banking web and mobile applications using HTML, CSS, and JavaScript, verifying UI accuracy and functional correctness against client specifications",
          "Designed and validated complex BIRT reports for banking clients, ensuring data accuracy and output consistency across multiple test scenarios",
          "Managed full development life cycle from requirements analysis through design, implementation, and client delivery for major banking clients",
          "Mentored and onboarded new team members, guiding them through development standards and best practices",
          "Collaborated with project managers and client stakeholders to deliver high-quality solutions on schedule"
        ]
      },
      {
        date: "Sep 2023 — Nov 2023",
        title: "Software Developer Intern",
        org: "Lyst Technologies | Beirut, Lebanon",
        bullets: [
          "Contributed to frontend web and mobile app development using HTML, CSS, and JavaScript on a proprietary fintech platform",
          "Created dynamic BIRT reports to support business analysis and client decision-making"
        ]
      }
    ]
  },

  // Degrees and certificates, newest first
  education: {
    tag: "Education",
    heading: "My academic path",
    items: [
      {
        date: "Oct 2017 — June 2022",
        title: "Bachelor of Computer Science",
        org: "Lebanese International University, Beirut",
        bullets: ["Core modules: Software Development (Java, C++), Web Development (HTML, CSS, PHP, Bootstrap), Android App Development, Database Systems"]
      },
      {
        date: "Mar 2019 — Jun 2019",
        title: "CISCO IT Essentials (ITE) Certificate",
        org: "Cisco Networking Academy",
        bullets: []
      }
    ]
  },

  /*
    One card per project. `demo` is a live, clickable build hosted on this same
    domain; `repo` is the public source. Either can be omitted and the button
    simply won't render (see script.js renderProjects).
  */
  projects: {
    tag: "Projects",
    heading: "Things I've built",
    items: [
      {
        title: "Swiss QR-Bill Studio",
        description: "A generator, validator and decoder for the Swiss QR-bill — the payment slip on every Swiss invoice since 2020. Implements the SIX Implementation Guidelines v2.3: IBAN validation, the Modulo 10 recursive check digit, ISO 11649 creditor references, and the full Swiss Payments Code, with the slip rendered at true 210 × 105 mm for print.",
        tags: ["React", "TypeScript", "Vite", "Swiss Payment Standards"],
        demo: "projects/qr-bill/",
        repo: "https://github.com/nadimghazal71-code/swiss-qr-bill-studio"
      },
      {
        title: "A2 Deutsch Trainer",
        description: "A vocabulary trainer built around the Goethe A2 word list, made while studying for the exam myself. Runs as a web app and as a React Native mobile app with an installable Android build.",
        tags: ["JavaScript", "React Native", "Expo"],
        demo: "projects/deutsch/",
        repo: "https://github.com/nadimghazal71-code/a2-deutsch-app"
      }
    ]
  },

  // Direct contact details + the message form's placeholder text
  contact: {
    tag: "Contact",
    heading: "Let's work together",
    text: "Have an opportunity, project, or just want to say hi? Fill out the form or reach me directly through the details below.",
    details: [
      { label: "Email", value: "nadimghazal71@gmail.com", href: "mailto:nadimghazal71@gmail.com" },
      { label: "Phone", value: "+41 76 794 85 18", href: "tel:+41767948518" },
      { label: "Location", value: "Wohlenschwil" }
    ],
    refs: "References upon request",
    form: {
      name: "Your Name",
      email: "Your Email",
      message: "Your Message",
      submit: "Send Message",
      // Messages are relayed by FormSubmit, which needs no account: it posts to
      // the address below and forwards it on. Swap the endpoint for a different
      // service (Formspree, Web3Forms) and nothing else has to change.
      endpoint: "https://formsubmit.co/ajax/nadimghazal71@gmail.com",
      subject: "New message from ghazalcode.ch",
      sending: "Sending…",
      success: "Thanks for reaching out — your message is on its way. I'll reply shortly.",
      error: "Something went wrong sending that. Please email me directly at nadimghazal71@gmail.com."
    }
  },

  // {year} is replaced with the current year automatically in script.js
  footer: "© {year} Nadim Ghazal. All rights reserved."
};
