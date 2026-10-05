import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
res_dir = os.path.join(BACKEND_DIR, r"src\main\resources")

print("Files in src/main/resources:")
for root, dirs, files in os.walk(res_dir):
    for f in files:
        print(" ", os.path.relpath(os.path.join(root, f), BACKEND_DIR))
