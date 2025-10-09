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

  if (!data || data.length === 0) {
    let err = new Error("No vehicles found for the selected classification.");
    err.status = 404;
    return next(err);
  }

  const grid = await utilities.buildClassificationGrid(data);
  console.log(grid);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
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
  const inv_id = parseInt(req.params.invId, 10); // ensure it's a number
  console.log("Requested inv_id:", inv_id);
  const data = await invModel.getInventoryById(inv_id);
  console.log("Query result:", data);

  if (!data || data.length === 0 || !data[0]) {
    let err = new Error("Vehicle not found.");
    err.status = 404;
    return next(err);
  }

  const detail = await utilities.buildVehicleDetail(data);
  console.log(detail);
  let nav = await utilities.getNav();
  const item = data[0];
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
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    management: "",
    classificationSelect,
  });
};
//TODO: Create a buildRemoveClassification here...

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
  if (invData && invData.length > 0) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Return All Classifications As JSON
 * ************************** */
invCont.getAllClassificationsJSON = async (req, res, next) => {
  try {
    const classifications = await invModel.getAllClassifications();
    if (classifications && classifications.length > 0) {
      return res.json(classifications);
    } else {
      return res.status(404).json({ error: "No classifications found. " });
    }
  } catch (error) {
    console.error("Error fetching classifications.", error);
    return next(error);
  }
};

/**
 * Update all classification
 */

invCont.updateClassification = async function (req, res, next) {
  try {
    const classificationId = parseInt(req.params.classification_id);
    const { classification_name } = req.body;

    if (!classification_name || isNaN(classificationId)) {
      req.flash("notice", "Invalid classification data.");
      return res.redirect("/inv");
    }

    const result = await invModel.updateClassification(
      classificationId,
      classification_name
    );
    if (result) {
      req.flash(
        "notice",
        `Classification updated: ${result.classification_name}`
      );
    } else {
      req.flash("notice", "Classification not found or update failed.");
    }
    return res.redirect("/inv");
  } catch (error) {
    console.error("Error updating classification.", error);
    req.flash(
      "notice",
      "Sorry, something went wrong updating the classification."
    );
    return res.redirect("/inv");
  }
};

/**
 * Delete a classification
 */

invCont.deleteClassification = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id, 10);

    if (!classification_id) {
      req.flash("notice", "Classification ID not provided.");
      return res.redirect("/inv");
    }

    const classData = await invModel.getClassificationById(classification_id);

    if (!classData) {
      req.flash("notice", "Classification not found.");
      return res.redirect("/inv");
    }

    // Check if there are still inventory items under this classification
    const inventoryItems = await invModel.getInventoryByClassificationId(
      classification_id
    );
    if (inventoryItems && inventoryItems.length > 0) {
      req.flash(
        "notice",
        `Cannot delete "${classData.classification_name}" because it still has
        ${inventoryItems.length} vehicle(s).`
      );
      return res.redirect("/inv");
    }

    const deleteResult = await invModel.deleteClassification(classification_id);

    if (deleteResult) {
      req.flash(
        "notice",
        `The ${classData.classification_name} was successfully deleted.`
      );
    } else {
      req.flash("notice", `Deleting classification failed.`);
    }

    return res.redirect("/inv");
  } catch (error) {
    console.error("Error deleting classification: ", error);
    req.flash(
      "notice",
      "An error occurred while deleting the classification item."
    );
    return res.redirect("/inv");
  }
};

/**
 * Edit Inventory View
 */

invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    if (isNaN(inv_id)) {
      req.flash("warnings", "Invalid inventory ID.");
      return res.redirect("/inv");
    }

    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData || itemData.length === 0) {
      req.flash("notice", "Sorry, we could not find that inventory item.");
      return res.redirect("/inv");
    }

    const item = itemData[0]; // Get first item from array

    // Build the dropdown and selected classification here..
    const classificationSelect = await utilities.buildClassificationList(
      item.classification_id
    );

    // Set res.locals with the inventory data for the form
    res.locals.inv_id = item.inv_id;
    res.locals.inv_make = item.inv_make;
    res.locals.inv_model = item.inv_model;
    res.locals.inv_year = item.inv_year;
    res.locals.inv_description = item.inv_description;
    res.locals.inv_image = item.inv_image;
    res.locals.inv_thumbnail = item.inv_thumbnail;
    res.locals.inv_price = item.inv_price;
    res.locals.inv_miles = item.inv_miles;
    res.locals.inv_color = item.inv_color;
    res.locals.classification_id = item.classification_id;

    const formHTML = await utilities.buildEditInventory(req, res);
    const itemName = `${item.inv_make} ${item.inv_model}`;
    res.render("inventory/editInventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_description: item.inv_description,
      inv_image: item.inv_image,
      inv_thumbnail: item.inv_thumbnail,
      inv_price: item.inv_price,
      inv_miles: item.inv_miles,
      inv_color: item.inv_color,
      classification_id: item.classification_id,
      editInventory: formHTML,
    });
  } catch (error) {
    console.error("Failed to build inventory view", error);
    next(error);
  }
};

