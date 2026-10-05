const fs = require('fs');

const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\entity\\Order.java';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('public void setId(')) {
  code = code.replace(
    'public Long getId() {',
    `public void setId(Long id) {\n        this.id = id;\n    }\n\n    public Long getId() {`
  );
  fs.writeFileSync(path, code, 'utf8');
  console.log('✓ Added setId(Long id) to Order.java');
}
