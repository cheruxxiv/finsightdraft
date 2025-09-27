const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Connect to MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "finsight",
  database: "finsight"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});

// 2. Nodemailer transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "finsightapplication.email@gmail.com",      // replace with your email
    pass: "lzvj amvn udmf pnco"        // replace with your app password
  }
});

// 3. Helper: Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===================== SIGNUP =====================
app.post("/signup", async (req, res) => {
  const { full_name, email_add, password } = req.body;
  if (!full_name || !email_add || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (full_name, email_add, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [full_name, email_add, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ DB Error inserting user:", err.sqlMessage);
        return res.status(500).json({ message: "Failed to register user", error: err.sqlMessage });
      }

      const userId = result.insertId;
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes

      // Save OTP to otps table
      const otpSql = `
        INSERT INTO otps (user_id, otp_code, type, expires_at)
        VALUES (?, ?, 'signup', ?)
      `;
      db.query(otpSql, [userId, otpCode, expiresAt], (err2) => {
        if (err2) {
          console.error("❌ OTP DB Error:", err2);
          return res.status(500).json({ message: "Failed to generate OTP" });
        }

        // Send OTP email
        transporter.sendMail({
          from: '"FinSight App" <finsightapplication.email@gmail.com>',
          to: email_add,
          subject: "Verify your email",
          text: `Your OTP code is: ${otpCode}`
        }, (emailErr) => {
          if (emailErr) {
            console.error("❌ Email error:", emailErr);
            return res.status(500).json({ message: "Failed to send OTP" });
          }

          console.log("✅ Signup OTP sent to", email_add);
          res.json({ message: "User registered! OTP sent.", userId });
        });
      });
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== VERIFY OTP =====================
app.post("/verify-otp", (req, res) => {
  let { user_id, otp_code } = req.body;

  // Ensure numeric user_id
  user_id = Number(user_id);
  if (!user_id || !otp_code) {
    return res.status(400).json({ message: "Missing fields" });
  }

  console.log("Verifying OTP for user_id:", user_id, "otp_code:", otp_code);

  const selectOtpSql = `
    SELECT * FROM otps
    WHERE user_id = ? AND otp_code = ? AND type='signup' AND used=FALSE AND expires_at > NOW()
  `;

  db.query(selectOtpSql, [user_id, otp_code], (err, results) => {
    if (err) {
      console.error("DB error selecting OTP:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      console.warn("Invalid or expired OTP for user_id:", user_id);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpId = results[0].otp_id;

    // Use a transaction-like flow
    const markOtpUsedSql = "UPDATE otps SET used=TRUE WHERE otp_id=?";
    db.query(markOtpUsedSql, [otpId], (err2) => {
      if (err2) {
        console.error("DB error marking OTP as used:", err2);
        return res.status(500).json({ message: "Failed to mark OTP as used" });
      }

      const verifyUserSql = "UPDATE users SET verified=TRUE WHERE user_id=?";
      db.query(verifyUserSql, [user_id], (err3, result3) => {
        if (err3) {
          console.error("DB error verifying user:", err3);
          return res.status(500).json({ message: "Failed to verify user" });
        }

        if (result3.affectedRows === 0) {
          console.warn("No user found with user_id:", user_id);
          return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User verified successfully:", user_id);
        return res.json({ message: "✅ Email verified successfully!", userId: user_id });
      });
    });
  });
});


// ===================== LOGIN =====================
app.post("/login", (req, res) => {
  const { email_add, password } = req.body;

  const sql = "SELECT * FROM users WHERE email_add = ?";
  db.query(sql, [email_add], async (err, results) => {
    if (err) return res.status(500).json({ message: "Error on login" });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      res.json({ message: "Login successful", user_id: user.user_id, verified: user.verified });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });
});

// ===================== BUDGET CHECK-IN =====================
app.post("/budget-checkin", async (req, res) => {
  const { user_id, user_description, budgeting_challenges, spending_priority, confidence_level } = req.body;

  if (!user_id) return res.status(400).json({ message: "Missing user ID" });

  try {
    const [result] = await db.execute(
      `UPDATE users 
       SET user_description = ?, budgeting_challenges = ?, spending_priority = ?, confidence_level = ?, updated_at = NOW() 
       WHERE user_id = ?`,
      [user_description, budgeting_challenges, spending_priority, confidence_level, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Budgeting check-in saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===================== GET USER INFO =====================
app.get("/user", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: true, message: "User ID required" });
  }

  const sql = `
    SELECT user_id, full_name, email_add, user_description,
           budgeting_challenges, spending_priority, confidence_level
    FROM users
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: true, message: "Error fetching user info" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const user = results[0];
    // ✅ Use full_name
    res.json({
      user_id: user.user_id,
      full_name: user.full_name,
    });
  });
});
// ===================== HOME SUMMARY =====================
app.get("/home/summary", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const sql = `
    SELECT 
      full_name AS first_name, 
      COALESCE(SUM(t.amount), 0) AS spent, 
      COALESCE(u.monthly_budget, 0) AS budget
    FROM users u
    LEFT JOIN transactions t ON u.user_id = t.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ message: "Error fetching summary" });
    }

    if (results.length === 0) {
      return res.json({ first_name: "User", spent: 0, budget: 0 });
    }

    res.json(results[0]);
  });
});



// ===================== ADD WALLET =====================
app.post("/add-wallet", (req, res) => {
  const { user_id, wallet_name, wallet_type } = req.body;

  if (!user_id || !wallet_name || !wallet_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate wallet_type against ENUM
  const validTypes = ["Cash", "Bank", "E-Wallet", "Savings", "Other"];
  if (!validTypes.includes(wallet_type)) {
    return res.status(400).json({ message: "Invalid wallet type" });
  }

  // Check for duplicate wallet name for the same user
  const checkSql = `SELECT * FROM wallets WHERE user_id = ? AND wallet_name = ?`;
  db.query(checkSql, [user_id, wallet_name], (err, results) => {
    if (err) {
      console.error("❌ DB error checking duplicate wallet:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "You already have a wallet with this name" });
    }

    // Insert wallet
    const insertSql = `
      INSERT INTO wallets (user_id, wallet_name, wallet_type)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [user_id, wallet_name, wallet_type], (err2, result) => {
      if (err2) {
        console.error("❌ Failed to add wallet:", err2);
        return res.status(500).json({ message: "Failed to add wallet" });
      }

      res.json({ 
        message: "✅ Wallet added successfully", 
        wallet_id: result.insertId 
      });
    });
  });
});

// ===================== GET WALLETS WITH BUDGETS & INCOME =====================
app.get("/wallets", (req, res) => {
  const user_id = Number(req.query.user_id);
  if (!user_id) return res.status(400).json({ message: "Missing user ID" });

  const sql = `
    SELECT w.wallet_id, w.wallet_name, w.wallet_type,
           COALESCE(SUM(b.budget_amount), 0) AS total_budget,
           COALESCE(SUM(i.amount), 0) AS total_income
    FROM wallets w
    LEFT JOIN budgets b ON w.wallet_id = b.wallet_id
    LEFT JOIN income i ON w.wallet_id = i.wallet_id
    WHERE w.user_id = ?
    GROUP BY w.wallet_id, w.wallet_name, w.wallet_type
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("DB error fetching wallets:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // ✅ Ensure default values
    const normalized = results.map(r => ({
      ...r,
      total_budget: r.total_budget || 0,
      total_income: r.total_income || 0,
    }));

    res.json(normalized);
  });
});


// ===================== GET CREDIT CARDS =====================
app.get("/credit-cards", (req, res) => {
  const user_id = Number(req.query.user_id);
  if (!user_id) return res.status(400).json({ message: "Missing user ID" });

  const sql = `
    SELECT credit_wallet_id, card_provider, card_number_last4, 
           billing_date, due_date, credit_limit 
    FROM credit_wallets WHERE user_id = ?`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("DB error fetching credit cards:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results); // return array
  });
});


// ===================== START SERVER =====================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});