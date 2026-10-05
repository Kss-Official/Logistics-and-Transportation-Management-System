const fs = require('fs');
const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\DriverPortalService.java';

let code = fs.readFileSync(path, 'utf8');
code = code.replace(/import com\.primeroute\.logistics\.entity\.enums\.[^;]+;/g, '');
code = code.replace('import com.primeroute.logistics.entity.*;', `import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.enums.*;`);
code = code.replace('order.setStatus(com.primeroute.logistics.entity.enums.OrderStatus.OUT_FOR_DELIVERY);', 'order.setStatus(OrderStatus.OUT_FOR_DELIVERY);');

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed imports in DriverPortalService.java');
