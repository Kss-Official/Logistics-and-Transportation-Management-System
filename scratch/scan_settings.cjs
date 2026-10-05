const fs = require('fs');
const content = fs.readFileSync('src/pages/admin/Settings.tsx', 'utf8');
const forbidden = [
  'postgresql',
  'support_contacts',
  'users table',
  'spring boot',
  'spring security',
  'bcrypt',
  'jwt',
  'sql',
  'database',
  'backend implementation',
  'api endpoint',
  'real-time customer integration'
];
const lines = content.split('\n');
let found = 0;
lines.forEach((line, idx) => {
  const lower = line.toLowerCase();
  forbidden.forEach(word => {
    if (lower.includes(word)) {
      console.log(`Line ${idx + 1} contains "${word}": ${line.trim()}`);
      found++;
    }
  });
});
if (found === 0) {
  console.log('SUCCESS: Zero forbidden technical terms found in Settings.tsx!');
} else {
  console.log(`FOUND ${found} occurrences.`);
}
