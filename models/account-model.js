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

    // Password is already hashed in the controller
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
      account_password, // This is already hashed from the controller
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

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail };
