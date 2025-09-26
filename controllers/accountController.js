const utilities = require("../utilities/");
const accountController = {};
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
/**
 * Build the Login view
 */

accountController.buildLogin = async function (req, res) {
  let nav = await utilities.getNav();
  // assign values to res.locals
  // res.locals.account_email = "";
  // Assign the email back to the view if it exists
  res.locals.account_email = req.body ? req.body.account_email : "";
  // let login = await utilities.buildLoginForm();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: res.locals.account_email || "", // default to empty string
  });
};

// Build the Registration view

accountController.buildRegister = async function (req, res) {
  let nav = await utilities.getNav();

  // let register = await utilities.buildRegisterForm();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: res.locals.account_firstname || "",
    account_lastname: res.locals.account_lastname || "",
    account_email: res.locals.account_email || "",
  });
};

// Process Registration request

accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you are registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: account_email,
      });
    } else {
      req.flash("notice", " Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    console.error("Error registering account: ", error);
    req.flash("notice", " Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

// Process Login request

accountController.loginAccount = async function (req, res) {
  try {
    const { account_email, account_password } = req.body;

    console.log("Login attempt body:", req.body);

    if (!account_email || !account_password) {
      return res.status(400).send("Email and password are required.");
    }

    const account = await accountModel.checkAccount(
      account_email,
      account_password
    );

    if (!account) {
      console.log("Authentication failed for:", account_email);
    }

    let nav = await utilities.getNav();

    if (account) {
      console.log("Account found:", account);
      req.session.account = account;
      // Successful login
      console.log("Login successful for:", account.account_email); // Here?
      return res.redirect("/");
    } else {
      // Failed login
      console.log("Account not found:", account);
      console.log("Login failed for:", account_email);
      req.flash("notice", "Please check your credentials and try again.");
      res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    let nav = await utilities.getNav();
    req.flash("notice", "An error occurred during login. Try again.");
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: req.body?.account_email || "",
    });
  }
};

module.exports = accountController;
