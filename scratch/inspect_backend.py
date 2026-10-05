import os
import glob

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"

print("Checking Backend Dir:", os.path.exists(BACKEND_DIR))

# List all java files
java_files = glob.glob(os.path.join(BACKEND_DIR, "src", "main", "java", "**", "*.java"), recursive=True)
print(f"Total Java files found: {len(java_files)}")
for jf in sorted(java_files):
    rel = os.path.relpath(jf, BACKEND_DIR)
    print("  ", rel)
