require('dotenv').config()
const exports = module.exports = {};
const https = require('https');
const fs = require('fs');
const moltin = require('./moltin');
const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_BURBAGES);
const timeout = ms => new Promise(res => setTimeout(res, ms))

exports.getAirtableRecords = function(records) {
  base('Burbages').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: records,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        async function moltinProcess(record, desc) {

          try {

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
            return e;
          }

        };


        async function processThing(record) {

         if(record.fields.Status === 'Live') {

          let desc = "none";

          if(record.fields.Descroption !== undefined) {
            desc = record.fields.Descroption;
            console.log(desc);
          }

          var process = await moltinProcess(record, desc);
          var timer = await timeout(2000);
          console.log(process);
          return;

        } else {
          console.log('product is not live');
        };

      };

      function processAllThings(things, cb) {

        var currentThing = things.shift();

        processThing(currentThing)
        .then(() => {

          if (things.length > 0) {
            processAllThings(things)
          }  

        }).catch((e) => {
          console.log(e);
        })
      }

      processAllThings(records);


        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

      }, function done(err) {
        if (err) { console.error(err); return; }
      });
    };