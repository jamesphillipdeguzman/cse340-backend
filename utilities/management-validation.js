const utilities = require("../utilities/");
const inventoryModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
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
      .withMessage("Please provide a classification name.") // on error this messag is sent.
      .isLength({ min: 2 })
      .withMessage("Classification name must be at least 2 characters.")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Classification name must be alphabetic characters only."),
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

module.exports = validate;
