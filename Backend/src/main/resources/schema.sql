-- 删除现有的表（如果存在）
DROP TABLE IF EXISTS companions;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS health_records;

-- 创建 user_roles 表
CREATE TABLE user_roles (
    role_id INTEGER PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);

-- 插入角色数据
INSERT INTO user_roles (role_id, role) VALUES
(1, 'ROLE_ADMIN'),
(2, 'ROLE_USER');

-- 创建 users 表（基础用户表）
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    role_id INTEGER,
    avatar VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

-- 创建 patients 表
CREATE TABLE patients (
    id BIGINT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES users(id)
);

-- 创建 companions 表
CREATE TABLE companions (
    id BIGINT PRIMARY KEY,
    patient_id BIGINT,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 创建 accounts 表
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_name VARCHAR(255) NOT NULL,
    total_income DECIMAL(10, 2) NOT NULL,
    total_expense DECIMAL(10, 2) NOT NULL,
    patient_id BIGINT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 创建 health_records 表
CREATE TABLE health_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    SBP INTEGER,
    DBP INTEGER,
    is_headache VARCHAR(5),
    is_back_pain VARCHAR(5),
    is_chest_pain VARCHAR(5),
    is_less_urination VARCHAR(5),
    import_time TIMESTAMP,
    description VARCHAR(255),
    account_id BIGINT,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 插入一些示例数据（可选）
INSERT INTO users (username, password, email, phone, dob, role_id, avatar) VALUES
('johndoe', 'password123', 'johndoe@example.com', '1234567890', '1990-01-15', 2, null),
('janedoe', 'securepassword', 'janedoe@example.com', '0987654321', '1992-02-25', 2, null);

INSERT INTO patients (id) VALUES
(1);

INSERT INTO companions (id, patient_id) VALUES
(2, 1);

INSERT INTO accounts (account_name, total_income, total_expense, patient_id) VALUES
('John''s Account', 1000.00, 500.00, 1);