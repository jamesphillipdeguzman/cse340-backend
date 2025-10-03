const pool = require("../database/");

/**
 * Get all classification data
 */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/**
 * Get all inventory items and classification name by classification id
 */

// async function getInventoryByClassificationId(classification_id) {
//   try {
//     const data = await pool.query(
//       `
//             SELECT * FROM public.inventory AS i
//             JOIN public.classification AS c
//             ON i.classification_id = c.classification_id
//             WHERE i.classification_id = $1
//             `,
//       [classification_id]
//     );
//     return data;
//   } catch (error) {
//     console.error("getInventoryByClassificationId error " + error);
//   }
// }
async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      `
      SELECT 
        i.inv_id AS inv_id,
        i.inv_make AS inv_make,
        i.inv_model AS inv_model,
        i.inv_year AS inv_year,
        i.inv_price AS inv_price,
        i.inv_miles AS inv_miles,
        i.inv_color AS inv_color,
        i.inv_image AS inv_image,
        i.inv_thumbnail AS inv_thumbnail,
        i.inv_description AS inv_description,
        c.classification_name AS classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
      `,
      [classification_id]
    );
    return result.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
  }
}

/**
 * Get inventory item by inventory id
 */

async function getInvItemByID(inv_id) {
  try {
    const data = await pool.query(
      ` SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInvItemById error " + error);
  }
}

/**
 * Post a new classification
 */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result;
  } catch (error) {
    console.error("addClassification error " + error);
  }
}

/**
 * Post a new inventory
 */
async function addInventory({
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
}) {
  try {
    const sql = `INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`;

    const result = await pool.query(sql, [
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
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInvItemByID,
  addClassification,
  addInventory,
};
