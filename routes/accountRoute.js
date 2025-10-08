// Needed resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const validate = require("../utilities/account-validation");
const verifyJWT = require("../middleware/verifyJWT");
const authorizeAccountType = require("../middleware/authorizeAccountType");

//  Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route for verifying Employee or Admin
router.get(
  "/update",
  verifyJWT,
  authorizeAccountType("Admin", "Employee", "Client"),
  utilities.handleErrors(accountController.buildEditAccount)
);

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Handle Login form submission
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/logout", utilities.handleErrors(accountController.logout));

// Handle registration form submission
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Process the login attempt
// router.post("/login", (req, res) => {
//   res.status(200).send("login process");
// });

module.exports = router;
