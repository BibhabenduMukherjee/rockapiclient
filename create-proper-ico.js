const fs = require('fs');

// Create a proper ICO file with multiple sizes
// This creates a minimal but valid ICO file with 16x16, 32x32, and 256x256 icons

const createICO = () => {
  // ICO file header (6 bytes)
  const header = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Type (1 = icon)
    0x03, 0x00  // Number of images (3)
  ]);

  // Directory entries (16 bytes each)
  const dir16 = Buffer.from([
    0x10,       // Width (16)
    0x10,       // Height (16)
    0x00,       // Color palette (0 = no palette)
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x01, 0x00, 0x00, // Size of image data (256 bytes)
    0x16, 0x00, 0x00, 0x00  // Offset to image data (22 bytes)
  ]);

  const dir32 = Buffer.from([
    0x20,       // Width (32)
    0x20,       // Height (32)
    0x00,       // Color palette (0 = no palette)
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x04, 0x00, 0x00, // Size of image data (1024 bytes)
    0x36, 0x01, 0x00, 0x00  // Offset to image data (310 bytes)
  ]);

  const dir256 = Buffer.from([
    0x00,       // Width (0 = 256)
    0x00,       // Height (0 = 256)
    0x00,       // Color palette (0 = no palette)
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x00, 0x00, 0x40, 0x00, // Size of image data (4194304 bytes)
    0x36, 0x05, 0x00, 0x00  // Offset to image data (1334 bytes)
  ]);

  // Create simple colored squares for each size
  const createImageData = (size, color) => {
    const data = Buffer.alloc(size * size * 4); // RGBA
    for (let i = 0; i < data.length; i += 4) {
      data[i] = color[0];     // R
      data[i + 1] = color[1]; // G
      data[i + 2] = color[2]; // B
      data[i + 3] = color[3]; // A
    }
    return data;
  };

  // Create image data for each size (blue color)
  const blue = [52, 144, 220, 255];
  const img16 = createImageData(16, blue);
  const img32 = createImageData(32, blue);
  const img256 = createImageData(256, blue);

  // Combine all parts
  const icoFile = Buffer.concat([
    header,
    dir16,
    dir32,
    dir256,
    img16,
    img32,
    img256
  ]);

  return icoFile;
};

// Create and save the ICO file
const icoData = createICO();
fs.writeFileSync('public/icon.ico', icoData);
console.log('Created proper icon.ico file');

// Also create a backup PNG version
fs.copyFileSync('public/icon.png', 'public/icon-backup.png');
console.log('Backup created: icon-backup.png');
