import fs from 'node:fs';
import { esc } from './search.mjs';

const front = (label, title, description) => `<section class="editorial-intro wrap"><div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="blog.html">Blog</a></div><div class="eyebrow">${esc(label)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></section>`;

function readPost(file, directory, pages) {
  const post = JSON.parse(fs.readFileSync(new URL(file, directory), 'utf8'));
  const hasText = value => typeof value === 'string' && value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(file) || file !== post.slug + '.json' ||
      !Object.hasOwn(pages, String(post.relatedPage).replace(/\.html$/, '')) ||
      !/^[a-z0-9-]+\.html$/.test(post.relatedPage) ||
      ![post.title, post.description, post.answer].every(hasText) ||
      !/^\d{4}-\d\d-\d\d$/.test(post.date) || !Number.isFinite(Date.parse(post.date)) ||
      !Array.isArray(post.sections) || post.sections.length < 3 ||
      !Array.isArray(post.questions) || !Array.isArray(post.sources) || !post.sources.length) {
    throw new Error(`Invalid article: ${file}`);
  }
  const citationsOk = ids => Array.isArray(ids) && ids.every(id =>
    Number.isInteger(id) && id >= 1 && id <= post.sources.length);
  if (post.sources.some(source => !hasText(source.title) || new URL(source.url).protocol !== 'https:') ||
      !citationsOk(post.answerSources) ||
      post.sections.some(section => !hasText(section.heading) || !Array.isArray(section.paragraphs) ||
        !section.paragraphs.length || !section.paragraphs.every(hasText) || !citationsOk(section.sources)) ||
      post.questions.some(question => !hasText(question.question) || !hasText(question.answer) || !citationsOk(question.sources))) {
    throw new Error(`Invalid article content or citations: ${file}`);
  }
  return post;
}

const cite = ids => [...new Set(ids)].map(id =>
  ` <sup><a href="#source-${id}" aria-label="Source ${id}">[${id}]</a></sup>`).join('');

function body(post) {
  const sections = post.sections.map((section, i) => `<section class="search-section" id="section-${i + 1}">
    <h2>${esc(section.heading)}</h2>
    ${section.paragraphs.map((paragraph, index) => `<p>${esc(paragraph)}${index === section.paragraphs.length - 1 ? cite(section.sources) : ''}</p>`).join('')}
  </section>`).join('');
  const questions = post.questions.length ? `<section class="search-section"><h2>Common questions</h2>
    ${post.questions.map(item => `<h3>${esc(item.question)}</h3><p>${esc(item.answer)}${cite(item.sources)}</p>`).join('')}
  </section>` : '';
  return front('Zorko Group blog', post.title, post.description) +
    `<div class="wrap search-layout"><article class="search-content">
      <p class="note">Zorko Group · <time datetime="${post.date}">${post.date}</time></p>
      <section class="search-section"><h2>At a glance</h2><p>${esc(post.answer)}${cite(post.answerSources)}</p></section>
      <nav class="search-toc" aria-label="In this article"><strong>In this article</strong><ol>
        ${post.sections.map((section, i) => `<li><a href="#section-${i + 1}">${esc(section.heading)}</a></li>`).join('')}
      </ol></nav>
      ${sections}${questions}
      <section class="search-section"><h2>Sources</h2><ol>${post.sources.map((source, i) =>
        `<li id="source-${i + 1}"><a href="${esc(source.url)}">${esc(source.title)}</a></li>`).join('')}</ol></section>
    </article><aside class="search-related"><h2>Related information</h2><div>
      <a class="text-link" href="${post.relatedPage}">Explore the related Zorko page</a>
      <a class="text-link" href="blog.html">More articles</a>
    </div></aside></div>`;
}

export function addBlogPages(pages, directory = new URL('./content/blog/', import.meta.url)) {
  const files = fs.existsSync(directory) ? fs.readdirSync(directory).filter(name => name.endsWith('.json')) : [];
  const posts = files.map(file => readPost(file, directory, pages))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  for (const post of posts) {
    const key = 'blog-' + post.slug;
    if (Object.hasOwn(pages, key)) throw new Error(`Duplicate article URL: ${key}`);
    pages[key] = { title: post.title + ' | Zorko Group', description: post.description,
      article: true, published: post.date, body: body(post) };
  }
  const intro = 'Practical articles about food franchises, business consultancy, sales careers and working life.';
  const items = posts.map(post => `<a class="search-card" href="blog-${post.slug}.html"><h2>${esc(post.title)}</h2><p>${esc(post.description)}</p></a>`).join('');
  pages.blog = { title: 'Franchise, Business & Careers Blog | Zorko Group', description: intro,
    body: front('Insights', 'Zorko Group Blog', intro) + `<section class="section wrap search-overview">
      ${items ? `<div class="search-cards">${items}</div>` : '<h2>Explore our guides</h2><p>Find practical starting points in our <a href="resources.html">business and career resources</a>.</p>'}
    </section>` };
  pages.resources.body += '<section class="section wrap search-overview"><h2>Latest insights</h2><p>Read the <a href="blog.html">Zorko Group Blog</a> for articles on food businesses and careers.</p></section>';
}
