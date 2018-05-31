var exports = module.exports = {};

require('dotenv').config();
const stubs = require('../stubs/moltin-stubs.js');
const MoltinGateway = require('@moltin/sdk').gateway;
const rp = require('request-promise');
var https = require('https');
const fs = require('fs');

const Moltin = MoltinGateway({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

exports.brand = function(brandName) {
  return Moltin.Brands.Filter({eq: {slug: brandName}}).All()
  .then(brands => {
    console.log(brands);
    console.log(' for ' + brandName);
    if(brands !== undefined && brands.data && brands.data.length > 0) {
      return brands.data[0].id;
    } else {console.log("no brand found for " + brandName)}
  }).catch((e) => {
    console.log("error finding brand of " + brandName + ". error of " + e);
  })
}

exports.addProductRelationship = (productID, type, ID) => {
  return Moltin.Products.CreateRelationships(productID, type, ID);
};

exports.getAllProducts = () => {return Moltin.Products.All()};
exports.getAllBrands = () => {return Moltin.Brands.All()};

exports.createBrand = async (data) => {return Moltin.Brands.Create(data)};
exports.createProduct = (data) => {return Moltin.Products.Create(data)};

exports.deleteProduct = (data) => {return Moltin.Products.Delete(data)};
exports.deleteBrand = (data) => {return Moltin.Brands.Delete(data)};

exports.deleteAllProducts = async () => {

  var getAllProducts = await exports.getAllProducts()

  getAllProducts.data.forEach(function(product) {
    return exports.deleteProduct(product.id);
  });
};

exports.deleteAllBrands = async () => {

  var getAllBrands = await exports.getAllBrands();

  getAllBrands.data.forEach(function(brand) {
   try {exports.deleteBrand(brand.id);}
   catch(e) {console.log(e)};
  });
};

exports.manualAuth = () => {
  return Moltin.Authenticate()
};

exports.uploadFile = async (productID, name, path) => {

  try {
    var auth = await exports.manualAuth();

    const options = {
      method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', 'Authorization': auth.access_token},
      uri: 'https://api.moltin.com/v2/files',
      formData: {
        file: fs.createReadStream(path)
      },
      json: true
    };

    var fetchFile = await rp(options);

    var addRelationship = await exports.addProductRelationship(productID, 'file', fetchFile.data.id);

  } catch(e) {
    console.log(e);
  };
};

exports.fetchAndUploadFile = async (productID, name, url, path) => {

  var file = fs.createWriteStream('./images/' + name);

  return https.get(url, function(response) {
    response.pipe(file).on('finish', function() {return exports.uploadFile(productID, name, './images/' + name)});
  });
};

exports.downloadFiles = function(record) {
  return files.download(record.fields.img_link, './files/' + record.fields.sku, function(err) {
    if(err) {console.log(err)}
  })
};

exports.addFlowrelationship = async (productID) => {

};