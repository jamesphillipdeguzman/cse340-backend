const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
// used to be buildClassificationGrid
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
        vehicle.inv_year +
        " " +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_year +
        " " +
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
    '<input type="text" class="form-control" id="classification_name" name="classification_name" placeholder="Enter classification name" required pattern="^[A-Za-z0-9s-]+$" title="Classification name must be alphabetic characters only." value="' +
    (res.locals.classification_name ? res.locals.classification_name : "") +
    '">';
  addClassification +=
    '<span id="alphanumeric">**Name must be alphabetic characters only.</span>';
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
    'required pattern="^[A-Za-z0-9s-]+$" minlength="2" ' +
    'title= "Make" value="' +
    (res.locals.inv_make ? res.locals.inv_make : "") +
    '">';
  // Model
  addInventory += '<label for="inv_model">Model</label>';
  addInventory +=
    '<input type="text" class="form-control" id="inv_model" name="inv_model" placeholder="Min of 2 characters" ' +
    'required pattern="^[A-Za-z0-9s-]+$" minlength="2" ' +
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

/**
 * ****************************************
 * Build the Edit Inventory View
 * ****************************************
 */

Util.buildEditInventory = async function (req, res, next) {
  let editInventory = "";
  editInventory += '<div class="form-wrapper">';
  editInventory +=
    '<form class="update-inventory" method="POST" action="/inv/update">';
  editInventory += "<h2>Edit Inventory</h2>";
  editInventory += '<div class="form-group">';
  editInventory += "<hr />";
  editInventory += `<input type="hidden" id="inv_id" name="inv_id" value="${res.locals.inv_id || ''}">`;
  // editInventory += '<p class="warnings">All fields are required.</p>';

  // Replace text input with dropdown for classifications
  editInventory += '<label for="classification_id">Classification</label>';
  editInventory +=
    '<select id="classification_id" name="classification_id" required title="Classification">';
  editInventory += '<option value="">-- Select Classification --</option>';

  // Fetch classifications from DB
  const data = await invModel.getClassifications();

  data.rows.forEach((row) => {
    const selected =
      res.locals.classification_id == row.classification_id ? "selected" : "";
    editInventory += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
  });
  editInventory += "</select>";

  // Add the rest of the inventory fields here...
  // Make
  editInventory += '<label for="inv_make">Make</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_make" name="inv_make" placeholder="Min of 2 characters" ' +
    'required pattern="^[A-Za-z0-9s-]+$" minlength="2" ' +
    'title= "Make" value="' +
    (res.locals.inv_make ? res.locals.inv_make : "") +
    '">';
  // Model
  editInventory += '<label for="inv_model">Model</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_model" name="inv_model" placeholder="Min of 2 characters" ' +
    'required pattern="^[A-Za-z0-9s-]+$" minlength="2" ' +
    'title= "Model" value="' +
    (res.locals.inv_model ? res.locals.inv_model : "") +
    '">';
  // Description
  editInventory += '<label for="inv_description">Description</label>';
  editInventory +=
    '<textarea id="inv_description" name="inv_description" ' +
    'rows="4" cols="30" placeholder="Enter a description" ' +
    'required title= "Description">' +
    (res.locals.inv_description ? res.locals.inv_description : "") +
    "</textarea>";
  // Image Path
  editInventory += '<label for="inv_image">Image Path</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_image" name="inv_image" placeholder="/images/vehicles/no-image.png" required title="Image Path" value="' +
    (res.locals.inv_image ? res.locals.inv_image : "") +
    '">';
  // Thumbnail Path
  editInventory += '<label for="inv_thumbnail">Thumbnail Path</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_thumbnail" name="inv_thumbnail" placeholder="/images/vehicles/no-image.png" required title="Thumbnail Path" value="' +
    (res.locals.inv_thumbnail ? res.locals.inv_thumbnail : "") +
    '">';
  // Price
  editInventory += '<label for="inv_price">Price</label>';
  editInventory +=
    '<input type="number" class="form-control" id="inv_price" name="inv_price" placeholder="Enter price (e.g., 99.99)" required title="Price" min="0" step="0.01" value="' +
    (res.locals.inv_price ? res.locals.inv_price : "") +
    '">';
  // Year
  editInventory += '<label for="inv_year">Year</label>';
  editInventory +=
    '<input type="number" class="form-control" id="inv_year" name="inv_year" placeholder="Enter year (e.g., 2025)" required title="Year" min="1900" max="2099" value="' +
    (res.locals.inv_year ? res.locals.inv_year : "") +
    '">';
  // Miles
  editInventory += '<label for="inv_miles">Miles</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_miles" name="inv_miles" placeholder="Enter miles (e.g., 3000)" required ' +
    'pattern="^\\d+$" ' +
    'title="Miles" value="' +
    (res.locals.inv_miles ? res.locals.inv_miles : "") +
    '">';
  // Color
  editInventory += '<label for="inv_color">Color</label>';
  editInventory +=
    '<input type="text" class="form-control" id="inv_color" name="inv_color" placeholder="Enter color (e.g., red)" ' +
    'required pattern="^[A-Za-z ]+$" minlength="2" ' +
    'title= "Color must be alphabetic characters only." value="' +
    (res.locals.inv_color ? res.locals.inv_color : "") +
    '">';

  editInventory += "</div>";
  editInventory +=
    '<button type="submit" class="btn-submit">Edit Vehicle</button>';
  editInventory += "</form>";
  editInventory += "</div>";
  return editInventory;
};

/**
 * ****************************************
 * Build the Classification List
 * ****************************************
 */

Util.buildClassificationList = async function (selectedId) {
  const data = await invModel.getClassifications(); // fetch classifications
  let list = '<select name="classification_id" id="classificationList">';
  list += '<option value="">-- Select Classification -- </option>';
  data.rows.forEach((row) => {
    const selected = selectedId == row.classification_id ? "selected" : "";
    list += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
