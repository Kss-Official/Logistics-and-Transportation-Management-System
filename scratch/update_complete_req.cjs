const fs = require('fs');
const path = require('path');

const backendDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
const file = path.join(backendDir, 'src/main/java/com/primeroute/logistics/dto/driver/CompleteDeliveryRequest.java');

const content = `package com.primeroute.logistics.dto.driver;

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

    // Cash on Delivery (COD) explicit collection fields
    private Boolean codCollected;
    private Double collectedAmount;

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

    public Boolean getCodCollected() { return codCollected != null && codCollected; }
    public void setCodCollected(Boolean codCollected) { this.codCollected = codCollected; }

    public Double getCollectedAmount() { return collectedAmount; }
    public void setCollectedAmount(Double collectedAmount) { this.collectedAmount = collectedAmount; }
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Updated CompleteDeliveryRequest.java');
