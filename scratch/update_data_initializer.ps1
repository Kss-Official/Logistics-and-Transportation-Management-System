$content = @'
package com.primeroute.logistics.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import com.primeroute.logistics.service.AdminWarehouseService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            ShipmentRepository shipmentRepository,
            DriverRepository driverRepository,
            SupportContactRepository supportContactRepository,
            AdminWarehouseService adminWarehouseService,
            PasswordEncoder passwordEncoder) {

        return args -> {
            // 1. Ensure Support Contacts exist
            if (supportContactRepository.count() == 0) {
                supportContactRepository.save(new SupportContact("Customer Support Hotline", "+1 (800) 555-0199", "support@primeroute.com", "24/7 Phone & Email Support"));
                supportContactRepository.save(new SupportContact("Technical Support & Dispatch", "+1 (800) 555-0144", "techsupport@primeroute.com", "Mon - Fri, 8am - 8pm EST"));
                supportContactRepository.save(new SupportContact("Billing & Invoicing Department", "+1 (800) 555-0122", "billing@primeroute.com", "Mon - Fri, 9am - 5pm EST"));
                supportContactRepository.save(new SupportContact("Operations & Fleet Operations", "+1 (800) 555-0188", "operations@primeroute.com", "24/7 Dispatch Control"));
                System.out.println("[DataInitializer] Default support contacts initialized.");
            }

            // 2. Ensure Default Hub exists
            Warehouse blrWarehouse = warehouseRepository.findByWarehouseCode("WH-BLR-001")
                    .orElseGet(() -> {
                        Warehouse defaultWh = new Warehouse();
                        defaultWh.setWarehouseCode("WH-BLR-001");
                        defaultWh.setWarehouseName("Bengaluru Central Hub");
                        defaultWh.setWarehouseType(WarehouseType.DISTRIBUTION_CENTER);
                        defaultWh.setStatus(WarehouseStatus.ACTIVE);
                        defaultWh.setAddressLine1("Plot 42, Export Promotion Industrial Park, Whitefield");
                        defaultWh.setCity("Bengaluru");
                        defaultWh.setState("Karnataka");
                        defaultWh.setPostalCode("560066");
                        defaultWh.setCountry("India");
                        defaultWh.setLatitude(12.9716);
                        defaultWh.setLongitude(77.5946);
                        defaultWh.setTotalCapacity(5000.0);
                        defaultWh.setOccupiedCapacity(1250.0);
                        defaultWh.setCapacityUnit("TONS");
                        defaultWh.setManagerName("Priya Sharma");
                        defaultWh.setManagerEmail("priya@primeroute.com");
                        defaultWh.setManagerPhone("+91 98765 43210");
                        defaultWh.setContactEmail("ops.blr@primeroute.com");
                        defaultWh.setContactPhone("+91 80 2841 0001");
                        defaultWh.setOperatingHours("24/7 Operations");
                        defaultWh.setCreatedAt(LocalDateTime.now());
                        defaultWh.setUpdatedAt(LocalDateTime.now());
                        return warehouseRepository.save(defaultWh);
                    });

            // 3. Ensure Default Customer exists
            Optional<User> existingCustomerOpt = userRepository.findByEmailIgnoreCase("customer@primeroute.com")
                    .or(() -> userRepository.findByEmail("customer@primeroute.com"));

            if (existingCustomerOpt.isEmpty()) {
                User customer = new User(
                        "customer@primeroute.com",
                        passwordEncoder.encode("Customer@2026!"),
                        "Alex Morgan",
                        Role.CUSTOMER
                );
                customer.setStatus("ACTIVE");
                userRepository.save(customer);
                System.out.println("[DataInitializer] Created default customer user: customer@primeroute.com");
            }

            // 4. Ensure Default Admin exists
            Optional<User> existingAdminOpt = userRepository.findByEmailIgnoreCase("admin@primeroute.com")
                    .or(() -> userRepository.findByEmail("admin@primeroute.com"));

            if (existingAdminOpt.isEmpty()) {
                User admin = new User(
                        "admin@primeroute.com",
                        passwordEncoder.encode("Admin@2026!"),
                        "Chief Logistics Officer",
                        Role.ADMIN
                );
                admin.setStatus("ACTIVE");
                userRepository.save(admin);
                System.out.println("[DataInitializer] Created default admin user: admin@primeroute.com");
            }

            // 5. Ensure All Warehouse Managers exist & are bound to their respective Warehouse
            List<Warehouse> allWarehouses = warehouseRepository.findAll();
            for (Warehouse wh : allWarehouses) {
                String managerEmail = wh.getManagerEmail();
                String managerName = wh.getManagerName();

                if (managerEmail == null || managerEmail.isBlank()) {
                    continue;
                }
                String cleanEmail = managerEmail.trim().toLowerCase();

                Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(cleanEmail)
                        .or(() -> userRepository.findByEmail(cleanEmail));

                if (existingUserOpt.isEmpty()) {
                    User manager = new User(
                            cleanEmail,
                            passwordEncoder.encode("Manager@2026!"),
                            (managerName != null && !managerName.isBlank()) ? managerName.trim() : "Warehouse Manager",
                            Role.WAREHOUSE_MANAGER
                    );
                    if (wh.getManagerPhone() != null && !wh.getManagerPhone().isBlank()) {
                        manager.setPhone(wh.getManagerPhone().trim());
                    }
                    manager.setWarehouse(wh);
                    manager.setStatus("ACTIVE");
                    userRepository.save(manager);
                    System.out.println("[DataInitializer] Created Warehouse Manager user: " + cleanEmail + " assigned to " + wh.getWarehouseCode() + " (" + wh.getWarehouseName() + ")");
                } else {
                    User existingUser = existingUserOpt.get();
                    boolean changed = false;

                    // Idempotent sync: NEVER reset or overwrite the user's existing password!
                    if (existingUser.getWarehouse() == null || !existingUser.getWarehouse().getId().equals(wh.getId())) {
                        existingUser.setWarehouse(wh);
                        changed = true;
                    }
                    // Only synchronize role if not ADMIN (preserves admin privileges while granting manager access)
                    if (existingUser.getRole() != Role.ADMIN && existingUser.getRole() != Role.WAREHOUSE_MANAGER) {
                        existingUser.setRole(Role.WAREHOUSE_MANAGER);
                        changed = true;
                    }
                    // Synchronize name if empty
                    if ((existingUser.getFullName() == null || existingUser.getFullName().isBlank()) && managerName != null && !managerName.isBlank()) {
                        existingUser.setFullName(managerName.trim());
                        changed = true;
                    }
                    // Synchronize phone if empty
                    if ((existingUser.getPhone() == null || existingUser.getPhone().isBlank()) && wh.getManagerPhone() != null && !wh.getManagerPhone().isBlank()) {
                        existingUser.setPhone(wh.getManagerPhone().trim());
                        changed = true;
                    }
                    // Ensure active status
                    if (existingUser.getStatus() == null || !"ACTIVE".equalsIgnoreCase(existingUser.getStatus())) {
                        existingUser.setStatus("ACTIVE");
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(existingUser);
                        System.out.println("[DataInitializer] Synchronized existing user " + cleanEmail + " with warehouse " + wh.getWarehouseCode() + " (" + wh.getWarehouseName() + ") while preserving password.");
                    } else {
                        System.out.println("[DataInitializer] Warehouse Manager user " + cleanEmail + " is already up to date for " + wh.getWarehouseCode() + ".");
                    }
                }
            }

            // 6. Ensure Master Catalog Products are stocked across ALL Active Warehouses
            List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
            List<Product> catalog = productRepository.findAll();
            for (Warehouse wh : activeWarehouses) {
                for (Product prod : catalog) {
                    Optional<Inventory> existing = inventoryRepository.findByWarehouseAndSku(wh, prod.getSku());
                    if (existing.isEmpty()) {
                        Inventory inv = new Inventory();
                        inv.setWarehouse(wh);
                        inv.setProduct(prod);
                        inv.setSku(prod.getSku());
                        inv.setProductName(prod.getName());
                        inv.setCategory(prod.getCategory());
                        inv.setTotalStock(prod.getSku().equals("PR-LAP-001") ? 50 : prod.getSku().equals("PR-KBD-001") ? 120 : prod.getSku().equals("PR-MON-001") ? 40 : 35);
                        inv.setReservedStock(0);
                        inv.setDamagedStock(0);
                        inv.setReorderLevel(prod.getReorderLevel());
                        inv.setUnitPrice(prod.getUnitPrice());
                        inv.setUnit(prod.getUnitOfMeasure());
                        inv.setStatus("IN_STOCK");
                        inv.recalculate();
                        inventoryRepository.save(inv);

                        InventoryTransaction tx = new InventoryTransaction();
                        tx.setInventory(inv);
                        tx.setWarehouse(wh);
                        tx.setSku(inv.getSku());
                        tx.setProductName(inv.getProductName());
                        tx.setTransactionType(InventoryTransactionType.RECEIVE);
                        tx.setQuantity(inv.getTotalStock());
                        tx.setPreviousAvailable(0);
                        tx.setNewAvailable(inv.getAvailableStock());
                        tx.setPerformedBy("System Initializer");
                        tx.setReason("Baseline catalog provisioning");
                        tx.setReferenceOrder("WH-INIT-PROD");
                        tx.setTimestamp(LocalDateTime.now());
                        transactionRepository.save(tx);
                    } else {
                        Inventory inv = existing.get();
                        if (inv.getProduct() == null) {
                            inv.setProduct(prod);
                            inventoryRepository.save(inv);
                        }
                    }
                }
            }

            // Also link any existing inventories without product link
            for (Inventory inv : inventoryRepository.findAll()) {
                if (inv.getProduct() == null) {
                    productRepository.findBySkuIgnoreCase(inv.getSku()).ifPresent(p -> {
                        inv.setProduct(p);
                        inventoryRepository.save(inv);
                    });
                }
            }

            System.out.println("Data initialization completed.");
        };
    }
}
'@

[System.IO.File]::WriteAllText('C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\config\DataInitializer.java', $content, [System.Text.Encoding]::UTF8)
Write-Host "DataInitializer.java updated successfully."
