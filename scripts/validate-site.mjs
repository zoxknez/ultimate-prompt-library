#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectJpeg } from './lib/jpeg.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const stats = JSON.parse(readFileSync(path.join(ROOT, 'indexes/stats.json'), 'utf8'));
const index = JSON.parse(readFileSync(path.join(ROOT, 'indexes/prompts.json'), 'utf8'));

const errors = [];

function requireFile(rel) {
  const full = path.join(DIST, rel);
  if (!existsSync(full) || !statSync(full).isFile()) errors.push(`Missing generated file: ${rel}`);
  return full;
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

requireFile('index.html');
requireFile('sr/index.html');
requireFile('prompts/index.html');
requireFile('sr/prompts/index.html');
requireFile('assets/site.css');
requireFile('assets/site.js');
requireFile('sitemap.xml');
requireFile('robots.txt');
requireFile('site.webmanifest');
requireFile('404.html');

const promptPages = walk(path.join(DIST, 'prompts'))
  .filter((file) => file.endsWith('index.html') && !file.endsWith(path.join('prompts', 'index.html')));

if (promptPages.length !== stats.localizedPromptFiles) {
  errors.push(`Expected ${stats.localizedPromptFiles} localized prompt pages, found ${promptPages.length}`);
}

for (const prompt of index.prompts) {
  for (const lang of prompt.languages) {
    const rel = path.join('prompts', lang, `${prompt.id.toLowerCase()}-${prompt.slug}`, 'index.html');
    const full = requireFile(rel);
    if (!existsSync(full)) continue;
    const html = readFileSync(full, 'utf8');
    if (!html.includes(prompt.id)) errors.push(`Prompt ID missing from page: ${rel}`);
    const interfaceHtml = html
      .replace(/<nav\b[^>]*\bclass="[^"]*\btoc\b[^"]*"[\s\S]*?<\/nav>/, '')
      .replace(/<article\b[^>]*\bclass="[^"]*\bmarkdown-body\b[^"]*"[\s\S]*?<\/article>/, '')
      .replace(/<script\b[^>]*\bid="raw-prompt"[^>]*>[\s\S]*?<\/script>/, '');
    if (interfaceHtml.includes('undefined')) errors.push(`Undefined value rendered in: ${rel}`);
    if (html.includes('—')) errors.push(`Em dash found in generated page: ${rel}`);
  }
}

const home = readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (!home.includes(String(stats.uniquePrompts))) errors.push('Home page does not include current prompt count.');
if (!home.includes('UPL-IT-001')) errors.push('Home page prompt preview is missing.');

// Social share image: every page must reference one image that exists in dist, is a structurally
// valid JPEG and matches the declared 1200x630 size (a corrupt JPEG shipped once and rendered grey).
const ogImages = new Set();
for (const file of walk(DIST).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  const imageSrc = html.match(/<link rel="image_src" href="([^"]+)"/);
  const twitterCard = html.includes('<meta name="twitter:card" content="summary_large_image">');
  const twitterImage = html.match(/<meta name="twitter:image" content="([^"]+)"/);
  if (match) ogImages.add(match[1]);
  else errors.push(`og:image missing in ${path.relative(DIST, file)}`);
  if (!imageSrc) errors.push(`image_src link missing in ${path.relative(DIST, file)}`);
  else if (match && imageSrc[1] !== match[1]) errors.push(`image_src does not match og:image in ${path.relative(DIST, file)}`);
  if (!twitterCard) errors.push(`twitter:card missing in ${path.relative(DIST, file)}`);
  if (!twitterImage) errors.push(`twitter:image missing in ${path.relative(DIST, file)}`);
  else if (match && twitterImage[1] !== match[1]) errors.push(`twitter:image does not match og:image in ${path.relative(DIST, file)}`);
}
if (ogImages.size !== 1) errors.push(`Expected one og:image URL across the site, found ${ogImages.size}.`);
for (const url of ogImages) {
  const rel = new URL(url).pathname;
  const file = path.join(DIST, ...rel.split('/').filter(Boolean));
  if (!existsSync(file)) {
    errors.push(`og:image ${rel} is not in dist.`);
    continue;
  }
  const jpeg = inspectJpeg(readFileSync(file));
  if (!jpeg.ok) errors.push(`og:image ${rel} is not a valid JPEG: ${jpeg.errors.join('; ')}`);
  if (jpeg.width !== 1200 || jpeg.height !== 630) errors.push(`og:image ${rel} is ${jpeg.width}x${jpeg.height}, expected 1200x630.`);
  if (!home.includes(`<meta property="og:image:width" content="${jpeg.width}">`)) errors.push('og:image:width does not match the image.');
}

if (errors.length) {
  console.error(`Website validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Website validation passed: ${promptPages.length} prompt pages, ${stats.uniquePrompts} unique prompts.`);
