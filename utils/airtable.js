var exports = module.exports = {};

require('dotenv').config()

var moltin = require('./moltin');
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

exports.getAirtableRecords = function() {
        base('Veggie Bin').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 1,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {

            console.log('Retrieved ' + record.id);

            if(record.fields.Status === 'Live') {

                setTimeout(function () {

                console.log('creating record ' + record.id);

                moltin.createProduct(
                    {
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
                    }
                )
                .then((res) => {
                    console.log(res.data.id + " piped from airtable to moltin successfully!");

                    return moltin.addProductCategoryRelationship(res.data.id, moltin.category(record.fields.Categories).id)
                    .then((res) => {console.log(res);})
                    .catch((e) => {console.log(e);});

                }).catch((e) => {
                    console.log(e);
                });
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