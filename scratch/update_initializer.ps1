$targetPath = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\config\DataInitializer.java"

$code = @'
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

            // 1. Initialize Admin user ONLY if admin account does not exist.
            if (!userRepository.existsByEmailIgnoreCase("sanjanaaa.shru@gmail.com") && !userRepository.existsByEmail("sanjanaaa.shru@gmail.com")) {
                User admin = new User(
                        "sanjanaaa.shru@gmail.com",
                        passwordEncoder.encode("Sanjana@102026"),
                        "PrimeRoute Operations",
                        Role.ADMIN
                );
                userRepository.save(admin);
                System.out.println("Admin user initialized with email: " + admin.getEmail());
            }

            // 2. Create Customer user ONLY if not present
            if (!userRepository.existsByEmailIgnoreCase("customer@primeroute.com") && !userRepository.existsByEmail("customer@primeroute.com")) {
                User customer = new User(
                        "customer@primeroute.com",
                        passwordEncoder.encode("customer123"),
                        "Demo Customer",
                        Role.CUSTOMER
                );
                userRepository.save(customer);
                System.out.println("Demo CUSTOMER user created.");
            }

            // 2b. Initialize Driver User ONLY if driver account does not exist
            if (!userRepository.existsByEmailIgnoreCase("ramesh@primeroute.com") && !userRepository.existsByEmail("ramesh@primeroute.com")) {
                User driverUser = new User(
                        "ramesh@primeroute.com",
                        passwordEncoder.encode("Driver@2026"),
                        "Ramesh Kumar",
                        Role.DRIVER
                );
                driverUser.setPhone("+91 98765 43211");
                userRepository.save(driverUser);
                System.out.println("Driver user initialized with email: " + driverUser.getEmail());
            }

            // Ensure development Driver entity exists in drivers table if not already present
            if (!driverRepository.existsByEmail("ramesh@primeroute.com")) {
                Driver driverEntity = new Driver();
                driverEntity.setFullName("Ramesh Kumar");
                driverEntity.setEmail("ramesh@primeroute.com");
                driverEntity.setPhone("+91 98765 43211");
                driverEntity.setLicenseNumber("KA01-2023-0098765");
                driverEntity.setLicenseExpiryDate(java.time.LocalDate.now().plusYears(3));
                driverEntity.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driverEntity);
                System.out.println("Development Driver entity verified: " + driverEntity.getEmail());
            }

            // 3. Initialize Support Contact configuration ONLY if empty
            if (supportContactRepository.count() == 0) {
                SupportContact defaultContact = new SupportContact(
                        "support@primeroute.com",
                        "+91 98765 43210",
                        "24/7 Dedicated Logistics Assistance",
                        "Operations desk hotline for critical freight inquiries and routing delays."
                );
                supportContactRepository.save(defaultContact);
                System.out.println("Default Support Contact initialized.");
            }

            // 4. Initialize Master Products Catalog
            Product[] defaultProducts = {
                    new Product("PR-LAP-001", "Dell Latitude 5430 Laptop", "Electronics", 2.1, 65000.0, "Units", 15),
                    new Product("PR-MON-001", "UltraSharp 27-inch 4K Monitor", "Electronics", 5.4, 38500.0, "Units", 10),
                    new Product("PR-KBD-001", "Pro Wireless Mechanical Keyboard", "Electronics", 0.9, 4200.0, "Units", 25),
                    new Product("PR-MOU-001", "Precision Wireless Mouse", "Electronics", 0.25, 2900.0, "Units", 30),
                    new Product("PR-CHR-001", "Ergonomic High-Back Office Chair", "Furniture", 14.5, 12500.0, "Units", 8),
                    new Product("PR-PRN-001", "Laser Multi-Function Network Printer", "Office Equipment", 18.2, 28000.0, "Units", 5),
                    new Product("SKU-1001", "Industrial Servo Motor AC-220V", "Electronics", 4.5, 12500.0, "Units", 15),
                    new Product("SKU-1004", "IoT Cold Chain Sensor Beacons", "Electronics", 0.5, 3200.0, "Units", 50)
            };

            for (Product p : defaultProducts) {
                if (!productRepository.existsBySkuIgnoreCase(p.getSku())) {
                    p.setDescription("High-grade enterprise logistics approved product catalog item.");
                    productRepository.save(p);
                }
            }
            System.out.println("Master Products catalog verified.");

            // 5. Initialize/Synchronize Warehouse Manager Users for all existing warehouses
            if (warehouseRepository.count() == 0) {
                adminWarehouseService.seedDefaultWarehouses();
            }

            Warehouse blrWarehouse = warehouseRepository.findByWarehouseCode("WH-BLR-001")
                    .or(() -> warehouseRepository.findAll().stream().findFirst())
                    .orElse(null);

            if (blrWarehouse != null) {
                // Ensure WH-BLR-001 manager fields match Priya Sharma
                if (!"Priya Sharma".equals(blrWarehouse.getManagerName()) || !"priya@primeroute.com".equals(blrWarehouse.getManagerEmail())) {
                    blrWarehouse.setManagerName("Priya Sharma");
                    blrWarehouse.setManagerEmail("priya@primeroute.com");
                    blrWarehouse.setManagerPhone("+91 98001 11001");
                    blrWarehouse = warehouseRepository.save(blrWarehouse);
                }
            }

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

            if (blrWarehouse != null) {
                // 6. Ensure Master Catalog Products are stocked in WH-BLR-001
                List<Product> catalog = productRepository.findAll();
                for (Product prod : catalog) {
                    Optional<Inventory> existing = inventoryRepository.findByWarehouseAndSku(blrWarehouse, prod.getSku());
                    if (existing.isEmpty()) {
                        Inventory inv = new Inventory();
                        inv.setWarehouse(blrWarehouse);
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
                        inv.recalculate();
                        inventoryRepository.save(inv);

                        InventoryTransaction tx = new InventoryTransaction();
                        tx.setInventory(inv);
                        tx.setWarehouse(blrWarehouse);
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

                // Also link any existing inventories without product link
                for (Inventory inv : inventoryRepository.findAll()) {
                    if (inv.getProduct() == null) {
                        productRepository.findBySkuIgnoreCase(inv.getSku()).ifPresent(p -> {
                            inv.setProduct(p);
                            inventoryRepository.save(inv);
                        });
                    }
                }

                // 7. Link shipments to warehouses
                List<Shipment> unlinkedOrigin = shipmentRepository.findAll();
                Warehouse mumWarehouse = warehouseRepository.findByWarehouseCode("WH-MUM-002").orElse(blrWarehouse);
                for (int i = 0; i < unlinkedOrigin.size(); i++) {
                    Shipment s = unlinkedOrigin.get(i);
                    boolean modified = false;
                    if (s.getOriginWarehouse() == null) {
                        s.setOriginWarehouse((i % 2 == 0) ? blrWarehouse : mumWarehouse);
                        modified = true;
                    }
                    if (s.getDestinationWarehouse() == null) {
                        s.setDestinationWarehouse((i % 2 == 0) ? mumWarehouse : blrWarehouse);
                        modified = true;
                    }
                    if (s.getOperationalStage() == null) {
                        if (s.getStatus() == OrderStatus.DELIVERED || s.getStatus() == OrderStatus.IN_TRANSIT) {
                            s.setOperationalStage("DISPATCHED");
                        } else if (i % 3 == 0) {
                            s.setOperationalStage("READY_FOR_DISPATCH");
                        } else if (i % 3 == 1) {
                            s.setOperationalStage("PACKED");
                        } else {
                            s.setOperationalStage("PICKING");
                        }
                        modified = true;
                    }
                    if (modified) {
                        shipmentRepository.save(s);
                    }
                }
            }

            System.out.println("Data initialization completed.");
        };
    }
}
'@

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($targetPath, $code, $utf8WithoutBom)
Write-Host "Successfully updated DataInitializer.java (no BOM) at $targetPath" -ForegroundColor Green

