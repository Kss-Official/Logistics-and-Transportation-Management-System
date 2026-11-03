const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

['controller/PublicLandingController.java', 'dto/QuoteRequest.java', 'dto/QuoteResponse.java'].forEach(f => {
  const full = path.join(base, f);
  console.log(`\n================== ${f} ==================`);
  if (fs.existsSync(full)) {
    console.log(fs.readFileSync(full, 'utf8'));
  } else {
    console.log('NOT FOUND');
  }
});
