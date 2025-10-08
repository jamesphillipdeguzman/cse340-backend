const utilities = require(".");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/********************************
 * Login Data Validation Rules
 * *******************************/
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("An email is required.")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .bail()
      .normalizeEmail(), // refer to validator.js docs
    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A password is required."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  res.locals.account_email = account_email || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email: res.locals.account_email || "", // default to empty string
    });
    return;
  }
  next();
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters."),

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("An email is required.")
      .bail()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .bail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error(
            "Email exists. Please log in or use a different email."
          );
        }
      })
      .normalizeEmail(), // refer to validator.js docs

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A password is required.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body || {};
  // let errors = [];
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check update data and return errors or continue to account update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_email, account_firstname, account_lastname, account_id } =
    req.body;
  let errors = [];
  errors = validationResult(req);
  res.locals.account_email = account_email || "";
  res.locals.account_firstname = account_firstname || "";
  res.locals.account_lastname = account_lastname || "";
  res.locals.account_id = account_id || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Account Update",
      nav,
      errors: errors.array(),
      account_email: res.locals.account_email || "", // default to empty string
      account_firstname: res.locals.account_firstname || "",
      account_lastname: res.locals.account_lastname || "",
      account_id: res.locals.account_id || "",
    });
    return;
  }
  next();
};

/*  **********************************
 *  Account Update Validation Rules
 * ********************************* */
validate.accountUpdateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters."),

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .bail()
      .custom(async (account_email, { req }) => {
        // Allow the same email the user already has
        const currentId = req.body.account_id;
        // Returns count
        const existingCount = await accountModel.checkExistingEmail(
          account_email
        );
        if (!existingCount) {
          return true;
        }
        // If email exists, ensure it belongs to the same user
        const existingAccount = await accountModel.getAccountByEmail(
          account_email
        );
        if (
          existingAccount &&
          String(existingAccount.account_id) === String(currentId)
        ) {
          return true;
        }
        throw new Error("Email already in use by another account.");
      })
      .normalizeEmail(), // refer to validator.js docs
  ];
};

/* ******************************
 * Check password data and return errors or continue to change password
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password, account_id } = req.body;

  errors = validationResult(req);
  res.locals.account_password = account_password || "";
  res.locals.account_id = account_id || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Change Password",
      nav,
      errors: errors.array(),
      account_password: res.locals.account_password || "",
      account_id: res.locals.account_id || "",
      // Best-effort fill from session so the update form has values
      account_firstname: req.session?.account_firstname || "",
      account_lastname: req.session?.account_lastname || "",
      account_email: req.session?.account_email || "",
    });
    return;
  }
  next();
};
/*  **********************************
 *  Change Password Validation Rules
 * ********************************* */
validate.accountPasswordRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A password is required.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

module.exports = validate;
