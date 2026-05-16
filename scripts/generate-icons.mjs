import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

if (!existsSync(publicDir)) mkdirSync(publicDir)

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const byte of buf) {
    crc ^= byte
    for (let k = 0; k < 8; k++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) : (crc >>> 1)
    }
  }
  return (~crc) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function createPng(size, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // color type: RGB truecolor

  const raw = Buffer.alloc((1 + size * 3) * size)
  let idx = 0
  for (let y = 0; y < size; y++) {
    raw[idx++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size)
      raw[idx++] = r
      raw[idx++] = g
      raw[idx++] = b
    }
  }

  const compressed = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Amber background (#d97706) with a centered sticky-note square (#fef08a).
// 10% inset on all sides keeps content in the maskable safe zone.
function iconPixel(x, y, size) {
  const pad = Math.round(size * 0.1)
  const foldSize = Math.round(size * 0.14) // folded corner on bottom-right of inner note

  const inX = x >= pad && x < size - pad
  const inY = y >= pad && y < size - pad

  if (inX && inY) {
    // Folded corner triangle at bottom-right
    const rx = x - (size - pad - foldSize)
    const ry = y - (size - pad - foldSize)
    if (rx >= 0 && ry >= 0 && rx + ry >= foldSize) {
      // Shadow/fold area — slightly darker than amber
      return [0xb4, 0x62, 0x06]
    }
    // Sticky note face — warm yellow
    return [0xfe, 0xf0, 0x8a]
  }

  // Cork/board background — app amber
  return [0xd9, 0x77, 0x06]
}

const configs = [
  { size: 512, name: 'icon-512.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32,  name: 'favicon.png' },
]

for (const { size, name } of configs) {
  const png = createPng(size, iconPixel)
  writeFileSync(join(publicDir, name), png)
  console.log(`created ${name} (${size}x${size})`)
}
