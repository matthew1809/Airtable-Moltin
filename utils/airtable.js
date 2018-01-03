var exports = module.exports = {};

require('dotenv').config()
var https = require('https');
var fs = require('fs');
var moltin = require('./moltin');
var Airtable = require('airtable');
var async = require('async');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_BURBAGES);

exports.getAirtableRecords = function(records) {
  base('Burbages').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: records,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        async.mapLimit(records, 2, async function(record) {

          if(record.fields.Status === 'Live') {

            try {

              let desc = "none";

              if(record.fields.Descroption !== undefined) {
                desc = record.fields.Descroption;
                console.log(desc);
              }

              var createProduct = await moltin.createProduct({
                "type": "product",
                "name": record.fields.Name,
                "slug": record.fields['Slug 2'],
                "sku":  record.fields.sku,
                "description": desc,
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
              });

              var catID = await moltin.category(record.fields.Categories).burbages_id;

              var addRelationship = await moltin.addProductRelationship(createProduct.data.id, 'category', catID)

              var processFile = await moltin.fetchAndUploadFile(createProduct.data.id, record.fields.Name + ".jpg", record.fields.Image[0].url, './images/' + record.fields.Name + ".jpg");

              return("done");

            } catch(e) {
              console.log(e);
              return(e);
            };

          } else {
            console.log('product is not live');
          };

        }, (err, results) => {
          if (err) throw err
            console.log(results);
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

      }, function done(err) {
        if (err) { console.error(err); return; }
      });
    };