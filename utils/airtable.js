require('dotenv').config()
var exports = module.exports = {};
const https = require('https');
const fs = require('fs');
const moltin = require('./moltin');
const Airtable = require('airtable');
const files = require('./files.js');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);
const timeout = ms => new Promise(res => setTimeout(res, ms))

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

exports.getAirtableRecords = function(baseID, records) {
  base(baseID).select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 1000,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        async function moltinProcess(record, desc) {
          console.log('moltinProcess running')
          //console.log(record.fields.brand);
           try {
            var createProduct = await moltin.createProduct({
              "type": "product",
              "vendor": "Verado",
              "name": record.fields.model,
              "slug": record.fields.model + '+' + record.fields.sku,
              "sku":  record.fields.sku,
              "description": desc,
              "manage_stock": true,
              "price": [
              {
                "amount": record.fields.watchr_price.trim().slice(1,8)*100,
                "currency": 'USD',
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

            var brand = record.fields.Brand;
            var formattedBrand = await brand.replaceAll(' ', '-');
            var formattedBrand2 = await formattedBrand.replaceAll('&', 'and');
            var formattedBrand3 = await formattedBrand2.replaceAll(/\u00f6/g, "o");
            var formattedBrand4 = await formattedBrand3.replaceAll(/\u00fc/g, "u");
            var formattedBrand5 = await formattedBrand4.replaceAll(/\u00E8/g, "e");

            var brandID = await moltin.brand(formattedBrand5);

            console.log("ready to create relationship with product ID of: " + createProduct.data.id + "and brand ID of: " + brandID);

            var addRelationship = await moltin.addProductRelationship(createProduct.data.id, 'brand', brandID)
            console.log("product " + createProduct.data.id + " now associated with brand " + brandID)
            
            //var processFile = await moltin.fetchAndUploadFile(createProduct.data.id, record.fields.Name + ".jpg", record.fields.Image[0].url, './images/' + record.fields.Name + ".jpg");
  
            //var createBrand = await moltin.createBrand({"type": 'brand', 'name': record.fields.brand, 'slug': formattedBrand5, 'status': 'live'})

            return("done");

          } catch(e) {
            return (e);
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
          var timer = await timeout(3000);
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