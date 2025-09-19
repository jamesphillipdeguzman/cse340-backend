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

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `
            SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1       
            `,
      [classification_id]
    );
    return data;
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
    return data;
  } catch (error) {
    Console.error("getInvItemById error " + error);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInvItemByID,
};
