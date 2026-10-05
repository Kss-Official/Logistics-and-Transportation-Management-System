const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java';
let content = fs.readFileSync(file, 'utf8');

const oldMethod = `    public List<WarehouseTransactionDTO> getTransactions(String sku, LocalDateTime startDate, LocalDateTime endDate) {
        Warehouse warehouse = getScopedWarehouse();
        List<InventoryTransaction> list = transactionRepository.filterTransactions(warehouse, (sku != null && !sku.isBlank()) ? sku.trim() : null, startDate, endDate);

        return list.stream().map(t -> {
            WarehouseTransactionDTO dto = new WarehouseTransactionDTO();
            dto.setId(t.getId());
            dto.setSku(t.getSku());
            dto.setProductName(t.getProductName());
            dto.setTransactionType(t.getTransactionType().name());
            dto.setQuantity(t.getQuantity());
            dto.setPreviousAvailable(t.getPreviousAvailable());
            dto.setNewAvailable(t.getNewAvailable());
            dto.setPerformedBy(t.getPerformedBy());
            dto.setTimestamp(t.getTimestamp());
            dto.setReason(t.getReason());
            dto.setReferenceOrder(t.getReferenceOrder());
            dto.setReferenceShipment(t.getReferenceShipment());
            return dto;
        }).collect(Collectors.toList());
    }`;

const newMethod = `    public List<WarehouseTransactionDTO> getTransactions(String sku, LocalDateTime startDate, LocalDateTime endDate) {
        Warehouse warehouse = getScopedWarehouse();
        List<InventoryTransaction> list = transactionRepository.findByWarehouseOrderByTimestampDesc(warehouse);

        if (sku != null && !sku.isBlank()) {
            String s = sku.trim().toLowerCase();
            list = list.stream().filter(t -> t.getSku() != null && t.getSku().toLowerCase().contains(s)).collect(Collectors.toList());
        }
        if (startDate != null) {
            list = list.stream().filter(t -> t.getTimestamp() != null && !t.getTimestamp().isBefore(startDate)).collect(Collectors.toList());
        }
        if (endDate != null) {
            list = list.stream().filter(t -> t.getTimestamp() != null && !t.getTimestamp().isAfter(endDate)).collect(Collectors.toList());
        }

        return list.stream().map(t -> {
            WarehouseTransactionDTO dto = new WarehouseTransactionDTO();
            dto.setId(t.getId());
            dto.setSku(t.getSku());
            dto.setProductName(t.getProductName());
            dto.setTransactionType(t.getTransactionType().name());
            dto.setQuantity(t.getQuantity());
            dto.setPreviousAvailable(t.getPreviousAvailable());
            dto.setNewAvailable(t.getNewAvailable());
            dto.setPerformedBy(t.getPerformedBy());
            dto.setTimestamp(t.getTimestamp());
            dto.setReason(t.getReason());
            dto.setReferenceOrder(t.getReferenceOrder());
            dto.setReferenceShipment(t.getReferenceShipment());
            return dto;
        }).collect(Collectors.toList());
    }`;

if (content.includes(oldMethod)) {
  content = content.replace(oldMethod, newMethod);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated getTransactions in WarehouseManagerService.java');
} else {
  console.error('Could not find oldMethod in file!');
}
