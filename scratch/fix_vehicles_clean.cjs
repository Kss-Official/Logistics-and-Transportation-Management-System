const fs = require('fs');

let veh = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');

// Fix newVehicle state declaration
veh = veh.replace(
  /const \[newVehicle, setNewVehicle\] = useState\(\{[\s\S]*?\}\);/,
  `const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '',
    vehicleType: 'TRUCK' as VehicleType,
    manufacturer: 'Tata Motors',
    model: '',
    capacity: '15',
    capacityUnit: 'TONS',
    warehouseId: undefined as number | undefined,
    registrationNumber: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    currentLocation: 'Bengaluru Central Logistics Hub',
    driverId: '',
  });`
);

// Fix setNewVehicle in handleAddVehicle
veh = veh.replace(
  /setNewVehicle\(\{[\s\S]*?driverId: '',\s*\}\);/,
  `setNewVehicle({
        vehicleNumber: '',
        vehicleType: 'TRUCK',
        manufacturer: 'Tata Motors',
        model: '',
        capacity: '15',
        capacityUnit: 'TONS',
        warehouseId: undefined,
        registrationNumber: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        currentLocation: 'Bengaluru Central Logistics Hub',
        driverId: '',
      });`
);

// Fix editVehicle type definition
veh = veh.replace(
  /const \[editVehicle, setEditVehicle\] = useState<\{[\s\S]*?status: VehicleStatus;\s*\} \| null>\(null\);/,
  `const [editVehicle, setEditVehicle] = useState<{
    id: number | string;
    vehicleNumber: string;
    vehicleType: VehicleType;
    manufacturer: string;
    model: string;
    capacity: string;
    capacityUnit: string;
    warehouseId?: number;
    registrationNumber: string;
    registrationExpiry: string;
    insuranceExpiry: string;
    currentLocation: string;
    status: VehicleStatus;
  } | null>(null);`
);

// Fix loadData destructuring
veh = veh.replace(
  /const \[vehicleList, driverList\] = await Promise.all\(\[[\s\S]*?\]\);/,
  `const [vehicleList, driverList, warehouseList] = await Promise.all([
        vehicleService.getAllVehicles(),
        driverService.getAllDrivers().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
      ]);
      setVehicles(vehicleList);
      setDrivers(driverList);
      setWarehouses(warehouseList);`
);

// In handleOpenEditModal:
veh = veh.replace(
  /setEditVehicle\(\{[\s\S]*?status: v\.status,\s*\}\);/,
  `setEditVehicle({
      id: v.id,
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      manufacturer: v.manufacturer || '',
      model: v.model,
      capacity: String(v.capacity),
      capacityUnit: v.capacityUnit,
      warehouseId: v.warehouseId,
      registrationNumber: v.registrationNumber || '',
      registrationExpiry: v.registrationExpiry ? String(v.registrationExpiry) : '',
      insuranceExpiry: v.insuranceExpiry ? String(v.insuranceExpiry) : '',
      currentLocation: v.currentLocation || '',
      status: v.status,
    });`
);

fs.writeFileSync('src/pages/admin/Vehicles.tsx', veh, 'utf8');
console.log('Successfully updated Vehicles.tsx');
