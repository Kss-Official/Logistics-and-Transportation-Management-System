import os

BACKEND_DIR = r"C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management"
data_init = os.path.join(BACKEND_DIR, r"src\main\java\com\primeroute\logistics\config\DataInitializer.java")

with open(data_init, "r", encoding="utf-8") as f:
    content = f.read()

print(content)
