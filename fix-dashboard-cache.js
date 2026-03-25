const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add a dummy comment to force webpack/turbopack rebuild
content += '\n// Force rebuild: ' + Date.now();
fs.writeFileSync(pagePath, content);
console.log('Forced rebuild on Admin Dashboard');
