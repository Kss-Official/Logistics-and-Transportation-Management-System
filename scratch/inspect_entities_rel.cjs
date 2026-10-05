const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\entity";

const entities = ['Driver.java', 'Vehicle.java', 'Warehouse.java', 'Inventory.java'];

entities.forEach(e => {
  const p = path.join(BACKEND_BASE, e);
  console.log(`\n================== ${e} ==================`);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.forEach(l => {
      const t = l.trim();
      if (t.startsWith('@JoinColumn') || t.startsWith('@ManyToOne') || t.startsWith('@OneToMany') || t.startsWith('@OneToOne') || t.startsWith('private ')) {
        console.log('  ' + t);
      }
    });
  }
});
