var exports = module.exports = {};

require('dotenv').config()
var https = require('https');
var fs = require('fs');
var moltin = require('./moltin');
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

exports.getAirtableRecords = function(records) {
    base('Veggie Bin').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: records,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {

            console.log('Retrieved ' + record.id);

            if(record.fields.Status === 'Live') {

                setTimeout(function () {

                    const processRecord = async (record) => {

                        var createProduct = await moltin.createProduct({
                        "type": "product",
                        "name": record.fields.Name,
                        "slug": record.fields['Slug 2'],
                        "sku":  record.fields.sku,
                        "description": record.fields.Descroption,
                        "manage_stock": true,
                        "price": [
                        {
                            "amount": record.fields.Price.trim().slice(1,8)*100,
                            "currency": 'USD',
                            "includes_tax": true
                        }
                        ],
                        "status": "live",
                        "stock": 5000,
                        "commodity_type": record.fields['Commodity type'].toLowerCase()
                    })

                        var addRelationship = await moltin.addProductRelationship(createProduct.data.id, 'category', moltin.category(record.fields.Categories).id)
                        
                        var processFile = await moltin.fetchAndUploadFile(createProduct.data.id, record.fields.Name + ".jpg", record.fields.Image[0].url, './images/' + record.fields.Name + ".jpg")
                    }

                    console.log('creating record ' + record.id);

                    processRecord(record);
                    
                }, 2000)
            } else {
                console.log('product is not live');
            };
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
    });
};