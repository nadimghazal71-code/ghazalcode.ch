/*
  Reads the data in content.js (CONTENT) and renders it into the empty
  placeholder elements in index.html. Each renderX() function handles one
  section; renderAll() runs them all once on page load. Below that, this
  file also wires up the mobile nav toggle, the contact form, and the
  scroll-reveal fade-in animation for each section.
*/

function renderNav() {
  const nav = CONTENT.nav;
  const links = [
    ["#about", nav.about],
    ["#skills", nav.skills],
    ["#languages", nav.languages],
    ["#experience", nav.experience],
    ["#education", nav.education],
    ["#projects", nav.projects],
    ["#contact", nav.contact]
  ];
  document.getElementById("navLinks").innerHTML = links
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("");

  // Close the mobile menu whenever a nav link is clicked
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("navLinks").classList.remove("open");
    });
  });
}

function renderHero() {
  const c = CONTENT;
  document.getElementById("heroEyebrow").textContent = c.hero.eyebrow;
  document.getElementById("heroRole").textContent = c.hero.role;
  document.getElementById("heroTagline").textContent = c.hero.tagline;
  document.getElementById("heroContactBtn").textContent = c.hero.contactBtn;
}

function renderAbout() {
  const c = CONTENT.about;
  document.getElementById("aboutTag").textContent = c.tag;
  document.getElementById("aboutHeading").textContent = c.heading;
  document.getElementById("aboutBio").textContent = c.bio;
  document.getElementById("aboutInfo").innerHTML = c.info
    .map(item => `
      <div class="info-item${item.highlight ? " info-item--highlight" : ""}">
        <span class="info-label">${item.label}</span>
        <span class="info-value">${Array.isArray(item.value) ? item.value.join("<br>") : item.value}</span>
      </div>
    `).join("");
}

function renderSkills() {
  const c = CONTENT.skills;
  document.getElementById("skillsTag").textContent = c.tag;
  document.getElementById("skillsHeading").textContent = c.heading;
  document.getElementById("skillsGrid").innerHTML = c.categories
    .map(cat => `
      <div class="skill-card">
        <div class="skill-icon">${cat.icon}</div>
        <h3>${cat.title}</h3>
        <p>${cat.items}</p>
      </div>
    `).join("");
}

function renderLanguages() {
  const c = CONTENT.languages;
  document.getElementById("languagesTag").textContent = c.tag;
  document.getElementById("languagesHeading").textContent = c.heading;
  document.getElementById("languagesGrid").innerHTML = c.list
    .map(item => `
      <div class="language-item">
        <div class="language-top">
          <span class="language-name">${item.name}</span>
          <span class="language-level">${item.level}</span>
        </div>
        <div class="language-bar"><div class="language-fill" data-pct="${item.pct}"></div></div>
      </div>
    `).join("");

  // The width is applied here rather than as a style="" attribute: the Content
  // Security Policy blocks inline styles, but CSSOM assignment is permitted.
  document.querySelectorAll("#languagesGrid .language-fill").forEach(fill => {
    fill.style.width = `${fill.dataset.pct}%`;
  });
}

