import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"

def read_file(rel_path):
    full_path = os.path.join(BACKEND_DIR, rel_path)
    print("=" * 80)
    print("FILE:", rel_path)
    print("=" * 80)
    if not os.path.exists(full_path):
        print("DOES NOT EXIST:", full_path)
        return
    with open(full_path, "r", encoding="utf-8") as f:
        print(f.read())

read_file(r"src\main\java\com\primeroute\logistics\entity\Vehicle.java")
read_file(r"src\main\java\com\primeroute\logistics\entity\Driver.java")
read_file(r"src\main\java\com\primeroute\logistics\entity\Shipment.java")
read_file(r"src\main\java\com\primeroute\logistics\entity\DriverStatus.java")
read_file(r"src\main\java\com\primeroute\logistics\entity\VehicleStatus.java")
read_file(r"src\main\java\com\primeroute\logistics\exception\AssignmentConflictException.java")
