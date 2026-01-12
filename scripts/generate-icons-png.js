// Generate PNG icons using sharp (requires: npm install sharp)
// Run with: node scripts/generate-icons-png.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Create SVG icon
const createSVGIcon = (size) => {
  const clockSize = size * 0.6;
  
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0072CE" rx="${size * 0.2}"/>
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <circle cx="0" cy="0" r="${clockSize * 0.4}" fill="none" stroke="white" stroke-width="${size * 0.03}"/>
    <line x1="0" y1="0" x2="0" y2="${-clockSize * 0.25}" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="${clockSize * 0.15}" y2="0" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  </g>
</svg>`);
};

async function generateIcons() {
  try {
    console.log('Generating PWA icons...');
    
    // Generate 192x192 icon
    const svg192 = createSVGIcon(192);
    await sharp(svg192)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    
    // Generate 512x512 icon
    const svg512 = createSVGIcon(512);
    await sharp(svg512)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    
    console.log('✅ Successfully generated icon-192.png and icon-512.png');
    console.log('   Icons saved to:', publicDir);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Error: sharp module not found');
      console.log('');
      console.log('Install sharp first:');
      console.log('  npm install sharp');
      console.log('');
      console.log('Or use the basic script:');
      console.log('  node scripts/generate-icons.js');
    } else {
      console.error('Error generating icons:', error);
    }
    process.exit(1);
  }
}

generateIcons();

