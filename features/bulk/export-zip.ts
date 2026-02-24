import type { GeneratedQR } from "./bulk-generator";

// Pre-computed CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function crc32(data: Uint8Array): number {
  let crc = 0xff_ff_ff_ff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xff_ff_ff_ff) >>> 0;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const raw = atob(base64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buf[i] = raw.charCodeAt(i);
  }
  return buf;
}

function u8(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

function concat(arrays: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const a of arrays) {
    total += a.length;
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

/**
 * Creates a ZIP using STORE method (no compression).
 * PNGs are already compressed so STORE is optimal.
 */
function createZip(files: { name: string; data: Uint8Array }[]): Blob {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralEntries: Uint8Array[] = [];
  let offset = 0;
  let centralSize = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);

    // Local file header (30 bytes)
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04_03_4b_50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, 0, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true);
    local.setUint32(22, file.data.length, true);
    local.setUint16(26, nameBytes.length, true);

    parts.push(u8(local.buffer), nameBytes, file.data);

    // Central directory entry (46 bytes)
    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02_01_4b_50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0, true);
    central.setUint16(10, 0, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, file.data.length, true);
    central.setUint32(24, file.data.length, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint32(42, offset, true);

    centralEntries.push(u8(central.buffer), nameBytes);
    centralSize += 46 + nameBytes.length;
    offset += 30 + nameBytes.length + file.data.length;
  }

  for (const entry of centralEntries) {
    parts.push(entry);
  }

  // End of central directory (22 bytes)
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06_05_4b_50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  parts.push(u8(end.buffer));

  const zipData = concat(parts);
  return new Blob([zipData.buffer as ArrayBuffer], { type: "application/zip" });
}

export function exportZip(items: GeneratedQR[]): void {
  const files = items.map((item) => ({
    name: item.filename,
    data: dataUrlToUint8Array(item.dataUrl),
  }));

  const blob = createZip(files);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "qr-platby.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
