const fs = require('fs');
let data = fs.readFileSync('prisma/schema.prisma', 'utf8');
data = data.replace(/createdById\s+String\?/g, 'createdBy String?');
data = data.replace(/updatedById\s+String\?/g, 'updatedBy String?');
const lines = data.split('\n');
const newLines = lines.filter(l => !l.includes('@relation("Created') && !l.includes('@relation("Updated'));
fs.writeFileSync('prisma/schema.prisma', newLines.join('\n'));
