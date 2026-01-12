// Simple script to generate PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon (Walmart blue with clock icon)
const createSVGIcon = (size) => {
  const clockSize = size * 0.6;
  const clockX = size * 0.2;
  const clockY = size * 0.2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0072CE" rx="${size * 0.2}"/>
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <circle cx="0" cy="0" r="${clockSize * 0.4}" fill="none" stroke="white" stroke-width="${size * 0.03}"/>
    <line x1="0" y1="0" x2="0" y2="${-clockSize * 0.25}" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="${clockSize * 0.15}" y2="0" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  </g>
</svg>`;
};

// Note: This creates SVG files. For PNG, you'll need to convert them.
// For now, let's create a script that uses a simple approach.
// The user can use an online converter or install sharp/canvas

console.log('Generating PWA icons...');

const publicDir = path.join(__dirname, '..', 'public');

// Create SVG icons (temporary - browsers can use SVG but PNG is preferred)
const svg192 = createSVGIcon(192);
const svg512 = createSVGIcon(512);

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);

console.log('✅ Created SVG icons in public/ directory');
console.log('');
console.log('⚠️  For PWA installation, you need PNG files.');
console.log('Options:');
console.log('1. Use an online converter: https://cloudconvert.com/svg-to-png');
console.log('2. Use ImageMagick: convert icon-192.svg icon-192.png');
console.log('3. Use a design tool to export PNG from the SVG');
console.log('');
console.log('Or install sharp and run: npm install sharp');
console.log('Then I can update this script to generate PNGs directly.');

