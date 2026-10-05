const fs = require('fs');

let content = fs.readFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', 'utf8');
content = content.replace(
`    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            FulfillmentEngineService fulfillmentEngineService) {`,
`    @org.springframework.beans.factory.annotation.Autowired
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) FulfillmentEngineService fulfillmentEngineService) {`
);

fs.writeFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', content, 'utf8');
console.log('Added @Autowired to ShipmentService constructor');