// Shared by both Experience and Education — they use the same timeline markup,
// just with different data (data.jobs for Experience, data.items for Education)
function renderTimeline(containerId, tagId, headingId, data) {
  document.getElementById(tagId).textContent = data.tag;
  document.getElementById(headingId).textContent = data.heading;
  const entries = data.jobs || data.items;
  document.getElementById(containerId).innerHTML = entries
    .map(entry => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-date">${entry.date}</span>
          <h3>${entry.title}</h3>
          <p class="timeline-org">${entry.org}</p>
          ${entry.bullets.length ? `<ul class="timeline-bullets">${entry.bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    `).join("");
}

function renderProjects() {
  const c = CONTENT.projects;
  document.getElementById("projectsTag").textContent = c.tag;
  document.getElementById("projectsHeading").textContent = c.heading;
  document.getElementById("projectsGrid").innerHTML = c.items
    // With no image, the card falls back to one of the thumb-1/2/3 gradients
    // so it still looks deliberate rather than empty.
    .map((p, i) => `
      <div class="project-card">
        <div class="project-thumb${p.image ? "" : ` thumb-${(i % 3) + 1}`}">
          ${p.image ? `<img src="${p.image}" alt="${p.imageAlt || ""}" loading="lazy" width="760" height="320">` : ""}
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          ${p.tags && p.tags.length
            ? `<ul class="project-tags">${p.tags.map(t => `<li>${t}</li>`).join("")}</ul>`
            : ""}
          <div class="project-links">
            ${p.demo ? `<a href="${p.demo}" class="project-link project-link--demo" target="_blank" rel="noopener">Live demo ↗</a>` : ""}
            ${p.repo ? `<a href="${p.repo}" class="project-link" target="_blank" rel="noopener">Code on GitHub ↗</a>` : ""}
          </div>
        </div>
      </div>
    `).join("");
}

function renderContact() {
  const c = CONTENT.contact;
  document.getElementById("contactTag").textContent = c.tag;
  document.getElementById("contactHeading").textContent = c.heading;
  document.getElementById("contactText").textContent = c.text;
  document.getElementById("contactRefs").textContent = c.refs;
  document.getElementById("contactDetails").innerHTML = c.details
    .map(d => `
      <li>
        <span class="detail-label">${d.label}</span>
        ${d.href ? `<a href="${d.href}">${d.value}</a>` : `<span>${d.value}</span>`}
      </li>
    `).join("");

  document.getElementById("formName").placeholder = c.form.name;
  document.getElementById("formEmail").placeholder = c.form.email;
  document.getElementById("formMessage").placeholder = c.form.message;
  document.getElementById("formSubmit").textContent = c.form.submit;
}

function renderFooter() {
  document.getElementById("footerText").textContent = CONTENT.footer.replace("{year}", new Date().getFullYear());
}

function renderAll() {
  renderNav();
  renderHero();
  renderAbout();
  renderSkills();
  renderLanguages();
  renderTimeline("experienceTimeline", "experienceTag", "experienceHeading", CONTENT.experience);
  renderTimeline("educationTimeline", "educationTag", "educationHeading", CONTENT.education);
  renderProjects();
  renderContact();
  renderFooter();
}

// Mobile hamburger menu toggle
const navToggle = document.getElementById("navToggle");
navToggle.addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

renderAll();

/*
  Contact form. The site is static, so the message is handed to a relay service
  (configured as contact.form.endpoint in content.js) which forwards it by email.
  The button is disabled while the request is in flight so a slow connection
  can't produce three copies of the same message.
*/
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = CONTENT.contact.form;
  const note = document.getElementById("formNote");
  const submitBtn = document.getElementById("formSubmit");

  // Bots fill in every field they find; a real visitor never sees this one.
  if (contactForm.querySelector('[name="_honey"]').value) return;

  const label = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = f.sending;
  note.textContent = "";
  note.className = "form-note";

  try {
    const response = await fetch(f.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: document.getElementById("formName").value,
        email: document.getElementById("formEmail").value,
        message: document.getElementById("formMessage").value,
        _subject: f.subject,
        _template: "table",
        _captcha: "false"
      })
    });
    if (!response.ok) throw new Error(`Relay responded ${response.status}`);
    note.textContent = f.success;
    note.classList.add("is-success");
    contactForm.reset();
  } catch (error) {
    note.textContent = f.error;
    note.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = label;
  }
});

// Fade + slide each section into view the first time it scrolls onscreen
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// Setting .style properties is CSSOM, which the Content Security Policy allows.
// The matching .in-view rule lives in style.css — injecting a <style> element
// here would count as an inline stylesheet and be blocked by style-src.
document.querySelectorAll(".section").forEach(sec => {
  sec.style.opacity = 0;
  sec.style.transform = "translateY(24px)";
  sec.style.transition = "opacity 0.7s ease, transform 0.7s ease";
  observer.observe(sec);
});
