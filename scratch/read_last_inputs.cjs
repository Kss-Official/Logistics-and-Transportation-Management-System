const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/shrut/.gemini/antigravity-ide/brain/f833166f-0b6b-4a36-ab87-7512fb59d341/.system_generated/logs/transcript.jsonl')
});

const inputs = [];

rl.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"')) {
    try {
      inputs.push(JSON.parse(line));
    } catch (e) {}
  }
});

rl.on('close', () => {
  console.log('Total user inputs:', inputs.length);
  inputs.slice(-4).forEach((inp) => {
    console.log('========================================================');
    console.log('Step:', inp.step_index, 'Time:', inp.created_at);
    console.log(inp.content);
  });
});
