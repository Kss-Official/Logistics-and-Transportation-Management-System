const fs = require('fs');
const p = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\ResetPasswordService.java';

let content = fs.readFileSync(p, 'utf8');

if (!content.includes('import org.slf4j.Logger;')) {
  content = content.replace(
    'import org.springframework.stereotype.Service;',
    'import org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\nimport org.springframework.stereotype.Service;'
  );
}

if (!content.includes('private static final Logger log')) {
  content = content.replace(
    'public class ResetPasswordService {',
    'public class ResetPasswordService {\n\n    private static final Logger log = LoggerFactory.getLogger(ResetPasswordService.class);'
  );
}

const saveTarget = `user.setPassword(passwordEncoder.encode(newPassword));
        User savedUser = userRepository.save(user);`;

const saveReplace = `user.setPassword(passwordEncoder.encode(newPassword));
        User savedUser = userRepository.save(user);

        log.info("PASSWORD RESET email={} userId={} role={} passwordHashUpdated=true hashPrefix={} hashLength={}",
                savedUser.getEmail(), savedUser.getId(), savedUser.getRole(),
                savedUser.getPassword().substring(0, Math.min(7, savedUser.getPassword().length())),
                savedUser.getPassword().length());`;

if (!content.includes('PASSWORD RESET email=')) {
  content = content.replace(saveTarget, saveReplace);
}

fs.writeFileSync(p, content, 'utf8');
console.log('Added safe diagnostic logging to ResetPasswordService.java');
