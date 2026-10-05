$BACKEND_ROOT = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics"

# 1. Create ProofOfDelivery Entity
$podEntity = @"
package com.primeroute.logistics.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_deliveries")
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "received_by")
    private String receivedBy;

    @Column(name = "signature_data", columnDefinition = "TEXT", nullable = false)
    private String signatureData;

    @Column(name = "photo_data", columnDefinition = "TEXT")
    private String photoData;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "delivered_at", nullable = false)
    private LocalDateTime deliveredAt;

    @Column(name = "delivered_by")
    private String deliveredBy;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProofOfDelivery() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public String getSignatureData() {
        return signatureData;
    }

    public void setSignatureData(String signatureData) {
        this.signatureData = signatureData;
    }

    public String getPhotoData() {
        return photoData;
    }

    public void setPhotoData(String photoData) {
        this.photoData = photoData;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getDeliveredBy() {
        return deliveredBy;
    }

    public void setDeliveredBy(String deliveredBy) {
        this.deliveredBy = deliveredBy;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\entity\ProofOfDelivery.java", $podEntity, [System.Text.Encoding]::UTF8)
Write-Host "Created ProofOfDelivery.java"

# 2. Create ProofOfDeliveryRepository
$podRepo = @"
package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.ProofOfDelivery;
import com.primeroute.logistics.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery, Long> {
    Optional<ProofOfDelivery> findByShipment(Shipment shipment);
    Optional<ProofOfDelivery> findByShipmentId(Long shipmentId);
    boolean existsByShipment(Shipment shipment);
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\repository\ProofOfDeliveryRepository.java", $podRepo, [System.Text.Encoding]::UTF8)
Write-Host "Created ProofOfDeliveryRepository.java"

# 3. Create ProofOfDeliveryDTO
$podDto = @"
package com.primeroute.logistics.dto.driver;

import java.time.LocalDateTime;

public class ProofOfDeliveryDTO {
    private Long id;
    private Long shipmentId;
    private String trackingNumber;
    private String recipientName;
    private String receivedBy;
    private String signatureData;
    private String signatureBase64;
    private String photoData;
    private String photoUrl;
    private String deliveryNotes;
    private String notes;
    private String deliveredAt;
    private String deliveredBy;
    private Double latitude;
    private Double longitude;

    public ProofOfDeliveryDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }

    public String getSignatureData() { return signatureData; }
    public void setSignatureData(String signatureData) {
        this.signatureData = signatureData;
        this.signatureBase64 = signatureData;
    }

    public String getSignatureBase64() { return signatureBase64; }
    public void setSignatureBase64(String signatureBase64) {
        this.signatureBase64 = signatureBase64;
        this.signatureData = signatureBase64;
    }

    public String getPhotoData() { return photoData; }
    public void setPhotoData(String photoData) {
        this.photoData = photoData;
        this.photoUrl = photoData;
    }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
        this.photoData = photoUrl;
    }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
        this.notes = deliveryNotes;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) {
        this.notes = notes;
        this.deliveryNotes = notes;
    }

    public String getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(String deliveredAt) { this.deliveredAt = deliveredAt; }

    public String getDeliveredBy() { return deliveredBy; }
    public void setDeliveredBy(String deliveredBy) { this.deliveredBy = deliveredBy; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\dto\driver\ProofOfDeliveryDTO.java", $podDto, [System.Text.Encoding]::UTF8)
Write-Host "Created ProofOfDeliveryDTO.java"

# 4. Create CompleteDeliveryRequest
$compReq = @"
package com.primeroute.logistics.dto.driver;

public class CompleteDeliveryRequest {
    private String recipientName;
    private String receivedBy;
    private String signatureData;
    private String signatureBase64;
    private String photoData;
    private String photoUrl;
    private String deliveryNotes;
    private String notes;
    private Double latitude;
    private Double longitude;

    public CompleteDeliveryRequest() {}

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }

    public String getSignatureData() {
        return signatureData != null ? signatureData : signatureBase64;
    }
    public void setSignatureData(String signatureData) {
        this.signatureData = signatureData;
    }

    public String getSignatureBase64() {
        return signatureBase64 != null ? signatureBase64 : signatureData;
    }
    public void setSignatureBase64(String signatureBase64) {
        this.signatureBase64 = signatureBase64;
    }

    public String getPhotoData() {
        return photoData != null ? photoData : photoUrl;
    }
    public void setPhotoData(String photoData) {
        this.photoData = photoData;
    }

    public String getPhotoUrl() {
        return photoUrl != null ? photoUrl : photoData;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getDeliveryNotes() {
        return deliveryNotes != null ? deliveryNotes : notes;
    }
    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public String getNotes() {
        return notes != null ? notes : deliveryNotes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
"@
[System.IO.File]::WriteAllText("$BACKEND_ROOT\dto\driver\CompleteDeliveryRequest.java", $compReq, [System.Text.Encoding]::UTF8)
Write-Host "Created CompleteDeliveryRequest.java"
