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

  const grid = await utilities.buildClassificationList(data.rows);
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
  const classificationSelect = await utilities.buildClassificationList(); // used to be buildClassificationGrid
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    management: "",
    classificationSelect,
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
    const classifications = await invModel.getClassifications(); // fetch the list

    // Generate the form HTML
    const formHTML = await utilities.buildAddInventory(req, res);

    res.render("inventory/addInventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classifications: classifications.rows, // pass to view
      inv_make: req.body?.inv_make || "",
      addInventory: formHTML,
    });
  } catch (error) {
    console.error("Error building add inventory view: ", error);
    next(error);
  }
};

/**
 * Process new inventory submission
 */

invCont.addInventory = async function (req, res, next) {
  try {
    console.log("REQ BODY:", req.body);
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    // Call model and insert to DB
    const regResult = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });

    if (regResult) {
      req.flash(
        "notice",
        `New inventory item added: ${inv_year} ${inv_make} ${inv_model}`
      );
      return res.redirect("/inv");
    } else {
      let nav = await utilities.getNav();
      const formHTML = await utilities.buildAddInventory(req, res);

      req.flash("notice", "Sorry, adding the inventory failed.");
      return res.status(501).render("inventory/addInventory", {
        title: "Add Inventory",
        nav,
        errors: null,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        addInventory: formHTML,
      });
    }
  } catch (error) {
    console.error("Error adding new inventory: ", error);
    let nav = await utilities.getNav();
    const formHTML = await utilities.buildAddInventory(req, res);

    req.flash("notice", "Sorry, adding the inventory failed.");
    return res.status(501).render("inventory/addInventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      inv_make: req.body?.inv_make || "",
      inv_model: req.body?.inv_model || "",
      inv_year: req.body?.inv_year || "",
      inv_description: req.body?.inv_description || "",
      inv_image: req.body?.inv_image || "",
      inv_thumbnail: req.body?.inv_thumbnail || "",
      inv_price: req.body?.inv_price || "",
      inv_miles: req.body?.inv_miles || "",
      inv_color: req.body?.inv_color || "",
      classification_id: req.body?.classification_id || "",
      addInventory: formHTML,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
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
