# Frontend
- login
## Functionality
- post employees, get employees
- 
# Backend
## db design
To design the database for your ER diagram, we’ll follow a structured approach:

**Step 1:** Create the Entities
We'll create tables for each entity and define their attributes and constraints.

1. Employee Table
```sql
CREATE TABLE Employee (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Department VARCHAR(50),
    ContactNo VARCHAR(15),
    Address TEXT,
    Email VARCHAR(100),
    Role VARCHAR(50),
    DateOfJoining DATE
);
```
2. User Role Table
```sql
CREATE TABLE UserRole (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);
```
3. Authentication Table
```sql
CREATE TABLE Authentication (
    AuthID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    LastLogin DATETIME,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE
);
```
4. Salary Table
```sql
CREATE TABLE Salary (
    SalaryID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    BasicPay DECIMAL(10, 2) NOT NULL,
    Allowances DECIMAL(10, 2) DEFAULT 0.00,
    Deductions DECIMAL(10, 2) DEFAULT 0.00,
    Bonuses DECIMAL(10, 2) DEFAULT 0.00,
    NetSalary DECIMAL(10, 2) GENERATED ALWAYS AS (BasicPay + Allowances + Bonuses - Deductions) STORED,
    Date DATE NOT NULL,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE
);
```
5. Payroll History Table
```sql
CREATE TABLE PayrollHistory (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    SalaryID INT NOT NULL,
    PaymentMethod VARCHAR(50),
    DisbursementDate DATE NOT NULL,
    FOREIGN KEY (SalaryID) REFERENCES Salary(SalaryID) ON DELETE CASCADE
);
```
6. Performance Stats Table
```sql
CREATE TABLE PerformanceStats (
    EvaluationID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    Grade VARCHAR(5),
    EvaluationDate DATE NOT NULL,
    Comments TEXT,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE
);
```
Step 2: Create Relationship Tables
For many-to-many or special relationships, we need junction tables.

1. Assigned Role (EMPLOYEE <-> USER_ROLE)
```sql
CREATE TABLE AssignedRole (
    EmployeeID INT NOT NULL,
    RoleID INT NOT NULL,
    PRIMARY KEY (EmployeeID, RoleID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES UserRole(RoleID) ON DELETE CASCADE
);
```
2. Payroll Adjustments (SALARY <-> PAYROLL_HISTORY)
```sql
CREATE TABLE PayrollAdjustments (
    AdjustmentID INT AUTO_INCREMENT PRIMARY KEY,
    SalaryID INT NOT NULL,
    HistoryID INT NOT NULL,
    AdjustmentDetails TEXT,
    FOREIGN KEY (SalaryID) REFERENCES Salary(SalaryID) ON DELETE CASCADE,
    FOREIGN KEY (HistoryID) REFERENCES PayrollHistory(HistoryID) ON DELETE CASCADE
);
```
3. Performance Evaluation (EMPLOYEE <-> PERFORMANCE_STATS)

```sql
CREATE TABLE PerformanceEval (
    EmployeeID INT NOT NULL,
    EvaluationID INT NOT NULL,
    PRIMARY KEY (EmployeeID, EvaluationID),
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE,
    FOREIGN KEY (EvaluationID) REFERENCES PerformanceStats(EvaluationID) ON DELETE CASCADE
);
```
**Step 3:** Add Constraints and Optimizations
Indexes: Add indexes to frequently queried columns for faster lookups:
```sql
CREATE INDEX idx_employee_name ON Employee (Name);
CREATE INDEX idx_auth_username ON Authentication (Username);
```
Default Values: Add default values for nullable columns, if necessary.

**Step 4:** Test the Schema
Insert sample data and test the relationships:
```sql
-- Add Employee
INSERT INTO Employee (Name, Department, ContactNo, Email, Role, DateOfJoining) 
VALUES ('John Doe', 'Finance', '1234567890', 'john.doe@example.com', 'Manager', '2022-01-01');

-- Add Role
INSERT INTO UserRole (RoleName) 
VALUES ('Manager');

-- Assign Role
INSERT INTO AssignedRole (EmployeeID, RoleID) 
VALUES (1, 1);

-- Add Authentication
INSERT INTO Authentication (EmployeeID, Username, PasswordHash, LastLogin) 
VALUES (1, 'johndoe', 'hashed_password', '2024-12-01 10:00:00');

-- Add Salary
INSERT INTO Salary (EmployeeID, BasicPay, Allowances, Deductions, Bonuses, Date) 
VALUES (1, 50000.00, 5000.00, 2000.00, 1000.00, '2024-12-01');

-- Add Payroll History
INSERT INTO PayrollHistory (SalaryID, PaymentMethod, DisbursementDate) 
VALUES (1, 'Bank Transfer', '2024-12-02');
```
Step 5: Query the Data
Write queries to retrieve and validate the data:

