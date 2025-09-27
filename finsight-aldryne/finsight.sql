CREATE DATABASE finsight;
use finsight;
-- USERS
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email_add VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_description TEXT,
    budgeting_challenges TEXT,
    spending_priority VARCHAR(100),
    confidence_level TINYINT CHECK (confidence_level BETWEEN 1 AND 10),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SELECT user_id, full_name, email_add, verified FROM users;

delete from users;
delete from otps;

ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;
-- OTPS
CREATE TABLE otps (
    otp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    type ENUM('signup','reset','2fa') NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
-- email: finsightapplication.email@gmail.com
-- email pass: group1finsightprojman

-- WALLETS
CREATE TABLE wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_name VARCHAR(100) NOT NULL,
    wallet_type ENUM('Cash','Bank','E-Wallet','Other') NOT NULL,
    wallet_created DATE DEFAULT (CURRENT_DATE),
    wallet_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);



-- CATEGORIES
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_created DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- BUDGETS
CREATE TABLE budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT,
    budget_amount DECIMAL(12,2) NOT NULL,
    budget_period ENUM('Daily','Weekly','Monthly','Custom') NOT NULL,
    budget_rule TEXT,
    budget_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    budget_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- INCOME
CREATE TABLE income (
    income_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT,
    money_source VARCHAR(150),
    amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    income_date DATE NOT NULL,
    income_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- EXPENSES
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT,
    amount_spent DECIMAL(12,2) NOT NULL,
    notes TEXT,
    expense_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- SAVINGS JARS
CREATE TABLE savings_jars (
    savings_jar_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    jar_name VARCHAR(100) NOT NULL,
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    savings_jar_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    savings_jar_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- TRANSACTION
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT,
    source_id INT NOT NULL,                     -- refers to income_id or expense_id
    source_type ENUM('income','expense') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);


-- CREDIT WALLET
CREATE TABLE credit_wallets (
    credit_wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,                        -- link to main wallets table
    card_provider VARCHAR(100) NOT NULL,           -- e.g., BDO, Citibank
    card_number_last4 CHAR(4) NOT NULL,            -- last 4 digits only
    billing_date TINYINT NOT NULL CHECK (billing_date BETWEEN 1 AND 31),
    due_date TINYINT NOT NULL CHECK (due_date BETWEEN 1 AND 31),
    credit_limit DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2),                    -- percentage (e.g. 3.25)
    notes TEXT,
    statement_balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE
);

-- AI CHAT
CREATE TABLE ai_chat (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message_text TEXT NOT NULL,                     -- user’s input
    response_text TEXT,                             -- AI’s response
    messenger_type ENUM('web','mobile','bot') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- time of message
    reference_id VARCHAR(100),                      -- link to related entity (optional)
    context_data JSON,                              -- store session context, e.g. {"topic":"budget"}
   
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);