const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

let adminService = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');

// Add import if missing
if (!adminService.includes('import com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;')) {
  adminService = adminService.replace(/import com\.primeroute\.logistics\.dto\.\*;/, 'import com.primeroute.logistics.dto.*;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;\nimport com.primeroute.logistics.repository.ProofOfDeliveryRepository;');
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

const lines = adminService.split(/\r?\n/);
const startIdx = lines.findIndex(l => l.includes('// Assignment Status & Audit'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('Order order = s.getOrder();'));

console.log('Replacing from line', startIdx + 1, 'to', endIdx);

const replacement = [
  '        // Assignment Status & Audit (Preserve historical assignment facts)',
  '        if (s.getStatus() == OrderStatus.DELIVERED) {',
  '            dto.setAssignmentStatus("Completed / Delivered");',
  '        } else if (s.getDriver() != null || s.getVehicle() != null) {',
  '            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");',
  '        } else {',
  '            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "Awaiting Warehouse Assignment");',
  '        }',
  '',
  '        if (s.getAssignedBy() != null && !s.getAssignedBy().isBlank()) {',
  '            dto.setAssignedBy(s.getAssignedBy());',
  '        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {',
  '            Warehouse wh = s.getOriginWarehouse();',
  '            dto.setAssignedBy(wh != null && wh.getManagerName() != null ? wh.getManagerName() : "Warehouse Operations");',
  '        } else {',
  '            dto.setAssignedBy("Not Assigned");',
  '        }',
  '',
  '        if (s.getAssignedAt() != null) {',
  '            dto.setAssignedAt(s.getAssignedAt());',
  '        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {',
  '            dto.setAssignedAt(s.getCreatedAt());',
  '        } else {',
  '            dto.setAssignedAt(null);',
  '        }',
  '',
  '        if (proofOfDeliveryRepository != null) {',
  '            proofOfDeliveryRepository.findByShipment(s).ifPresent(pod -> {',
  '                ProofOfDeliveryDTO podDto = new ProofOfDeliveryDTO();',
  '                podDto.setId(pod.getId());',
  '                podDto.setShipmentId(s.getId());',
  '                podDto.setTrackingNumber(s.getTrackingNumber());',
  '                podDto.setRecipientName(pod.getRecipientName());',
  '                podDto.setReceivedBy(pod.getReceivedBy());',
  '                podDto.setSignatureData(pod.getSignatureData());',
  '                podDto.setSignatureBase64(pod.getSignatureData());',
  '                podDto.setPhotoData(pod.getPhotoData());',
  '                podDto.setPhotoUrl(pod.getPhotoData());',
  '                podDto.setDeliveryNotes(pod.getDeliveryNotes());',
  '                podDto.setDeliveredBy(pod.getDeliveredBy());',
  '                if (pod.getDeliveredAt() != null) {',
  '                    podDto.setDeliveredAt(pod.getDeliveredAt().toString());',
  '                }',
  '                podDto.setLatitude(pod.getLatitude());',
  '                podDto.setLongitude(pod.getLongitude());',
  '                dto.setProofOfDelivery(podDto);',
  '            });',
  '        }'
];

lines.splice(startIdx, endIdx - startIdx, ...replacement);
fs.writeFileSync(`${base}\\service\\AdminShipmentService.java`, lines.join('\n'), 'utf8');
console.log('Successfully updated AdminShipmentService.java');