```sql
-- Join Employee with Salary
SELECT 
    e.Name, e.Department, s.BasicPay, s.Allowances, s.Deductions, s.NetSalary
FROM 
    Employee e
JOIN 
    Salary s ON e.EmployeeID = s.EmployeeID;

-- Join Employee with Authentication
SELECT 
    e.Name, a.Username, a.LastLogin
FROM 
    Employee e
JOIN 
    Authentication a ON e.EmployeeID = a.EmployeeID;

-- Payroll History
SELECT 
    e.Name, ph.PaymentMethod, ph.DisbursementDate, s.NetSalary
FROM 
    Employee e
JOIN 
    Salary s ON e.EmployeeID = s.EmployeeID
JOIN 
    PayrollHistory ph ON s.SalaryID = ph.SalaryID;
```
This schema captures all the entities and relationships from your ER diagram and is designed to ensure data integrity, scalability, and usability. Let me know if you want additional features like triggers or stored procedures!

new updates
```sql
CREATE TABLE current_salary (
  EmployeeID INT NOT NULL,
  SalaryID INT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (EmployeeID, SalaryID),
  FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (SalaryID) REFERENCES Salary(SalaryID) ON DELETE CASCADE ON UPDATE CASCADE
);

```
haha
```sql
INSERT INTO salary (EmployeeID, BasicPay, Allowances, Deductions, Bonuses, Date) VALUES (6, 500000, 2000, 1000, 1500, '2025-01-01');
```

```sql
ALTER TABLE Employee
ADD COLUMN RoleID INT;
```

```mysql
ALTER TABLE Employee
ADD CONSTRAINT fk_roleid
FOREIGN KEY (RoleID)
REFERENCES userrole (RoleID)
ON DELETE SET NULL;  -- Optional, based on your preference for handling deletions in the referenced table
```
authentication table
```sql
CREATE TABLE authentications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  employeeId INT NOT NULL,
  FOREIGN KEY (employeeId) REFERENCES employee(employeeID)
);
```

adding supervisorID
```sql
ALTER TABLE Employee
ADD COLUMN SupervisorID INT NULL;
ALTER TABLE Employee
ADD CONSTRAINT FK_Supervisor
FOREIGN KEY (SupervisorID) REFERENCES Employee(EmployeeID)
ON DELETE SET NULL ON UPDATE CASCADE;

```


## DB testing
root login
```bash
#Login
mysql -u root -p
#show databases
show databases;
#using db
USE EmployeeManagement;
#showing database

```

## setting up backend
setup according to directory structure
## Test using postman
- POST `http://localhost:3001/api/employees/add`
- In headers put ket as `Content-Type` and value as `application/json`
- Go to body and put it as raw
```json
{
"Name": "selena",
"Department": "food",
"ContactNo": "1234566890",
"Address": "1234 Main St",
"Email": "katelyn@example.com",
"Role": "cook",
"DateOfJoining": "2022-03-01"
}
```
- sql commands
```sql
#describe
SELECT * FROM AssignedRole;
#insert role
INSERT INTO AssignedRole (EmployeeID, RoleID) VALUES (1, 1);
#get rolemame of the employee give employeeid
SELECT ur.RoleName FROM AssignedRole erm JOIN UserRole ur ON erm.RoleID = ur.RoleID WHERE erm.EmployeeID = 2;
```
- GET `http://localhost:3001/api/employees/`
to get all employees
- GET `http://localhost:3001/api/employees/id`
replace id with emp id like
`http://localhost:3001/api/employees/2`

- POST `http://localhost:3001/api/employees/2/evaluations`
```json
{
"employeeId": 7,
"grade": "A",
"evaluationDate": "2024-01-13",
"comments": "Excellent performance in all areas"
}
```
- GET `http://localhost:3001/api/employees/2/evaluations`
- GET `http://localhost:3001/api/employees/6/performance`
- GET `http://localhost:3001/api/employees/6/salary`
```json
{ "employeeID": 6, "grade": "A", "evaluationDate": "2025-01-17", "comments": "Excellent performance throughout the year." }
```

```json
{
  "EmployeeID": 1,
  "BasicPay": 50000.00,
  "Allowances": 5000.00,
  "Deductions": 2000.00,
  "Bonuses": 3000.00,
  "NetSalary": 56000.00,
  "Date": "2025-01-18T00:00:00Z"
}

```