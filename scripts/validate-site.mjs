#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
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
    if (html.includes('undefined')) errors.push(`Undefined value rendered in: ${rel}`);
    if (html.includes('—')) errors.push(`Em dash found in generated page: ${rel}`);
  }
}

const home = readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (!home.includes(String(stats.uniquePrompts))) errors.push('Home page does not include current prompt count.');
if (!home.includes('UPL-IT-001')) errors.push('Home page prompt preview is missing.');

if (errors.length) {
  console.error(`Website validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Website validation passed: ${promptPages.length} prompt pages, ${stats.uniquePrompts} unique prompts.`);
