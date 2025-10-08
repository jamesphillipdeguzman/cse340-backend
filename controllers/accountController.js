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

/**
 * Build the Edit Account view
 */

accountController.buildEditAccount = async function (req, res) {
  try {
    let nav = await utilities.getNav();

    // Retrieve user info from verified JWT
    const {
      account_email,
      account_firstname,
      account_lastname,
      account_type,
      account_id,
    } = req.user;

    res.render("account/update", {
      title: "Edit Account",
      nav,
      errors: [],
      account_email,
      account_firstname,
      account_lastname,
      account_type,
      account_id,
    });
  } catch (error) {
    console.error("Error building edit account view", error);
    req.flash("notice", "Unable to load account details. Please try again.");
    res.redirect("/account/");
  }
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

      // Process only what I need
      const payload = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      // STORE first name in session
      req.session.account_firstname = accountData.account_firstname;

      // Store last name in session
      req.session.account_lastname = accountData.account_lastname;

      // Store account_type
      req.session.account_type = accountData.account_type;

      // Stor email
      req.session.account_email = accountData.account_email;

      // Save JWT in cookie
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000, // 1 hour
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax",
      };

      res.cookie("jwt", accessToken, cookieOptions);

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
    console.error("Login error.", error);
    req.flash(
      "notice",
      "Login failed due to a server error. Please try again."
    );
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
};

/* ****************************************
 *  Process update account
 * ************************************ */
accountController.updateAccount = async function (req, res) {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  let nav = await utilities.getNav();

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Update session so welcome header reflects latest info immediately
      req.session.account_firstname = updateResult.account_firstname;
      req.session.account_lastname = updateResult.account_lastname;
      req.session.account_email = updateResult.account_email;

      // Refresh JWT so future protected views (e.g., edit page) get fresh data
      try {
        const payload = {
          account_id: updateResult.account_id,
          account_firstname: updateResult.account_firstname,
          account_lastname: updateResult.account_lastname,
          account_email: updateResult.account_email,
          account_type: updateResult.account_type,
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        const cookieOptions = {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: process.env.NODE_ENV !== "development",
          sameSite: "lax",
        };
        res.cookie("jwt", accessToken, cookieOptions);
      } catch (e) {
        console.error("JWT refresh after account update failed", e);
      }

      req.flash("notice", "Account information was successfully updated.");
      res.redirect("/account");
    } else {
      req.flash("notice", "No changes were made.");
      res.status(400).render("account/update", {
        title: "Account Update",
        nav,
        errors: [],
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    console.error("Update account error.", error);
    req.flash("notice", "There was an error updating your account.");
    res.status(500).render("account/update", {
      title: "Account Update",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 *  Process update password
 * ************************************ */
accountController.updatePassword = async function (req, res) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const updatedAccount = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updatedAccount) {
      // No name changes here, but ensure session still has names for welcome
      if (updatedAccount.account_firstname) {
        req.session.account_firstname = updatedAccount.account_firstname;
      }
      if (updatedAccount.account_lastname) {
        req.session.account_lastname = updatedAccount.account_lastname;
      }

      // Refresh JWT so any subsequent protected views have fresh claims
      try {
        const payload = {
          account_id: updatedAccount.account_id,
          account_firstname: updatedAccount.account_firstname || req.session.account_firstname,
          account_lastname: updatedAccount.account_lastname || req.session.account_lastname,
          account_email: updatedAccount.account_email || req.session.account_email,
          account_type: updatedAccount.account_type || req.session.account_type,
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        const cookieOptions = {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: process.env.NODE_ENV !== "development",
          sameSite: "lax",
        };
        res.cookie("jwt", accessToken, cookieOptions);
      } catch (e) {
        console.error("JWT refresh after password update failed", e);
      }

      req.flash("notice", "Password updated successfully.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed. Please try again.");
      res.status(400).render("account/update", {
        title: "Change Password",
        nav,
        errors: [],
        account_id,
      });
    }
  } catch (error) {
    console.error("Password update error.", error);
    req.flash("notice", "Error updating password.");
    res.status(500).render("account/update", {
      title: "Change Password",
      nav,
      errors: [],
      account_id,
    });
  }
};

/* ****************************************
 *  Process Logout Request
 * ************************************ */
accountController.logout = async function (req, res) {
  try {
    // Flash before destroying session
    req.flash("notice", "You've been logged out successfully.");
    // Clear JWT cookie
    res.clearCookie("jwt");
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session", err);
        res.redirect("/"); // redirect to home or login page
      }

      // Explicitly clear cookie too
      res.clearCookie("connect.sid", { path: "/" });
      res.redirect("/"); // redirect to home or login page
    });
  } catch (error) {
    console.error("Logout error", error);
    res.redirect("/");
  }
};

/* ****************************************
 *  Build the Account Management View
 * ************************************ */

accountController.buildAccountManagement = async function (req, res) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      messages: req.flash(),
      account_firstname: req.session.account_firstname, //-- no need to pass account_firstname here since it is globally available now from server.js
      account_lastname: req.session.account_lastname,
      account_type: req.session.account_type,
      account_email: req.session.account_email,
      classificationSelect,
    });
  } catch (error) {
    console.error("Error building account management view", error);
    res.status(500).send("Server error");
  }
};

module.exports = accountController;
