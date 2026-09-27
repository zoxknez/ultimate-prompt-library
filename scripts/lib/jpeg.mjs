// Minimal structural JPEG checker (no decoding). Added after the first social share image turned
// out to be a corrupt progressive JPEG: a 0xFF byte inside entropy-coded scan data was not
// followed by the required 0x00 stuffing, so decoders stopped and platforms showed a grey box.

const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** Returns { ok, width, height, progressive, scans, errors }. */
export function inspectJpeg(buffer) {
  const b = buffer;
  const errors = [];
  const result = { ok: false, width: null, height: null, progressive: false, scans: 0, errors };
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) {
    errors.push('missing SOI marker');
    return result;
  }
  let i = 2;
  let sawEoi = false;
  while (i < b.length) {
    if (b[i] !== 0xff) {
      errors.push('expected a marker at byte ' + i);
      break;
    }
    while (b[i + 1] === 0xff) i += 1; // fill bytes
    const marker = b[i + 1];
    if (marker === 0xd9) {
      sawEoi = true;
      break;
    }
    if (i + 3 >= b.length) {
      errors.push('truncated segment header at byte ' + i);
      break;
    }
    const length = b.readUInt16BE(i + 2);
    if (length < 2 || i + 2 + length > b.length) {
      errors.push('segment FF' + marker.toString(16).toUpperCase() + ' at byte ' + i + ' has an invalid length');
      break;
    }
    if (marker >= 0xf0 && marker <= 0xfd) errors.push('reserved marker FF' + marker.toString(16).toUpperCase() + ' at byte ' + i);
    if (SOF.has(marker)) {
      result.height = b.readUInt16BE(i + 5);
      result.width = b.readUInt16BE(i + 7);
      result.progressive = marker === 0xc2 || marker === 0xc6 || marker === 0xca || marker === 0xce;
    }
    if (marker === 0xc4) {
      let p = i + 4;
      const end = i + 2 + length;
      while (p < end) {
        const counts = [...b.subarray(p + 1, p + 17)];
        const n = counts.reduce((sum, c) => sum + c, 0);
        let codes = 0;
        for (let bits = 0; bits < 16; bits += 1) {
          codes = (codes + counts[bits]) * 2;
          if (codes > 2 ** (bits + 2)) errors.push('Huffman table at byte ' + p + ' is over-subscribed');
        }
        if (n > 256) errors.push('Huffman table at byte ' + p + ' declares ' + n + ' symbols');
        p += 17 + n;
      }
    }
    i += 2 + length;
    if (marker === 0xda) {
      result.scans += 1;
      // Entropy-coded data: 0xFF must be followed by 0x00 (stuffing) or a restart marker.
      while (i < b.length - 1) {
        if (b[i] === 0xff) {
          const next = b[i + 1];
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
            i += 2;
            continue;
          }
          if (next === 0xff) {
            i += 1;
            continue;
          }
          break; // a real marker ends the scan
        }
        i += 1;
      }
    }
  }
  if (!sawEoi && !errors.length) errors.push('missing EOI marker');
  if (!result.scans) errors.push('no scan data');
  if (!result.width || !result.height) errors.push('no frame header');
  result.ok = errors.length === 0;
  return result;
}
