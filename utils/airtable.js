require('dotenv').config()
var exports = module.exports = {};
const https = require('https');
const fs = require('fs');
const moltin = require('./moltin');
const Airtable = require('airtable');
const files = require('./files.js');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);
const timeout = ms => new Promise(res => setTimeout(res, ms))

exports.getAirtableRecords = function(baseID, records) {
  base(baseID).select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 100,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        async function moltinProcess(record, desc) {
          console.log('moltinProcess running')
          try {

            var createProduct = await moltin.createProduct({
              "type": "product",
              "name": record.fields.model,
              "slug": record.fields.model,
              "sku":  record.fields.sku,
              "description": desc,
              "manage_stock": true,
              "price": [
              {
                "amount": record.fields.watchr_price.trim().slice(1,8)*100,
                "currency": 'EUR',
                "includes_tax": true
              }
              ],
              "status": "live",
              "stock": 5000,
              "commodity_type": 'physical',
              'watchr_id': record.fields.watchr_id,
              'website_id': record.fields.website_id,
              'clasp_type': record.fields.clasp_type,
              'bracelet_color': record.fields.bracelet_color,
              'bracelet_material': record.fields.bracelet_material,
              'gemstones': record.fields.gemstones,
              'dial_color': record.fields.dial_color,
              'crystal': record.fields.crystal,
              'case_material': record.fields.case_material,
              'case_size': record.fields.case_size,
              'movement': record.fields.movement,
              'year': record.fields.year,
              'papers': record.fields.papers,
              'box': record.fields.box,
              'ref': record.fields.ref,
              'model': record.fields.model,
              'shop_id': record.fields.shop_id,
              'watchr_id': record.fields.watchr_id,
              'website_id': record.fields.website_id,
              'dealer_link': record.fields.dealer_link,
              'serial': record.fields.serial,
              'gender': record.fields.gender,
              'serviced': record.fields.serviced,
              'service_year': record.fields.service_year,
              'service_receipt': record.fields.service_receipt,
              'original_purchase_receipt': record.fields.original_purchase_receipt,
              'functions': record.fields.functions,
              'additional_options': record.fields.additional_options,
              'extra_info': record.fields.extra_info,
              'watchr_price': record.fields.watchr_price,
              'images': record.fields.img_link
            });

            console.log("product uploaded");

            var brandID = await moltin.brand(record.fields.brand);
            console.log("found brand " + brandID);

            var addRelationship = await moltin.addProductRelationship(createProduct.data.id, 'brand', brandID)
            console.log("product " + createProduct.data.id + " now associated with brand " + brandID)
            
            //var processFile = await moltin.fetchAndUploadFile(createProduct.data.id, record.fields.Name + ".jpg", record.fields.Image[0].url, './images/' + record.fields.Name + ".jpg");

            return("done");

          } catch(e) {
            return e;
          }

        };


        async function processThing(record) {
          let desc = "none";
          if(record.fields.description) {
            let desc = record.fields.description;
          };

         if(record.fields.Status === 'live') {
          console.log('product is live');
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