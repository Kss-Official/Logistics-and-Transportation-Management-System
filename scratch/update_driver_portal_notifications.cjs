const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/DriverPortalController.java';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('getDriverNotifications')) {
  // Add imports
  if (!code.includes('import com.primeroute.logistics.dto.NotificationDTO;')) {
    code = code.replace(
      'import com.primeroute.logistics.service.DriverPortalService;',
      'import com.primeroute.logistics.service.DriverPortalService;\nimport com.primeroute.logistics.service.NotificationService;\nimport com.primeroute.logistics.repository.UserRepository;\nimport com.primeroute.logistics.entity.User;\nimport com.primeroute.logistics.dto.NotificationDTO;\nimport org.springframework.security.core.Authentication;\nimport java.util.HashMap;'
    );
  }

  // Add autowired fields
  const autowiredInsert = '    @Autowired\n    private DriverPortalService driverPortalService;\n\n    @Autowired\n    private NotificationService notificationService;\n\n    @Autowired\n    private UserRepository userRepository;\n';
  code = code.replace('    @Autowired\n    private DriverPortalService driverPortalService;', autowiredInsert);

  // Add notification endpoints before closing bracket
  const notifEndpoints = `
    // ==========================================
    // DRIVER NOTIFICATIONS (ROLE_DRIVER)
    // ==========================================

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getDriverNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationDTO> list = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver notifications retrieved successfully", list));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDriverUnreadCount(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationService.getUnreadCount(user);
        Map<String, Long> res = new HashMap<>();
        res.put("unreadCount", count);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver unread count retrieved successfully", res));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markDriverNotificationRead(
            @PathVariable Long id,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver notification marked as read", null));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllDriverNotificationsRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "All driver notifications marked as read", null));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriverNotification(
            @PathVariable Long id,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver notification deleted successfully", null));
    }
`;

  const lastBrace = code.lastIndexOf('}');
  code = code.substring(0, lastBrace) + notifEndpoints + '\n}\n';
  fs.writeFileSync(file, code, 'utf8');
  console.log('DriverPortalController updated with driver notification endpoints!');
} else {
  console.log('DriverPortalController already has notification endpoints.');
}
