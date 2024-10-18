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
(1, 'ROLE_PATIENT'),
(2, 'ROLE_COMPANION');

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
CREATE TABLE patient (
    id BIGINT PRIMARY KEY,
    random_string VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (id) REFERENCES users(id)
);

-- 创建 companions 表
CREATE TABLE companion (
    id BIGINT PRIMARY KEY,
    patient_id BIGINT,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patient(id)
);

-- 创建 accounts 表
CREATE TABLE account (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_name VARCHAR(255) NOT NULL,
    total_income DECIMAL(10, 2) NOT NULL,
    total_expense DECIMAL(10, 2) NOT NULL,
    patient_id BIGINT,
    FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
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
    FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);