const fs = require('fs');
const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\AuthService.java';

let content = fs.readFileSync(path, 'utf8');

// Add org.slf4j imports if missing
if (!content.includes('import org.slf4j.Logger;')) {
  content = content.replace(
    'import org.springframework.stereotype.Service;',
    'import org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.stereotype.Service;'
  );
}

// Add logger and diagnostic log in login
const targetStr = `public class AuthService {`;
const replaceWith = `public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);`;

if (!content.includes('private static final Logger log')) {
  content = content.replace(targetStr, replaceWith);
}

const loginTarget = `public LoginResponse login(LoginRequest request) {

        String cleanEmail = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String rawPassword = (request.getPassword() != null) ? request.getPassword() : "";
        String trimmedPassword = rawPassword.trim();`;

const loginReplace = `public LoginResponse login(LoginRequest request) {

        String cleanEmail = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String rawPassword = (request.getPassword() != null) ? request.getPassword() : "";
        String trimmedPassword = rawPassword.trim();

        User probeUser = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail))
                .orElse(null);

        boolean userFound = (probeUser != null);
        String roleStr = (probeUser != null && probeUser.getRole() != null) ? probeUser.getRole().name() : "N/A";
        boolean accountActive = (probeUser != null && !"INACTIVE".equalsIgnoreCase(probeUser.getStatus()));
        boolean passwordMatch = (probeUser != null && probeUser.getPassword() != null && 
                (passwordEncoder.matches(rawPassword, probeUser.getPassword()) || 
                 passwordEncoder.matches(trimmedPassword, probeUser.getPassword())));

        log.info("LOGIN ATTEMPT email={} | USER FOUND={} | ROLE={} | ACCOUNT ACTIVE={} | PASSWORD MATCH={}",
                cleanEmail, userFound, roleStr, accountActive, passwordMatch);`;

content = content.replace(loginTarget, loginReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated AuthService.java with diagnostic logging.');
