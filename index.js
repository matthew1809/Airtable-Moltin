const stubs = require('./stubs/moltin-stubs.js');
const moltinUtils = require('./utils/moltin');
const airtableUtils = require('./utils/airtable');

// call our airtable functionality
airtableUtils.getAirtableRecords('Verado 1');

//moltinUtils.deleteAllProducts();