import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
shipment_service = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminShipmentService.java")

with open(shipment_service, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in AdminShipmentService: {len(lines)}")
# Look for methods
for idx, line in enumerate(lines):
    if "public " in line and ("(" in line or "{" in line):
        print(f"Line {idx+1}: {line.strip()}")
