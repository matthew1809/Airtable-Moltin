var exports = module.exports = {};

require('dotenv').config();
const stubs = require('../stubs/moltin-stubs.js');
const MoltinGateway = require('@moltin/sdk').gateway;
const rp = require('request-promise');
const fs = require('fs');

const Moltin = MoltinGateway({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

const categories = [
  {'name': 'Bakery', 'id': '1686e358-40e3-4746-9bbc-ac9b21ab94ca'},
  {'name': 'Beer and Wine', 'id': '548c782f-6b62-434a-ac8c-30cd999761e6'},
  {'name': 'Beverages', 'id': '011ca5d5-765f-4e1a-bd04-9a3123326e79'},
  {'name': 'Canned Goods', 'id': '648e582b-4f6a-4139-95b6-62d379e0cadd'},
  {'name': 'Dairy & Eggs', 'id': '761abc79-cbee-4fba-97a4-df2324704dc5'},
  {'name': 'Dry Goods & pasta', 'id': 'e7788bc2-646a-4626-bf19-cc80c048ae6d'},
  {'name': 'Frozen', 'id': '2008300b-fe5c-4cf0-8f5d-912415c50dc1'},
  {'name': 'Household', 'id': '19a9e630-f9a2-4ae5-ad52-cd234056488d'},
  {'name': 'Meat & Seafood', 'id': '451fab4d-e421-43ce-b4ba-1ad05ad28e48'},
  {'name': 'Pantry', 'id': '358d4a5b-1177-4677-9b03-fbadae1e91da'},
  {'name': 'Produce', 'id': 'ae8b29bf-23f6-4121-a751-547c9e3be900'},
  {'name': 'Snacks', 'id': 'ad95c01d-f2d7-4c3d-98df-1fc928d5935a'},
  {'name': 'Pets', 'id': '2cf8a938-12b6-46a9-86bb-c805ba2119ab'},
  {'name': 'Deli', 'id': 'a522cd06-a3da-4efe-9d8a-5a4434eb792c'},
  {'name': 'Local', 'id': '1d95a879-95bd-45b1-9ca5-58f74d801a3e'}
];


exports.category = function(name) {
	return categories.find(category => {
   		return category.name == name;
	});
}

exports.addProductCategoryRelationship = (productID, categoryID) => {
   return Moltin.Products.CreateRelationships(productID, 'category', categoryID);
};

exports.getAllProducts = () => {return Moltin.Products.All()};

exports.createProduct = (data) => {return Moltin.Products.Create(data)};

exports.deleteProduct = (data) => {return Moltin.Products.Delete(data)};

exports.deleteAllProducts = () => {
  return exports.getAllProducts()
  .then((res) => {

    res.data.forEach(function(product) {
      return exports.deleteProduct(product.id);
    })
  }).catch((e) => {
    console.log(e);
  });
};

exports.uploadFile = (name, path) => {

  Moltin.Authenticate().then((response) => {
    return response;
  })

  .then((response) => {

    const options = {
      method: 'POST',
      headers: {'Content-Type': 'multipart/form-data', 'Authorization': response.access_token},
      uri: 'https://api.moltin.com/v2/files',
      formData: {
        file: fs.createReadStream(path)
      }
    };

    return rp(options)
    .then(function (res) {
        console.log(res);
    })
    .catch(function (err) {
        console.log(err);
    });

  });
};