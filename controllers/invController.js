const utilities = require("../utilities/");
const invCont = {};
const invModel = require("../models/inventory-model");

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
 * Build the inventory management view
 */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    management: "",
  });
};

/**
 * Build the add classification view
 */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    // Generate the form HTML
    const formHTML = await utilities.buildAddClassification(req, res);

    res.render("inventory/addClassification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: req.body?.classification_name || "",
      addClassification: formHTML,
    });
  } catch (error) {
    console.error("Error building add classification view: ", error);
    next(error);
  }
};

// Process new classification form submission
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const regResult = await invModel.addClassification(classification_name);

    if (regResult) {
      req.flash("notice", `New classification added: ${classification_name}`);
      return res.redirect("/inv");
    } else {
      // Rebuild nav and formHTML for re-rendering the page
      let nav = await utilities.getNav();
      const formHTML = await utilities.buildAddClassification(req, res);

      req.flash("notice", "Sorry, adding the classification failed.");
      return res.status(501).render("inventory/addClassification", {
        title: "Add Classification",
        nav,
        errors: null,
        classification_name,
        addClassification: formHTML,
      });
    }
  } catch (error) {
    console.error("Error adding new classification: ", error);
    // Rebuild nav and formHTML for re-rendering the page
    let nav = await utilities.getNav();
    const formHTML = await utilities.buildAddClassification(req, res);
    req.flash("notice", "Sorry, adding the classification failed.");
    res.status(501).render("inventory/addClassification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: req.body?.classification_name || "",
      addClassification: formHTML,
    });
  }
};

/**
 * Build the add inventory view
 */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();

    // Generate the form HTML
    const formHTML = await utilities.buildAddInventory(req, res);

    res.render("inventory/addInventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      inv_make: req.body?.inv_make || "",
      addInventory: formHTML,
    });
  } catch (error) {
    console.error("Error building add inventory view: ", error);
    next(error);
  }
};

/**
 * Deliberately cause a 500 server error for testing purposes.
 */
invCont.throw500 = async (req, res, next) => {
  res.status(500);
  next(new Error("Intentional server error."));
};

module.exports = invCont;
