const pool = require("../database/");
const bcrypt = require("bcryptjs");

/*******
 * Register a new account
 */

async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const dbResult = await pool.query(
      "SELECT current_database(), current_schema()"
    );
    console.log(dbResult.rows);

    // Check if email exists
    const check = await pool.query(
      "SELECT * FROM public.account WHERE account_email = $1",
      [account_email]
    );

    if (check.rows.length > 0) {
      console.log("Email is already registered.");
      throw new Error("Email already registered.");
    }

    const sql = `INSERT INTO public.account 
        (
        account_firstname, 
        account_lastname,
        account_email,
        account_password,
        account_type) 
        VALUES ($1, $2, $3, $4, 'Client') RETURNING *`;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("registerAccount error " + error);
    throw error;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *************************
 * Check Account
 * *********************** */
async function checkAccount(account_email, account_password) {
  try {
    const sql = "SELECT * FROM public.account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    const account = result.rows[0];
    if (!account) {
      console.log("No account found for", account_email);
      return null;
    }

    console.log("Entered password:", account_password);
    console.log("Stored hash", account.account_password);

    const passwordMatch = await bcrypt.compare(
      account_password,
      account.account_password
    );
    console.log("Password match:", passwordMatch);
    if (passwordMatch) return account;
    return null;
  } catch (error) {
    console.error("checkAccount error", error);
    throw error;
  }
}

/* *************************
 *  Get account by email
 * ************************* */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error:", error);
    throw error;
  }
}

/* *************************
 *  Update Account Information
 * ************************* */
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql = `
      UPDATE public.account
      SET account_firstname = $2,
          account_lastname = $3,
          account_email = $4
      WHERE account_id = $1
      RETURNING *;
    `;
    const result = await pool.query(sql, [
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("updateAccount error", error);
    throw error;
  }
}

/* *************************
 *  Change or Update Password Information
 * ************************* */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
    UPDATE public.account
    SET account_password = $1
    WHERE account_id = $2
    RETURNING *; 
  `;

    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("updatePassword error.", error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  checkAccount,
  getAccountByEmail,
  updateAccount,
  updatePassword,
};
