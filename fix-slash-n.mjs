import fs from 'fs';
const target = 'api/index.js';
let content = fs.readFileSync(target, 'utf8');
content = content.replace("\\n    if (pathname === '/api/chat/clear'", "    if (pathname === '/api/chat/clear'");
fs.writeFileSync(target, content);
console.log('Fixed literal backslash-n');
