const { spawn } = require('child_process');
const path = require('path');

const stsJdk = 'C:/Users/shrut/Downloads/spring-tools/sts-5.0.0.RELEASE/plugins/org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.1.v20251108-1451/jre';
const backendDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
const mvnw = path.join(backendDir, 'mvnw.cmd');

const env = Object.assign({}, process.env, {
  JAVA_HOME: stsJdk,
  Path: path.join(stsJdk, 'bin') + ';' + (process.env.Path || '')
});

const args = ['-f', path.join(backendDir, 'pom.xml'), 'test'];
if (process.argv[2]) {
  args.push('-Dtest=' + process.argv[2]);
}

console.log('Running: mvnw', args.join(' '));
const proc = spawn(mvnw, args, { env, shell: true });

proc.stdout.on('data', d => process.stdout.write(d));
proc.stderr.on('data', d => process.stderr.write(d));
proc.on('close', code => {
  console.log('Finished with exit code:', code);
  process.exit(code || 0);
});
