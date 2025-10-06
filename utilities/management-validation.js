const utilities = require("../utilities/");
const inventoryModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const { editInventoryView } = require("../controllers/invController");
const validate = {};

/********************************
 * New Classification Data Validation Rules
 * *******************************/
validate.newClassificationRules = () => {
  return [
    // classification name is required and must be alphabetic characters only
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .customSanitizer((value) =>
        value
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      )
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Classification name must be at least 2 characters.")
      .bail()
      .matches(/^[A-Za-z\s-]+$/)
      .withMessage("Provide a correct classification name."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkNewClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  res.locals.classification_name = classification_name || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Generate the form HTML
    const formHTML = await utilities.buildAddClassification(req, res);
    res.render("inventory/addClassification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: res.locals.classification_name || "",
      addClassification: formHTML,
    });
    return;
  }

  next();
};

/********************************
 * New Inventory Data Validation Rules
 * *******************************/
validate.newInventoryRules = () => {
  return [
    // inv_make is required and must be alphabetic characters only
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a make.")
      .customSanitizer((value) =>
        value
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      )
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters.")
      .bail()
      .matches(/^[A-Za-z0-9\s-]+$/)
      .withMessage("Provide a correct make."),
    // inv_model is required and must be alphabetic characters only
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a model.")
      .customSanitizer((value) =>
        value
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      )
      .bail() // on error this message is sent.
      .isLength({ min: 2 })
      .withMessage("Model must be at least 2 characters.")
      .bail()
      .matches(/^[A-Za-z0-9\s-]+$/)
      .withMessage("Provide a correct model."),
    // inv_description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description.")
      .bail() // on error this message is sent.
      .isLength({ min: 7 })
      .withMessage("Description must be at least 7 characters."),
    // inv_image is required
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an image."),

    // inv_thumbnail is required
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a thumbnail."),

    // price must be non-negative
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a price.")
      .bail()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid non-negative number")
      .bail(),

    // year must be from 1900 to 2099
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a year")
      .bail()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be between 1900 and 2099.")
      .bail(),

    // mileage must be a valid integer (e.g., no commas or decimals)
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide mileage.")
      .bail()
      .matches(/^\d+$/)
      .withMessage(
        "Mileage must be a whole number without commas or decimals."
      ),

    // color must be non-integer
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a color.")
      .bail()
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters.")
      .bail()
      .matches(/^[A-Za-z]+$/)
      .withMessage("Color must contain alphabetic characters only."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkNewInventoryData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  res.locals.inv_make = inv_make || "";
  res.locals.inv_model = inv_model || "";
  res.locals.inv_description = inv_description || "";
  res.locals.inv_image = inv_image || "";
  res.locals.inv_thumbnail = inv_thumbnail || "";
  res.locals.inv_price = inv_price || "";
  res.locals.inv_year = inv_year || "";
  res.locals.inv_miles = inv_miles || "";
  res.locals.inv_color = inv_color || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Generate the form HTML
    const formHTML = await utilities.buildAddInventory(req, res);
    res.render("inventory/addInventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
      inv_make: res.locals.inv_make || "",
      inv_model: res.locals.inv_model || "",
      inv_description: res.locals.inv_description || "",
      inv_image: res.locals.inv_image || "",
      inv_thumbnail: res.locals.inv_thumbnail || "",
      inv_price: res.locals.inv_price || "",
      inv_year: res.locals.inv_year || "",
      inv_miles: res.locals.inv_miles || "",
      inv_color: res.locals.inv_color || "",
      addInventory: formHTML,
    });
    return;
  }

  next();
};

/* ******************************
 * Update data and return errors or continue to edit inventory
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
    inv_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  res.locals.inv_make = inv_make || "";
  res.locals.inv_model = inv_model || "";
  res.locals.inv_description = inv_description || "";
  res.locals.inv_image = inv_image || "";
  res.locals.inv_thumbnail = inv_thumbnail || "";
  res.locals.inv_price = inv_price || "";
  res.locals.inv_year = inv_year || "";
  res.locals.inv_miles = inv_miles || "";
  res.locals.inv_color = inv_color || "";
  res.locals.classification_id = classification_id || "";
  res.locals.inv_id = inv_id || "";
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Generate the form HTML
    const formHTML = await utilities.buildEditInventory(req, res);
    res.render("inventory/editInventory", {
      title: "Edit Inventory",
      nav,
      errors: errors.array(),
      inv_make: res.locals.inv_make || "",
      inv_model: res.locals.inv_model || "",
      inv_description: res.locals.inv_description || "",
      inv_image: res.locals.inv_image || "",
      inv_thumbnail: res.locals.inv_thumbnail || "",
      inv_price: res.locals.inv_price || "",
      inv_year: res.locals.inv_year || "",
      inv_miles: res.locals.inv_miles || "",
      inv_color: res.locals.inv_color || "",
      classification_id: res.locals.classification_id || "",
      inv_id: res.locals.inv_id || "",
      editInventory: formHTML,
    });
    return;
  }

  next();
};

module.exports = validate;
