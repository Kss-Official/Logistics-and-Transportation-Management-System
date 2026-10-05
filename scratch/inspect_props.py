import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
app_props = os.path.join(BACKEND_DIR, r"src\main\resources\application.properties")

with open(app_props, "r", encoding="utf-8") as f:
    for line in f:
        if any(k in line.lower() for k in ["datasource", "jpa", "port"]):
            print(line.strip())
