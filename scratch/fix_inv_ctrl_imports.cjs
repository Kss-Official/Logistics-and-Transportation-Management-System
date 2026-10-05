const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const invCtrlPath = path.join(BACKEND_SRC, 'controller/InvoiceController.java');
let content = fs.readFileSync(invCtrlPath, 'utf8');

if (!content.includes('import com.primeroute.logistics.entity.PaymentStatus;')) {
  content = content.replace(
    'import com.primeroute.logistics.entity.InvoiceStatus;',
    'import com.primeroute.logistics.entity.InvoiceStatus;\nimport com.primeroute.logistics.entity.PaymentStatus;'
  );
}

if (!content.includes('import java.time.LocalDate;')) {
  content = content.replace(
    'import java.time.LocalDateTime;',
    'import java.time.LocalDate;\nimport java.time.LocalDateTime;'
  );
}

fs.writeFileSync(invCtrlPath, content, 'utf8');
console.log('Added imports to InvoiceController.java');
