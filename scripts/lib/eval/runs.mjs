// Location of live run artifacts. `.eval-runs/` is git-ignored because runs contain raw model
// output and usage metadata. UPL_EVAL_RUNS_DIR (absolute path) exists for tests only.

import { existsSync, lstatSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { resolveSafeFile, ROOT } from './safety.mjs';

export function runsDir() {
  const override = process.env.UPL_EVAL_RUNS_DIR;
  if (override) {
    if (!path.isAbsolute(override)) throw new Error('UPL_EVAL_RUNS_DIR must be an absolute path.');
    return override;
  }
  return path.join(ROOT, '.eval-runs');
}

export function resolveRunFile(userPath) {
  const base = runsDir();
  const resolved = path.isAbsolute(userPath) ? userPath : path.resolve(ROOT, userPath);
  return resolveSafeFile(resolved, { baseDir: base, label: 'run file' });
}

/** Most recent run file by name (run IDs start with an ISO timestamp). */
export function latestRunFile() {
  const dir = runsDir();
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((name) => /^run-.+\.json$/.test(name))
    .filter((name) => {
      const full = path.join(dir, name);
      return !lstatSync(full).isSymbolicLink() && statSync(full).isFile();
    })
    .sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}
