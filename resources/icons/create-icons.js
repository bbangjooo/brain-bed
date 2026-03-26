// Run this script to generate tray icons
// node resources/icons/create-icons.js
// Requires: npm install canvas (optional, for production icons)

const fs = require('fs')
const path = require('path')

// Create a minimal 1x1 transparent PNG as placeholder
// In production, replace with actual designed icons
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAADUlEQVQ4jWNgGAWDAwABEAABRrp0TAAAAABJRU5ErkJggg==',
  'base64'
)

const icons = ['trayTemplate.png', 'trayTemplate@2x.png', 'tray-warning.png', 'tray-meditation.png']

for (const icon of icons) {
  fs.writeFileSync(path.join(__dirname, icon), TRANSPARENT_PNG)
  console.log(`Created ${icon}`)
}
