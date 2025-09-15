const pool = require("../database/")

/**
 * Geat all classification data
*/
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
} 

module.exports = { getClassifications }