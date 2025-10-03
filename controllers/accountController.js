const utilities = require("../utilities/");
const accountController = {};
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    // Password is already trimmed by validation middleware
    hashedPassword = bcrypt.hashSync(account_password, 10);

    console.log("Raw password:", `"${account_password}"`);
    console.log("Hashed password stored:", hashedPassword);
    console.log(
      "Password chars:",
      [...account_password].map((c) => c.charCodeAt(0))
    );
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

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  console.log("Fetched accountData:", accountData);
  console.log("Entered password:", account_password);
  console.log(
    "Password chars:",
    [...account_password].map((c) => c.charCodeAt(0))
  );

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }

  // Password is already trimmed by validation middleware
  // DEBUG: quick sync check with password
  if (bcrypt.compareSync(account_password, accountData.account_password)) {
    console.log("Password match!");
  } else {
    console.log("Password mismatch!");
  }
  try {
    console.log(
      "Password type:",
      typeof account_password,
      "length:",
      account_password.length
    );
    console.log(
      "Hashed type:",
      typeof accountData.account_password,
      "length:",
      accountData.account_password.length
    );

    // Password is already trimmed by validation middleware
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
};

/* ****************************************
 *  Build the Account Management View
 * ************************************ */

accountController.buildAccountManagement = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash(),
  });
};

module.exports = accountController;
