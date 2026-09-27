#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { enhancePrompt, V2_MARKER, V2_VERSION } from './lib/v2-quality.mjs';

const ROOT = process.cwd();
const PROMPTS = path.join(ROOT, 'prompts');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function parse(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('Missing front matter: ' + file);
  return { data: YAML.parse(match[1]) || {}, body: match[2].trimEnd() };
}

const files = walk(PROMPTS).filter((file) => file.endsWith('.md') && path.basename(file) !== 'README.md');
if (files.length !== 2000) throw new Error('Expected 2000 localized prompt files, found ' + files.length);

let changed = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = parse(source, file);
  const enhanced = enhancePrompt(parsed);
  if (source.includes(V2_MARKER) && parsed.data.version === V2_VERSION) continue;

  const yaml = source.match(/^---\n([\s\S]*?)\n---/)[1]
    .replace(/^version:\s*[^\n]+$/m, 'version: ' + V2_VERSION);
  const next = '---\n' + yaml + '\n---\n\n' + enhanced.body.trim() + '\n';
  fs.writeFileSync(file, next, 'utf8');
  changed++;
}

const failures = files.filter((file) => {
  const text = fs.readFileSync(file, 'utf8');
  return !text.includes(V2_MARKER) || !/^version:\s*2\.0\.0$/m.test(text);
});
if (failures.length) throw new Error('V2 materialization failures: ' + failures.slice(0, 10).join(', '));

console.log(JSON.stringify({ scanned: files.length, changed, version: V2_VERSION }, null, 2));
