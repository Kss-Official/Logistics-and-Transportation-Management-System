const fs = require('fs');
const path = require('path');

const BASE_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function modifyFile(relPath, modifier) {
  const fullPath = path.join(BASE_DIR, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const updated = modifier(content);
  fs.writeFileSync(fullPath, updated, 'utf8');
  console.log('Modified: ' + relPath);
}

// 1. Update User.java
modifyFile('entity/User.java', (c) => {
  if (c.includes('private Warehouse warehouse;')) return c;

  // Add Warehouse import if not present
  // Warehouse is in the same package (com.primeroute.logistics.entity.Warehouse)

  // Insert warehouse field before status
  let updated = c.replace(
    '@Column(name = "status")',
    `@ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "status")`
  );

  // Add getters and setters before last closing brace
  const lastBrace = updated.lastIndexOf('}');
  const gettersSetters = `
    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }
`;
  return updated.slice(0, lastBrace) + gettersSetters + updated.slice(lastBrace);
});

// 2. Update Shipment.java
modifyFile('entity/Shipment.java', (c) => {
  if (c.includes('originWarehouse')) return c;

  // Insert originWarehouse, destinationWarehouse, operationalStage
  let updated = c.replace(
    '@ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = "route_id")',
    `@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_warehouse_id")
    private Warehouse originWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_warehouse_id")
    private Warehouse destinationWarehouse;

    @Column(name = "operational_stage")
    private String operationalStage = "READY_FOR_PROCESSING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")`
  );

  const lastBrace = updated.lastIndexOf('}');
  const methods = `
    public Warehouse getOriginWarehouse() {
        return originWarehouse;
    }

    public void setOriginWarehouse(Warehouse originWarehouse) {
        this.originWarehouse = originWarehouse;
    }

    public Warehouse getDestinationWarehouse() {
        return destinationWarehouse;
    }

    public void setDestinationWarehouse(Warehouse destinationWarehouse) {
        this.destinationWarehouse = destinationWarehouse;
    }

    public String getOperationalStage() {
        return operationalStage != null ? operationalStage : "READY_FOR_PROCESSING";
    }

    public void setOperationalStage(String operationalStage) {
        this.operationalStage = operationalStage;
    }
`;
  return updated.slice(0, lastBrace) + methods + updated.slice(lastBrace);
});

// 3. Update Driver.java
modifyFile('entity/Driver.java', (c) => {
  if (c.includes('private Warehouse warehouse;')) return c;

  let updated = c.replace(
    '@Enumerated(EnumType.STRING)\n    @Column(nullable = false)\n    private DriverStatus status',
    `@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status`
  );

  const lastBrace = updated.lastIndexOf('}');
  const methods = `
    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }
`;
  return updated.slice(0, lastBrace) + methods + updated.slice(lastBrace);
});

// 4. Update Vehicle.java
modifyFile('entity/Vehicle.java', (c) => {
  if (c.includes('private Warehouse warehouse;')) return c;

  let updated = c.replace(
    '@Enumerated(EnumType.STRING)\n    @Column(nullable = false)\n    private VehicleStatus status',
    `@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status`
  );

  const lastBrace = updated.lastIndexOf('}');
  const methods = `
    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }
`;
  return updated.slice(0, lastBrace) + methods + updated.slice(lastBrace);
});

// 5. Update LoginResponse.java
const loginResponseContent = `
package com.primeroute.logistics.dto;

public class LoginResponse {

    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String fullName, String role) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public LoginResponse(String token, String email, String fullName, String role, Long warehouseId, String warehouseCode, String warehouseName) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.warehouseId = warehouseId;
        this.warehouseCode = warehouseCode;
        this.warehouseName = warehouseName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
}
`;
fs.writeFileSync(path.join(BASE_DIR, 'dto/LoginResponse.java'), loginResponseContent.trim() + '\n', 'utf8');
console.log('Modified: dto/LoginResponse.java');

// 6. Update AuthService.java
modifyFile('service/AuthService.java', (c) => {
  if (c.includes('user.getWarehouse()')) return c;

  return c.replace(
    `return new LoginResponse(
                token,
                userDetails.getUsername(),
                fullName,
                role
        );`,
    `Long warehouseId = null;
        String warehouseCode = null;
        String warehouseName = null;

        if (user != null && user.getWarehouse() != null) {
            warehouseId = user.getWarehouse().getId();
            warehouseCode = user.getWarehouse().getWarehouseCode();
            warehouseName = user.getWarehouse().getWarehouseName();
        }

        return new LoginResponse(
                token,
                userDetails.getUsername(),
                fullName,
                role,
                warehouseId,
                warehouseCode,
                warehouseName
        );`
  );
});

// 7. Update ShipmentRepository.java
modifyFile('repository/ShipmentRepository.java', (c) => {
  if (c.includes('findByOriginWarehouse')) return c;

  let updated = c;
  if (!updated.includes('import com.primeroute.logistics.entity.Warehouse;')) {
    updated = updated.replace('package com.primeroute.logistics.repository;', 'package com.primeroute.logistics.repository;\n\nimport com.primeroute.logistics.entity.Warehouse;');
  }

  const lastBrace = updated.lastIndexOf('}');
  const extraQueries = `
    List<Shipment> findByOriginWarehouseOrderByCreatedAtDesc(Warehouse originWarehouse);

    List<Shipment> findByDestinationWarehouseOrderByCreatedAtDesc(Warehouse destinationWarehouse);

    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.status IN :statuses ORDER BY s.createdAt DESC")
    List<Shipment> findOutgoingByWarehouseAndStatuses(
            @Param("warehouse") Warehouse warehouse,
            @Param("statuses") List<com.primeroute.logistics.entity.OrderStatus> statuses
    );

    @Query("SELECT s FROM Shipment s WHERE s.destinationWarehouse = :warehouse AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED ORDER BY s.createdAt DESC")
    List<Shipment> findActiveIncomingByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT s FROM Shipment s WHERE s.originWarehouse = :warehouse AND s.operationalStage = 'READY_FOR_DISPATCH' AND s.status != com.primeroute.logistics.entity.OrderStatus.DELIVERED AND s.status != com.primeroute.logistics.entity.OrderStatus.CANCELLED")
    List<Shipment> findReadyForDispatchByWarehouse(@Param("warehouse") Warehouse warehouse);

    long countByOriginWarehouse(Warehouse originWarehouse);

    long countByDestinationWarehouse(Warehouse destinationWarehouse);
`;
  return updated.slice(0, lastBrace) + extraQueries + updated.slice(lastBrace);
});

console.log('All entity and auth updates completed.');
