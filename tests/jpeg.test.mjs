// Structural JPEG check used by validate-site for the social share image.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectJpeg } from '../scripts/lib/jpeg.mjs';

const image = readFileSync(new URL('../site-src/promptlibrary-og-v3.jpg', import.meta.url));

test('the committed share image is a valid 1200x630 JPEG', () => {
  const result = inspectJpeg(image);
  assert.deepEqual(result.errors, []);
  assert.equal(result.width, 1200);
  assert.equal(result.height, 630);
});

test('a 0xFF byte without 0x00 stuffing in scan data is rejected', () => {
  const broken = Buffer.from(image);
  // Find the first stuffed 0xFF 0x00 pair after the start of scan and drop the stuffing byte,
  // the same defect that made the first share image render as a grey box.
  const sos = broken.indexOf(Buffer.from([0xff, 0xda]));
  let at = -1;
  for (let i = sos + 2; i < broken.length - 1; i += 1) {
    if (broken[i] === 0xff && broken[i + 1] === 0x00) { at = i; break; }
  }
  assert.ok(at > 0, 'test image should contain stuffed 0xFF bytes');
  broken[at + 1] = 0xf0;
  assert.equal(inspectJpeg(broken).ok, false);
});

test('non-JPEG and truncated data are rejected', () => {
  assert.equal(inspectJpeg(Buffer.from('not a jpeg')).ok, false);
  assert.equal(inspectJpeg(image.subarray(0, 400)).ok, false);
});
