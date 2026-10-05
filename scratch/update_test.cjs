const fs = require('fs');
const path = require('path');

const backendDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
const file = path.join(backendDir, 'src/test/java/com/primeroute/logistics/service/ForgotPasswordAndResetIntegrationTest.java');
let code = fs.readFileSync(file, 'utf8');

const target3 = '        assertTrue(updatedUser.getPassword().startsWith("$2a$") || updatedUser.getPassword().startsWith("$2b$"));\r\n        assertTrue(resetToken.isUsed());';
const target3Unix = '        assertTrue(updatedUser.getPassword().startsWith("$2a$") || updatedUser.getPassword().startsWith("$2b$"));\n        assertTrue(resetToken.isUsed());';

const rep3 = '        assertTrue(updatedUser.getPassword().startsWith("$2a$") || updatedUser.getPassword().startsWith("$2b$"));\n        assertNotNull(updatedUser.getLastPasswordChange());\n        assertTrue(updatedUser.getLastPasswordChange().isAfter(LocalDateTime.now().minusMinutes(1)));\n        assertTrue(resetToken.isUsed());';

if (code.includes(target3)) {
  code = code.replace(target3, rep3);
} else if (code.includes(target3Unix)) {
  code = code.replace(target3Unix, rep3);
} else {
  console.log('Target3 not found directly, let us check index...');
}

const newTest = `
    @Test
    @DisplayName("11. Resetting password explicitly updates last_password_change timestamp")
    void testResetUpdatesLastPasswordChangeTimestamp() {
        LocalDateTime pastTimestamp = LocalDateTime.now().minusDays(5);
        testCustomer.setLastPasswordChange(pastTimestamp);

        String rawToken = "token-for-timestamp-test";
        String hashedToken = ForgotPasswordService.hashToken(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(
                hashedToken,
                testCustomer,
                LocalDateTime.now().plusMinutes(15)
        );

        when(passwordResetTokenRepository.findByToken(hashedToken)).thenReturn(Optional.of(resetToken));

        LocalDateTime beforeReset = LocalDateTime.now().minusSeconds(1);
        User updatedUser = resetPasswordService.resetPassword(rawToken, "TimestampPass@2026!", "TimestampPass@2026!");

        assertNotNull(updatedUser.getLastPasswordChange());
        assertTrue(updatedUser.getLastPasswordChange().isAfter(pastTimestamp),
                "lastPasswordChange must be updated past the previous timestamp");
        assertTrue(updatedUser.getLastPasswordChange().isAfter(beforeReset) || updatedUser.getLastPasswordChange().isEqual(beforeReset),
                "lastPasswordChange must be set to current time during reset");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, atLeastOnce()).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals(updatedUser.getLastPasswordChange(), savedUser.getLastPasswordChange());
    }
}
`;

const lastBraceIdx = code.lastIndexOf('}');
code = code.substring(0, lastBraceIdx) + newTest;
fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated ForgotPasswordAndResetIntegrationTest.java');
