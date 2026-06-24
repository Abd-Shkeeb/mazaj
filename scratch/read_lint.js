const fs = require('fs');
const content = fs.readFileSync('lint_output.txt', 'utf16le');
console.log('Total characters:', content.length);
// print lines containing DashboardClient.tsx, KioskClient.tsx, or SuperAdminDashboard.tsx
const lines = content.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((line) => {
  if (line.includes('DashboardClient.tsx') || line.includes('KioskClient.tsx') || line.includes('SuperAdminDashboard.tsx') || line.includes('subscription.ts') || line.includes('OrdersTab.tsx')) {
    console.log(line);
  }
});
