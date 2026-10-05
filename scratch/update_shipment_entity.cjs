const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\entity\\Shipment.java';
let content = fs.readFileSync(filePath, 'utf8');

// Check if lastLocationUpdatedAt field exists
if (!content.includes('lastLocationUpdatedAt')) {
  console.log('Adding lastLocationUpdatedAt field and accessors to Shipment.java');
  // Add field after currentLocationName
  content = content.replace(
    /private String currentLocationName;\s*\r?\n/,
    'private String currentLocationName;\r\n\r\n    @Column(name = "last_location_updated_at")\r\n    private LocalDateTime lastLocationUpdatedAt;\r\n'
  );

  // Add getter and setter before the end of the class
  const accessors = `
    public LocalDateTime getLastLocationUpdatedAt() {
        return lastLocationUpdatedAt;
    }

    public void setLastLocationUpdatedAt(LocalDateTime lastLocationUpdatedAt) {
        this.lastLocationUpdatedAt = lastLocationUpdatedAt;
    }
}
`;
  content = content.replace(/\}\s*$/, accessors);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully updated Shipment.java');
} else {
  console.log('Shipment.java already contains lastLocationUpdatedAt');
}
