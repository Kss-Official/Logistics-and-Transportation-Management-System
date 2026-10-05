import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
vehicle_service = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminVehicleService.java")

with open(vehicle_service, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "assignDriver" in line or "getAvailableVehicles" in line or "convertToDto" in line:
        print(f"Line {idx+1}: {line.strip()}")
