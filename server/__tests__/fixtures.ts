import { Buffer } from 'node:buffer';
import { deflateSync } from 'node:zlib';

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value;
  }
  return table;
})();

const crc32 = (data: Buffer) => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type: string, data: Buffer) => {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
};

export const createTinyPngBuffer = () => {
  const ihdr = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00]);
  const idat = deflateSync(Buffer.from([0x78, 0x9c, 0x62, 0x00, 0x02, 0x00, 0x00, 0x05, 0x00, 0x01]));

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
};

export const liveIdentifyPayload = {
  detectedName: 'Desk lamp',
  category: 'Home object',
  confidence: 0.88,
  summary: 'A modern desk lamp with a rounded shade.',
  notableDetails: ['Matte finish'],
  possibleMatches: ['Bedside lamp'],
  careOrUsageTips: ['Use a warm bulb for softer reading light.'],
  safetyNotes: ['Do not use damaged cords.'],
  followUpPrompts: ['How do I clean the shade safely?'],
  visualTags: ['lamp', 'desk'],
  disclaimer: 'Confirm rare or high-risk items with an expert.',
};

export const liveModelOutput = `Analysis complete:
${JSON.stringify(liveIdentifyPayload, null, 2)}`;
