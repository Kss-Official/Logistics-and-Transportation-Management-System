const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update SecurityConfig.java
const secPath = path.join(BASE_DIR, 'config/SecurityConfig.java');
let secContent = fs.readFileSync(secPath, 'utf8');
if (!secContent.includes('/api/warehouse-manager/**')) {
  secContent = secContent.replace(
    '.requestMatchers("/api/customer/**")\n                .hasAnyRole("CUSTOMER", "ADMIN")',
    `.requestMatchers("/api/warehouse-manager/**")
                .hasAnyRole("WAREHOUSE_MANAGER", "ADMIN")

                // Customer APIs
                .requestMatchers("/api/customer/**")
                .hasAnyRole("CUSTOMER", "ADMIN")`
  );
  fs.writeFileSync(secPath, secContent, 'utf8');
  console.log('Modified: config/SecurityConfig.java');
} else {
  console.log('SecurityConfig already configured for warehouse-manager.');
}

// 2. Update DataInitializer.java
const initPath = path.join(BASE_DIR, 'config/DataInitializer.java');

const updatedDataInitializer = `package com.primeroute.logistics.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            ShipmentRepository shipmentRepository,
            SupportContactRepository supportContactRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // 1. Initialize Admin user ONLY if admin account does not exist.
            if (!userRepository.existsByEmailIgnoreCase("sanjanaaa.shru@gmail.com") && !userRepository.existsByEmail("sanjanaaa.shru@gmail.com")) {
                User admin = new User(
                        "sanjanaaa.shru@gmail.com",
                        passwordEncoder.encode("Admin@PrimeRoute2026!"),
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

            // 4. Initialize Warehouse Manager User (Priya Sharma -> Bengaluru Central Hub WH-BLR-001)
            Warehouse blrWarehouse = warehouseRepository.findByWarehouseCode("WH-BLR-001")
                    .or(() -> warehouseRepository.findAll().stream().findFirst())
                    .orElse(null);

            if (blrWarehouse != null) {
                if (!userRepository.existsByEmailIgnoreCase("priya@primeroute.com") && !userRepository.existsByEmail("priya@primeroute.com")) {
                    User manager = new User(
                            "priya@primeroute.com",
                            passwordEncoder.encode("Manager@2026!"),
                            "Priya Sharma",
                            Role.WAREHOUSE_MANAGER
                    );
                    manager.setPhone("+91 98001 11001");
                    manager.setWarehouse(blrWarehouse);
                    userRepository.save(manager);
                    System.out.println("Warehouse Manager initialized: priya@primeroute.com assigned to " + blrWarehouse.getWarehouseName());
                } else {
                    // Ensure existing priya account has warehouse assigned
                    userRepository.findByEmailIgnoreCase("priya@primeroute.com").ifPresent(u -> {
                        if (u.getWarehouse() == null || u.getRole() != Role.WAREHOUSE_MANAGER) {
                            u.setWarehouse(blrWarehouse);
                            u.setRole(Role.WAREHOUSE_MANAGER);
                            userRepository.save(u);
                            System.out.println("Updated priya@primeroute.com with role WAREHOUSE_MANAGER and warehouse " + blrWarehouse.getWarehouseName());
                        }
                    });
                }

                // 5. Seed initial realistic Inventory for Bengaluru Central Hub if empty
                if (inventoryRepository.countByWarehouse(blrWarehouse) == 0) {
                    Object[][] seedItems = {
                            {"SKU-1001", "Industrial Servo Motor AC-220V", "Electronics", 65, 8, 0, 15, 12500.0, "Units"},
                            {"SKU-1002", "Heavy Duty Hydraulic Cylinder 5T", "Industrial", 40, 5, 0, 10, 24800.0, "Units"},
                            {"SKU-1003", "Precision Ball Bearing Kit 6205", "Automotive", 180, 20, 2, 30, 850.0, "Boxes"},
                            {"SKU-1004", "IoT Cold Chain Sensor Beacons", "Electronics", 320, 45, 5, 50, 3200.0, "Units"},
                            {"SKU-1005", "Pneumatic Pressure Regulators", "Industrial", 95, 12, 1, 20, 4750.0, "Units"},
                            {"SKU-1006", "Composite Cargo Lashing Belts", "Logistics Supplies", 450, 30, 0, 80, 420.0, "Units"},
                            {"SKU-1007", "Thermally Insulated Pallet Blankets", "Packaging", 85, 10, 0, 25, 6800.0, "Units"},
                            {"SKU-1008", "High-Flow Diesel Fuel Filters", "Automotive", 210, 18, 0, 40, 1150.0, "Units"},
                            {"SKU-1009", "Automated Barcode Handheld Scanners", "Warehouse Tech", 24, 6, 0, 8, 18500.0, "Units"},
                            {"SKU-1010", "Industrial Stretch Film Wrap 500mm", "Packaging", 12, 0, 0, 20, 1650.0, "Rolls"},
                            {"SKU-1011", "Hazardous Chemical Absorbent Pads", "Safety", 8, 2, 0, 15, 2900.0, "Packs"}
                    };

                    for (Object[] row : seedItems) {
                        Inventory inv = new Inventory();
                        inv.setWarehouse(blrWarehouse);
                        inv.setSku((String) row[0]);
                        inv.setProductName((String) row[1]);
                        inv.setCategory((String) row[2]);
                        inv.setTotalStock((Integer) row[3]);
                        inv.setReservedStock((Integer) row[4]);
                        inv.setDamagedStock((Integer) row[5]);
                        inv.setReorderLevel((Integer) row[6]);
                        inv.setUnitPrice((Double) row[7]);
                        inv.setUnit((String) row[8]);
                        inv.recalculate();
                        inventoryRepository.save(inv);

                        // Initial Receive audit transaction
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
                        tx.setReason("Baseline warehouse inventory provisioning");
                        tx.setReferenceOrder("WH-INIT-2026");
                        transactionRepository.save(tx);
                    }
                    System.out.println("Initialized baseline inventory for " + blrWarehouse.getWarehouseName());
                }

                // 6. Link existing unlinked shipments to warehouses so incoming and outgoing queues work dynamically
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
                System.out.println("Linked existing shipments to warehouse origins and destinations.");
            }
        };
    }
}
`;

fs.writeFileSync(initPath, updatedDataInitializer, 'utf8');
console.log('Modified: config/DataInitializer.java');
