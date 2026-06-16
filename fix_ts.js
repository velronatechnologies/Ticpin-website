const fs = require('fs');
const path = 'src/app/play/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace (v) => with (v: any) => for my injected functions
content = content.replace(/const set([A-Za-z0-9_]+) = \(v\) =>/g, "const set$1 = (v: any) =>");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed implicit any errors');
