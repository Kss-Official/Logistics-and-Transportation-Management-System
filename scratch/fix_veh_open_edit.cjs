const fs = require('fs');

// 1. Fix Vehicles.tsx handleOpenEdit
let veh = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');
veh = veh.replace(
  /const handleOpenEdit = \(v: Vehicle\) => \{[\s\S]*?setIsEditOpen\(true\);\s*\};/,
  `const handleOpenEdit = (v: Vehicle) => {
    setEditVehicle({
      id: v.id,
      vehicleNumber: v.vehicleNumber || '',
      vehicleType: v.vehicleType || 'TRUCK',
      manufacturer: v.manufacturer || '',
      model: v.model || '',
      capacity: String(v.capacity || '10'),
      capacityUnit: v.capacityUnit || 'TONS',
      warehouseId: v.warehouseId,
      registrationNumber: v.registrationNumber || '',
      registrationExpiry: v.registrationExpiry ? String(v.registrationExpiry) : '',
      insuranceExpiry: v.insuranceExpiry ? String(v.insuranceExpiry) : '',
      currentLocation: v.currentLocation || '',
      status: v.status,
    });
    setEditErrors({});
    setIsEditOpen(true);
  };`
);
fs.writeFileSync('src/pages/admin/Vehicles.tsx', veh, 'utf8');
console.log('Fixed handleOpenEdit in Vehicles.tsx');
