const fs = require('fs');

let content = fs.readFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', 'utf8');
content = content.replace('import com.primeroute.logistics.exception.AccessDeniedException;', 'import org.springframework.security.access.AccessDeniedException;');

fs.writeFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', content, 'utf8');
console.log('Fixed AccessDeniedException import');
