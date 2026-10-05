const fs = require('fs');

const secPath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\config\\SecurityConfig.java';
let content = fs.readFileSync(secPath, 'utf8');

const target = `                // Customer APIs
                .requestMatchers("/api/warehouse-manager/**")
                .hasAnyRole("WAREHOUSE_MANAGER", "ADMIN")

                // Customer APIs
                .requestMatchers("/api/customer/**")
                .hasAnyRole("CUSTOMER", "ADMIN")`;

const replacement = `                // Warehouse APIs
                .requestMatchers("/api/warehouse-manager/**")
                .hasAnyRole("WAREHOUSE_MANAGER", "ADMIN")

                // Shared Profile and Support APIs
                .requestMatchers("/api/customer/support/**", "/api/customer/profile/**")
                .hasAnyRole("CUSTOMER", "WAREHOUSE_MANAGER", "ADMIN")

                // Customer APIs
                .requestMatchers("/api/customer/**")
                .hasAnyRole("CUSTOMER", "ADMIN")`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(secPath, content, 'utf8');
  console.log('SecurityConfig.java updated successfully!');
} else {
  console.log('Target block not found in SecurityConfig.java');
}
