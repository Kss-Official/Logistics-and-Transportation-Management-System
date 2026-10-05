const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const trk = fs.readFileSync(`${base}\\dto\\TrackingResponseDTO.java`, 'utf8');
console.log('Fields in TrackingResponseDTO.java:');
trk.split('\n').filter(l => l.includes('private ') && !l.includes('class')).forEach(l => console.log(l));
