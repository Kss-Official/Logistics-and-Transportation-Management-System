import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
shipment_service = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminShipmentService.java")

with open(shipment_service, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(75, 145):
    print(f"{i+1}: {lines[i]}", end="")
