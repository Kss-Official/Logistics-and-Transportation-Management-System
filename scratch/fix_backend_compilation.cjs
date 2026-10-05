const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

// 1. Add 9-args constructor to TrackingResponseDTO.LocationDTO
let trkDto = fs.readFileSync(`${base}\\dto\\TrackingResponseDTO.java`, 'utf8');
if (!trkDto.includes('public LocationDTO(String contactName')) {
  trkDto = trkDto.replace('public LocationDTO() {}', `public LocationDTO() {}

        public LocationDTO(String contactName, String phone, String addressText, String city, String state, String postalCode, String country, Double latitude, Double longitude) {
            this.contactName = contactName;
            this.phone = phone;
            this.addressText = addressText;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.country = country;
            this.latitude = latitude;
            this.longitude = longitude;
        }`);
  fs.writeFileSync(`${base}\\dto\\TrackingResponseDTO.java`, trkDto, 'utf8');
  console.log('Added 9-args constructor to TrackingResponseDTO.LocationDTO');
}

// 2. Fix AdminShipmentService.java - add @Autowired field
let adminSvc = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
if (!adminSvc.includes('proofOfDeliveryRepository;')) {
  adminSvc = adminSvc.replace('private final FulfillmentEngineService fulfillmentEngineService;', 'private final FulfillmentEngineService fulfillmentEngineService;\n    @org.springframework.beans.factory.annotation.Autowired(required = false)\n    private ProofOfDeliveryRepository proofOfDeliveryRepository;');
  fs.writeFileSync(`${base}\\service\\AdminShipmentService.java`, adminSvc, 'utf8');
  console.log('Added proofOfDeliveryRepository to AdminShipmentService.java');
}

// 3. Fix WarehouseManagerService.java - add @Autowired field
let wmSvc = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');
if (!wmSvc.includes('proofOfDeliveryRepository;')) {
  wmSvc = wmSvc.replace('private final GeocodingService geocodingService;', 'private final GeocodingService geocodingService;\n    @org.springframework.beans.factory.annotation.Autowired(required = false)\n    private ProofOfDeliveryRepository proofOfDeliveryRepository;');
  fs.writeFileSync(`${base}\\service\\WarehouseManagerService.java`, wmSvc, 'utf8');
  console.log('Added proofOfDeliveryRepository to WarehouseManagerService.java');
}
