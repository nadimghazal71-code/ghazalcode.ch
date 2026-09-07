# ghazalcode.ch

Personal site and portfolio of Nadim Ghazal — React developer, Zurich.

Static: plain HTML, CSS and JavaScript, no build step and no dependencies.
Served by GitHub Pages at [ghazalcode.ch](https://ghazalcode.ch).

## Editing the content

All wording lives in [`content.js`](content.js) as a single `CONTENT` object —
nav labels, hero text, about, skills, languages, experience, education, projects
and contact. `script.js` renders it into the placeholder elements in
`index.html` on load.

**To change any text on the site, edit `content.js`.** You should not need to
touch `index.html` or `script.js` unless you are adding a new kind of section.

Adding a project is one entry in `CONTENT.projects.items`:

```js
{
  title: "…",
  description: "…",
  tags: ["React", "TypeScript"],
  demo: "projects/slug/",                     // optional
  repo: "https://github.com/user/repo"        // optional
}
```

Either link may be omitted and that button simply won't render.

## Contact form

The site is static, so the form posts to a relay service which forwards the
message by email. The endpoint is `CONTENT.contact.form.endpoint` in
`content.js` — swapping it for Formspree or Web3Forms needs no other change.

## Live demos

The two project demos are built copies committed under `projects/`, so they are
served from this same domain:

| Path | Source repo |
| --- | --- |
| `projects/qr-bill/` | [swiss-qr-bill-studio](https://github.com/nadimghazal71-code/swiss-qr-bill-studio) — `npm run build`, then copy `dist/` here |
| `projects/deutsch/` | [a2-deutsch-app](https://github.com/nadimghazal71-code/a2-deutsch-app) — copy `index.html`, `app.js`, `style.css`, `vocab-data.js` |

## Deploying

Push to `main`. GitHub Pages publishes from the repository root; `CNAME` holds
the custom domain and `.nojekyll` stops Pages from running the files through
Jekyll.

## Local preview

Any static server works, for example:

```bash
npx serve .
```
