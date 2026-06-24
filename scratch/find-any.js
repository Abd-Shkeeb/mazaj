const fs = require('fs');
const path = require('path');

const files = [
  'src/components/SuperAdminDashboard.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=== File: ${file} ===`);
  lines.forEach((line, idx) => {
    // Look for ": any" or "<any>" or "as any"
    if (line.includes(': any') || line.includes('as any') || line.includes('<any>')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
