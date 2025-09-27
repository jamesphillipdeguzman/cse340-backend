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

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10);

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
      hashedPassword,
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

module.exports = { registerAccount, checkExistingEmail, checkAccount };
