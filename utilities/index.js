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
    '<form class="new-classification" method="POST" action="/inv/add-classification">';
  addClassification += "<h2>Add New Classification</h2>";
  addClassification += '<div class="form-group">';
  addClassification += "<hr />";
  addClassification += '<p class="warnings">Field is required.</p>';
  addClassification +=
    '<label for="classification_name">Classification Name</label>';
  addClassification +=
    '<span id="alphanumeric">Name must be alphabetic characters only.</span>';
  addClassification +=
    '<input type="text" class="form-control" id="classification_name" name="classification_name" placeholder="Enter classification name" required pattern="^[A-Za-z]+$" title="Classification name must be alphabetic characters only." value="' +
    (res.locals.classification_name ? res.locals.classification_name : "") +
    '">';
  addClassification += "</div>";
  addClassification +=
    '<button type="submit" class="btn-submit">Add Classification</button>';
  addClassification += "</form>";
  addClassification += "</div>";
  return addClassification;
};

/**
 * ****************************************
 * Build the Add Inventory View
 * ****************************************
 */

Util.buildAddInventory = async function (req, res, next) {
  let addInventory = "";
  addInventory += '<div class="form-wrapper">';
  addInventory +=
    '<form class="new-inventory" method="POST" action="/inv/add-inventory">';
  addInventory += "<h2>Add New Inventory</h2>";
  addInventory += '<div class="form-group">';
  addInventory += "<hr />";
  addInventory += '<p class="warnings">All fields are required.</p>';

  // Replace text input with dropdown for classifications
  addInventory += '<label for="classification_id">Classification</label>';
  addInventory +=
    '<select id="classification_id" name="classification_id" required title="Classification">';
  addInventory += '<option value="">-- Select Classification --</option>';

  // Fetch classifications from DB
  const data = await invModel.getClassifications();

  data.rows.forEach((row) => {
    const selected =
      res.locals.classification_id == row.classification_id ? "selected" : "";
    addInventory += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
  });
  addInventory += "</select>";

  // Add the rest of the inventory fields here...
  // Make
  addInventory += '<label for="inv_make">Make</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_make" name="inv_make" placeholder="Min of 2 characters" ' +
    'required pattern="^[A-Za-z ]+$" minlength="2" ' +
    'title= "Make" value="' +
    (res.locals.inv_make ? res.locals.inv_make : "") +
    '">';
  // Model
  addInventory += '<label for="inv_model">Model</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_model" name="inv_model" placeholder="Min of 2 characters" ' +
    'required pattern="^[A-Za-z ]+$" minlength="2" ' +
    'title= "Model" value="' +
    (res.locals.inv_model ? res.locals.inv_model : "") +
    '">';
  // Description
  addInventory += '<label for="inv_description">Description</label>';
  addInventory +=
    '<textarea id="inv_description" name="inv_description" ' +
    'rows="4" cols="30" placeholder="Enter a description" ' +
    'required title= "Description">' +
    (res.locals.inv_description ? res.locals.inv_description : "") +
    "</textarea>";
  // Image Path
  addInventory += '<label for="inv_image">Image Path</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_image" name="inv_image" placeholder="/images/vehicles/no-image.png" required title="Image Path" value="' +
    (res.locals.inv_image ? res.locals.inv_image : "") +
    '">';
  // Thumbnail Path
  addInventory += '<label for="inv_thumbnail">Thumbnail Path</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_thumbnail" name="inv_thumbnail" placeholder="/images/vehicles/no-image.png" required title="Thumbnail Path" value="' +
    (res.locals.inv_thumbnail ? res.locals.inv_thumbnail : "") +
    '">';
  // Price
  addInventory += '<label for="inv_price">Price</label>';
  addInventory +=
    '<input type="number" class="form-control" id="inv_price" name="inv_price" placeholder="Enter price (e.g., 99.99)" required title="Price" min="0" step="0.01" value="' +
    (res.locals.inv_price ? res.locals.inv_price : "") +
    '">';
  // Year
  addInventory += '<label for="inv_year">Year</label>';
  addInventory +=
    '<input type="number" class="form-control" id="inv_year" name="inv_year" placeholder="Enter year (e.g., 2025)" required title="Year" min="1900" max="2099" value="' +
    (res.locals.inv_year ? res.locals.inv_year : "") +
    '">';
  // Miles
  addInventory += '<label for="inv_miles">Miles</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_miles" name="inv_miles" placeholder="Enter miles (e.g., 3000)" required ' +
    'pattern="^\\d+$" ' +
    'title="Miles" value="' +
    (res.locals.inv_miles ? res.locals.inv_miles : "") +
    '">';
  // Color
  addInventory += '<label for="inv_color">Color</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_color" name="inv_color" placeholder="Enter color (e.g., red)" ' +
    'required pattern="^[A-Za-z ]+$" minlength="2" ' +
    'title= "Color must be alphabetic characters only." value="' +
    (res.locals.inv_color ? res.locals.inv_color : "") +
    '">';

  addInventory += "</div>";
  addInventory +=
    '<button type="submit" class="btn-submit">Add Vehicle</button>';
  addInventory += "</form>";
  addInventory += "</div>";
  return addInventory;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
