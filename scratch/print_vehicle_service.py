import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
vehicle_service = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\service\AdminVehicleService.java")

with open(vehicle_service, "r", encoding="utf-8") as f:
    lines = f.readlines()

def print_range(start, end):
    print("=" * 60)
    print(f"LINES {start} to {end}:")
    print("=" * 60)
    for i in range(start - 1, min(end, len(lines))):
        print(f"{i+1}: {lines[i]}", end="")

print_range(35, 60)
print_range(135, 195)