/**
 * Update Inventory Data
 */

invCont.updateInventory = async function (req, res, next) {
  console.log("REQ BODY:", req.body);

  const {
    inv_id,
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
  const itemName = `${inv_year} ${inv_make} ${inv_model}`.trim();
  try {
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData || itemData.length === 0) {
      req.flash("notice", "Sorry, we could not find that inventory item.");
      return res.redirect("/inv");
    }

    const item = itemData[0]; // Get first item from array

    // Build the dropdown and selected classification here..
    const classificationSelect = await utilities.buildClassificationList(
      item.classification_id
    );

    // Set res.locals with the inventory data for the form
    res.locals.inv_id = item.inv_id;
    res.locals.inv_make = item.inv_make;
    res.locals.inv_model = item.inv_model;
    res.locals.inv_year = item.inv_year;
    res.locals.inv_description = item.inv_description;
    res.locals.inv_image = item.inv_image;
    res.locals.inv_thumbnail = item.inv_thumbnail;
    res.locals.inv_price = item.inv_price;
    res.locals.inv_miles = item.inv_miles;
    res.locals.inv_color = item.inv_color;
    res.locals.classification_id = item.classification_id;

    const formHTML = await utilities.buildEditInventory(req, res);

    // Validate required fields
    if (
      !inv_make ||
      !inv_model ||
      !inv_year ||
      !inv_description ||
      !inv_image ||
      !inv_thumbnail ||
      !inv_price ||
      !inv_miles ||
      !inv_color
    ) {
      req.flash("notice", "Sorry, you'll need to provide all required info.");
      return res.status(400).render("inventory/editInventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        // Use submitted values for stickiness:
        inv_id,
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
        editInventory: formHTML,
      });
    }

    // Attempt to update the inventory
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );

    console.log("Update result:", updateResult);

    // Handle success/failure
    if (updateResult) {
      // req.session.flash = {};
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Sorry, updating the inventory failed.");
      return res.status(501).render("inventory/editInventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: item.inv_id,
        inv_make: item.inv_make,
        inv_model: item.inv_model,
        inv_year: item.inv_year,
        inv_description: item.inv_description,
        inv_image: item.inv_image,
        inv_thumbnail: item.inv_thumbnail,
        inv_price: item.inv_price,
        inv_miles: item.inv_miles,
        inv_color: item.inv_color,
        classification_id: item.classification_id,
        editInventory: formHTML,
      });
    }
  } catch (error) {
    console.error("Error updating inventory: ", error);
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(
      classification_id || ""
    );

    const formHTML = await utilities.buildEditInventory(req, res);

    req.flash("notice", "Sorry, updating the inventory failed.");
    return res.status(500).render("inventory/editInventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: inv_id || "",
      inv_make: inv_make || "",
      inv_model: inv_model || "",
      inv_year: inv_year || "",
      inv_description: inv_description || "",
      inv_image: inv_image || "",
      inv_thumbnail: inv_thumbnail || "",
      inv_price: inv_price || "",
      inv_miles: inv_miles || "",
      inv_color: inv_color || "",
      classification_id: classification_id || "",
      editInventory: formHTML,
    });
  }
};
/**
 * Build Delete Confirmation View
 */
invCont.deleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (!inv_id) {
      req.flash("notice", "Inventory ID not provided.");
      return res.redirect("/inv");
    }

    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData || itemData.length === 0) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv");
    }

    const item = itemData[0];
    const itemName =
      `${item.inv_year} ${item.inv_make} ${item.inv_model}`.trim();
    let nav = await utilities.getNav();

    // Set res.locals with inventory details for formHTML
    res.locals.inv_id = item.inv_id;
    res.locals.inv_make = item.inv_make;
    res.locals.inv_model = item.inv_model;
    res.locals.inv_year = item.inv_year;
    res.locals.inv_price = item.inv_price;

    // Build formHTML for delete confirmation
    const formHTML = await utilities.buildDeleteConfirmation(req, res);

    res.render("inventory/deleteConfirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_price: item.inv_price,
      itemName,
      deleteConfirm: formHTML,
    });
  } catch (error) {
    console.error("Error building delete confirmation view.", error);
    next(error);
  }
};

/**
 * Delete Inventory Data
 */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10);
    if (!inv_id) {
      req.flash("notice", "Inventory ID not provided.");
      return res.redirect("/inv");
    }

    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData || itemData.length === 0) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv");
    }

    const item = itemData[0];
    const itemName =
      `${item.inv_year} ${item.inv_make} ${item.inv_model}`.trim();

    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult) {
      req.flash("notice", `The ${itemName} was successfully deleted.`);
    } else {
      req.flash("notice", `Deleting ${itemName} failed.`);
    }

    return res.redirect("/inv");
  } catch (error) {
    console.error("Error deleting inventory: ", error);
    req.flash("notice", "An error occurred while deleting the inventory item.");
    return res.redirect("/inv");
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
