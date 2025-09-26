const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* ************************
 * Constructs an HTML grid of vehicle data to be provided to the inventory view
 ************************** */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid +=
      '<p class="notice"> Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/**
 * ****************************************
 * Builds the Vehicle Detail View
 * ****************************************
 */

Util.buildVehicleDetail = async function (data) {
  let detail = "";
  if (data.length > 0) {
    detail = '<div id="inv-detail">';
    data.forEach((vehicle) => {
      detail += '<div class="vehicle-image">';
      detail +=
        '<img src="' +
        vehicle.inv_image +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" />';
      detail += "</div>";
      detail += '<div class="vehicle-details">';
      detail += "<h2>";
      detail +=
        vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model;
      detail += "</h2>";
      detail +=
        "<p>Price:</p>" +
        "<h3>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</h3>";
      detail += "<p>" + "Description: " + vehicle.inv_description + "</p>";
      detail += "<p>" + "Color: " + vehicle.inv_color + "</p>";
      detail +=
        "<p>Miles: " +
        new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
        "</p>";
      detail += "</div>";
    });
    detail += "</div>";
  } else {
    detail += '<p class="notice"> Sorry, no matchin vehicle was found.</p>';
  }
  return detail;
};

/***********************************
 * Build the login form
 ********************************** */

// Util.buildLoginForm = async function (req, res, next) {
//   let login = "";
//   login += '<div class="form-wrapper">';
//   login += '<form class="login" method="POST" action="/account/login">';
//   login += "<h2>Account Login</h2>";
//   login += '<div class="form-group">';
//   login += '<label for="account_email">Email address</label>';
//   login +=
//     '<input type="email" class="form-control" id="account_email" name="account_email" placeholder="Enter email" required pattern="^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*s).{12,}$" title="Email must be a valid email address">';
//   login += "</div>";
//   login += '<div class="form-group">';
//   login += '<label for="account_password">Password</label>';
//   login +=
//     '<input type="password" class="form-control" id="account_password" name="account_password" placeholder="Password" required>';
//   login +=
//     "<small>Password must be at least 12 characters and contain at least 1 uppercase letter, 1 number, and 1 special character</small>";
//   login += "</div>";
//   login += '<button type="submit" class="btn-submit">Login</button>';
//   login +=
//     '<p class="noaccount">No account? <a href="/account/register" id="register">Sign-up</a></p>';
//   login += "</form>";
//   login += "</div>";
//   return login;
// };

/***********************************
 * Build the registration form
 ********************************** */

// Util.buildRegisterForm = async function (req, res, next) {
//   let register = "";
//   register += '<div class="form-wrapper">';
//   register +=
//     '<form class="signmeup" method="POST" action="/account/register">';
//   register += "<h2>Account Registration</h2>";
//   register += '<div class="form-group">';
//   register += '<label for="account_firstname">First Name</label>';
//   register +=
//     '<input type="text" class="form-control" id="account_firstname" name="account_firstname" placeholder="Enter first name" required value="<%= locals.account_firstname %>">';
//   register += '<label for="account_lastname">Last Name</label>';
//   register +=
//     '<input type="text" class="form-control" id="account_lastname" name="account_lastname" placeholder="Enter last name" required value="<%= locals.account_lastname %>">';
//   register += '<label for="account_email">Email address</label>';
//   register +=
//     '<input type="email" class="form-control" id="account_email" name ="account_email" placeholder="Enter email" required value="<%= locals.account_email %>">';
//   register += '<label for="account_password">Password</label>';
//   register +=
//     '<input type="password" class="form-control" id="account_password" name="account_password" placeholder="password" required pattern="^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*s).{12,}$" title="Password must be at least 12 characters and contain at least 1 uppercase letter, 1 number, and 1 special character">';
//   register +=
//     '<button type="btn-password" class="btn-password">Show Password</button>';
//   register +=
//     "<small>Password must be at least 12 characters and contain at least 1 uppercase letter, 1 number, and 1 special character</small>";
//   register += "</div>";
//   register += '<button type="submit" class="btn-submit">Register</button>';
//   register += "</form>";
//   register += "</div>";
//   return register;
// };

/**
 * ****************************************
 * Build the Add Classification View
 * ****************************************
 */

Util.buildAddClassification = async function (req, res, next) {
  let addClassification = "";
  addClassification += '<div class="form-wrapper">';
  addClassification +=
    '<form class="new-classification" method="POST" action="/inv/addClassification">';
  addClassification += "<h2>Add New Classification</h2>";
  addClassification += '<div class="form-group">';
  addClassification += "<hr />";
  addClassification += '<p class="warnings">Field is required.</p>';
  addClassification +=
    '<label for="classification_name">Classification Name</label>';
  addClassification +=
    '<span id="alphanumeric">Name must be alphabetic characters only.</span>';
  addClassification +=
    '<input type="text" class="form-control" id="classification_name" name="classification_name" placeholder="Enter classification name" required pattern="^([A-Za-z]+\\s)*[A-Za-z]+$" title="Classification name must be alphabetic characters only." value="' +
    (res.locals.classification_name ? res.locals.classification_name : "") +
    '">';
  addClassification += "</div>";
  addClassification +=
    '<button type="submit" class="btn-submit">Add Classification</button>';
  addClassification += "</form>";
  addClassification += "</div>";
  return addClassification;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
