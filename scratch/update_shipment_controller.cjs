const fs = require('fs');

const controllerContent = `package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.ShipmentSummaryDTO;
import com.primeroute.logistics.dto.TrackingResponseDTO;
import com.primeroute.logistics.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping("/track/{identifier}")
    public ResponseEntity<ApiResponse<TrackingResponseDTO>> trackShipment(
            @PathVariable String identifier,
            Authentication authentication) {

        String email = authentication.getName();
        TrackingResponseDTO result = shipmentService.trackShipment(email, identifier);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Shipment tracking retrieved successfully", result)
        );
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<ApiResponse<TrackingResponseDTO>> trackShipmentById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        TrackingResponseDTO result = shipmentService.trackShipmentById(email, id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Shipment tracking retrieved successfully", result)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrackingResponseDTO>> getShipmentDetails(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        TrackingResponseDTO result = shipmentService.trackShipmentById(email, id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Shipment details retrieved successfully", result)
        );
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<TrackingResponseDTO>> getShipmentDetailsBySubPath(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        TrackingResponseDTO result = shipmentService.trackShipmentById(email, id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Shipment details retrieved successfully", result)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShipmentSummaryDTO>>> getAllShipments(
            Authentication authentication) {

        String email = authentication.getName();
        List<ShipmentSummaryDTO> shipments = shipmentService.getAllShipments(email);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Shipments retrieved successfully", shipments)
        );
    }
}
`;

fs.writeFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/ShipmentController.java', controllerContent, 'utf8');
console.log('Successfully updated ShipmentController.java');
