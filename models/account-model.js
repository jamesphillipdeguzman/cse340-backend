const pool = require("../database/");

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
module.exports = { registerAccount };
