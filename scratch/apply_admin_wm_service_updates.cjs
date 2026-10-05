const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Update AdminShipmentService.java
let adminService = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');

// Add import if missing
if (!adminService.includes('import com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;')) {
  adminService = adminService.replace('import com.primeroute.logistics.dto.*;', 'import com.primeroute.logistics.dto.*;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;\nimport com.primeroute.logistics.repository.ProofOfDeliveryRepository;');
}

// Add proofOfDeliveryRepository field & injection
if (!adminService.includes('private final ProofOfDeliveryRepository proofOfDeliveryRepository;')) {
  adminService = adminService.replace('private final FulfillmentEngineService fulfillmentEngineService;', 'private final FulfillmentEngineService fulfillmentEngineService;\n    private final ProofOfDeliveryRepository proofOfDeliveryRepository;');
  
  adminService = adminService.replace(
    'FulfillmentEngineService fulfillmentEngineService) {',
    'FulfillmentEngineService fulfillmentEngineService,\n            @org.springframework.beans.factory.annotation.Autowired(required = false) ProofOfDeliveryRepository proofOfDeliveryRepository) {'
  );
  
  adminService = adminService.replace(
    'this.fulfillmentEngineService = fulfillmentEngineService;',
    'this.fulfillmentEngineService = fulfillmentEngineService;\n        this.proofOfDeliveryRepository = proofOfDeliveryRepository;'
  );
}

// Update convertToDto in AdminShipmentService
const adminConvertOld = `        // Assignment Status & Audit
        if (s.getDriver() != null && s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Warehouse Manager");
            dto.setAssignedAt(s.getAssignedAt() != null ? s.getAssignedAt() : s.getUpdatedAt());
        } else {
            dto.setAssignmentStatus("Awaiting Warehouse Assignment");
            dto.setAssignedBy("Not Assigned");
            dto.setAssignedAt(null);
        }`;

const adminConvertNew = `        // Assignment Status & Audit (Preserve historical assignment facts)
        if (s.getStatus() == OrderStatus.DELIVERED) {
            dto.setAssignmentStatus("Completed / Delivered");
        } else if (s.getDriver() != null || s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
        } else {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "Awaiting Warehouse Assignment");
        }

        if (s.getAssignedBy() != null && !s.getAssignedBy().isBlank()) {
            dto.setAssignedBy(s.getAssignedBy());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            Warehouse wh = s.getOriginWarehouse();
            dto.setAssignedBy(wh != null && wh.getManagerName() != null ? wh.getManagerName() : "Warehouse Operations");
        } else {
            dto.setAssignedBy("Not Assigned");
        }

        if (s.getAssignedAt() != null) {
            dto.setAssignedAt(s.getAssignedAt());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            dto.setAssignedAt(s.getCreatedAt());
        } else {
            dto.setAssignedAt(null);
        }

        if (proofOfDeliveryRepository != null) {
            proofOfDeliveryRepository.findByShipment(s).ifPresent(pod -> {
                ProofOfDeliveryDTO podDto = new ProofOfDeliveryDTO();
                podDto.setId(pod.getId());
                podDto.setShipmentId(s.getId());
                podDto.setTrackingNumber(s.getTrackingNumber());
                podDto.setRecipientName(pod.getRecipientName());
                podDto.setReceivedBy(pod.getReceivedBy());
                podDto.setSignatureData(pod.getSignatureData());
                podDto.setSignatureBase64(pod.getSignatureData());
                podDto.setPhotoData(pod.getPhotoData());
                podDto.setPhotoUrl(pod.getPhotoData());
                podDto.setDeliveryNotes(pod.getDeliveryNotes());
                podDto.setDeliveredBy(pod.getDeliveredBy());
                if (pod.getDeliveredAt() != null) {
                    podDto.setDeliveredAt(pod.getDeliveredAt().toString());
                }
                podDto.setLatitude(pod.getLatitude());
                podDto.setLongitude(pod.getLongitude());
                dto.setProofOfDelivery(podDto);
            });
        }`;

if (adminService.includes(adminConvertOld)) {
  adminService = adminService.replace(adminConvertOld, adminConvertNew);
  fs.writeFileSync(`${base}\\service\\AdminShipmentService.java`, adminService, 'utf8');
  console.log('Updated AdminShipmentService.java');
} else {
  console.log('Could not find target block in AdminShipmentService.java');
}

// 2. Update WarehouseManagerService.java
let wmService = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');

// Add import if missing
if (!wmService.includes('import com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;')) {
  wmService = wmService.replace('import com.primeroute.logistics.dto.warehouse.*;', 'import com.primeroute.logistics.dto.warehouse.*;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;\nimport com.primeroute.logistics.repository.ProofOfDeliveryRepository;');
}

// Add proofOfDeliveryRepository field & injection
if (!wmService.includes('private final ProofOfDeliveryRepository proofOfDeliveryRepository;')) {
  wmService = wmService.replace('private final GeocodingService geocodingService;', 'private final GeocodingService geocodingService;\n    private final ProofOfDeliveryRepository proofOfDeliveryRepository;');
  
  wmService = wmService.replace(
    'GeocodingService geocodingService) {',
    'GeocodingService geocodingService,\n            @org.springframework.beans.factory.annotation.Autowired(required = false) ProofOfDeliveryRepository proofOfDeliveryRepository) {'
  );
  
  wmService = wmService.replace(
    'this.geocodingService = geocodingService;',
    'this.geocodingService = geocodingService;\n        this.proofOfDeliveryRepository = proofOfDeliveryRepository;'
  );
}

// Update mapToShipmentDTO in WarehouseManagerService
const wmOldBlock = `        if (s.getDriver() != null && s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Warehouse Manager");
            dto.setAssignedAt(s.getAssignedAt() != null ? s.getAssignedAt() : s.getUpdatedAt());
        } else {
            dto.setAssignmentStatus("UNASSIGNED");
            dto.setAssignedBy(s.getAssignedBy() != null ? s.getAssignedBy() : "Not Assigned");
            dto.setAssignedAt(s.getAssignedAt());
        }`;

const wmNewBlock = `        if (s.getStatus() == OrderStatus.DELIVERED) {
            dto.setAssignmentStatus("Completed / Delivered");
        } else if (s.getDriver() != null || s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
        } else {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "UNASSIGNED");
        }

        if (s.getAssignedBy() != null && !s.getAssignedBy().isBlank()) {
            dto.setAssignedBy(s.getAssignedBy());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            Warehouse wh = s.getOriginWarehouse();
            dto.setAssignedBy(wh != null && wh.getManagerName() != null ? wh.getManagerName() : "Warehouse Operations");
        } else {
            dto.setAssignedBy("Not Assigned");
        }

        if (s.getAssignedAt() != null) {
            dto.setAssignedAt(s.getAssignedAt());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            dto.setAssignedAt(s.getCreatedAt());
        } else {
            dto.setAssignedAt(null);
        }

        if (proofOfDeliveryRepository != null) {
            proofOfDeliveryRepository.findByShipment(s).ifPresent(pod -> {
                ProofOfDeliveryDTO podDto = new ProofOfDeliveryDTO();
                podDto.setId(pod.getId());
                podDto.setShipmentId(s.getId());
                podDto.setTrackingNumber(s.getTrackingNumber());
                podDto.setRecipientName(pod.getRecipientName());
                podDto.setReceivedBy(pod.getReceivedBy());
                podDto.setSignatureData(pod.getSignatureData());
                podDto.setSignatureBase64(pod.getSignatureData());
                podDto.setPhotoData(pod.getPhotoData());
                podDto.setPhotoUrl(pod.getPhotoData());
                podDto.setDeliveryNotes(pod.getDeliveryNotes());
                podDto.setDeliveredBy(pod.getDeliveredBy());
                if (pod.getDeliveredAt() != null) {
                    podDto.setDeliveredAt(pod.getDeliveredAt().toString());
                }
                podDto.setLatitude(pod.getLatitude());
                podDto.setLongitude(pod.getLongitude());
                dto.setProofOfDelivery(podDto);
            });
        }`;

if (wmService.includes(wmOldBlock)) {
  wmService = wmService.replace(wmOldBlock, wmNewBlock);
  fs.writeFileSync(`${base}\\service\\WarehouseManagerService.java`, wmService, 'utf8');
  console.log('Updated WarehouseManagerService.java');
} else {
  console.log('Could not find target block in WarehouseManagerService.java');
}
