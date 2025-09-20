const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ************************
 * Build the classification view
 * ************************ */
invCont.buildByClassification = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  console.log(data);

  if (!data.rows || data.rows.length === 0) {
    let err = new Error("No vehicles found for the selected classification.");
    err.status = 404;
    return next(err);
  }

  const grid = await utilities.buildClassificationGrid(data.rows);
  console.log(grid);
  let nav = await utilities.getNav();
  const className = data.rows[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ************************
 * Build the vehicle detail view
 * ************************ */
invCont.buildByInvID = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInvItemByID(inv_id);
  console.log(data);

  if (!data.rows || data.rows.length === 0) {
    let err = new Error("Vehicle not found.");
    err.status = 404;
    return next(err);
  }

  const detail = await utilities.buildVehicleDetail(data.rows);
  console.log(detail);
  let nav = await utilities.getNav();
  const item = data.rows[0];
  res.render("inventory/detail", {
    title: item.inv_year + " " + item.inv_make + " " + item.inv_model,
    nav,
    item,
    detail,
  });
};

/**
 * Deliberately cause a 500 server error for testing purposes.
 */
invCont.throw500 = async (req, res, next) => {
  res.status(500);
  next(new Error("Intentional server error."));   
};



module.exports = invCont;
