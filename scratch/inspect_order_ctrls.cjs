const fs = require('fs');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller";

const files = fs.readdirSync(BACKEND_BASE);
files.filter(f => f.includes('Order')).forEach(f => {
  const content = fs.readFileSync(`${BACKEND_BASE}/${f}`, 'utf8');
  console.log(`=== ${f} ===`);
  content.split('\n').filter(l => l.includes('@RequestMapping') || l.includes('@PostMapping')).forEach(l => console.log(l));
});
