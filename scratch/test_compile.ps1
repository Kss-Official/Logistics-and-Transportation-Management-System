$STS_JDK = "C:\Users\shrut\Downloads\spring-tools\sts-5.0.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.1.v20251108-1451\jre"
$BACKEND_DIR = "C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"

if (Test-Path "$STS_JDK\bin\java.exe") {
    $env:JAVA_HOME = $STS_JDK
    $env:Path = "$STS_JDK\bin;" + $env:Path
    Write-Host "[Compile] Using Java from STS: $STS_JDK" -ForegroundColor Green
}

& "$BACKEND_DIR\mvnw.cmd" -f "$BACKEND_DIR\pom.xml" test-compile
