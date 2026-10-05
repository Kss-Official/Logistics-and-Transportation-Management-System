import os
import glob

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"

controllers = glob.glob(os.path.join(BACKEND_DIR, "src", "main", "java", "**", "*Controller*.java"), recursive=True)
print("Controllers found:")
for c in sorted(controllers):
    print("  ", os.path.relpath(c, BACKEND_DIR))
