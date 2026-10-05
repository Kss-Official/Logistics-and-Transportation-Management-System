$cp = "C:\Users\shrut\.m2\repository\org\springframework\security\spring-security-crypto\7.1.1\spring-security-crypto-7.1.1.jar"
$commons = "C:\Users\shrut\.m2\repository\commons-logging\commons-logging\1.2\commons-logging-1.2.jar"
$javac = "C:\Users\shrut\Downloads\spring-tools\sts-5.0.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.1.v20251108-1451\jre\bin\javac.exe"
$java = "C:\Users\shrut\Downloads\spring-tools\sts-5.0.0.RELEASE\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_25.0.1.v20251108-1451\jre\bin\java.exe"

& $javac -cp "$cp" scratch\TestBcrypt.java
& $java -cp "scratch;$cp;$commons" TestBcrypt
