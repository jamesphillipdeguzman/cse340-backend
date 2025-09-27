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
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
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

module.exports = validate;
