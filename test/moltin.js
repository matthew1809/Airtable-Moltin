const moltin = require('../utils/moltin');
const MoltinGateway = require('@moltin/sdk').gateway;
const fs = require('fs');
const rp = require('request-promise');

const Moltin = MoltinGateway({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});


var manualAuth = () => {
  return Moltin.Authenticate()
};


var uploadFile = async (productID, name, path) => {

  var auth = await manualAuth()

  console.log(process.cwd());

  const options = {
    method: 'POST',
    headers: {'Content-Type': 'multipart/form-data', 'Authorization': auth.access_token},
    uri: 'https://api.moltin.com/v2/files',
    formData: {
      file: fs.createReadStream(path)
    },
    json: true
  };

  return rp(options)
  
  .then(function (res) {
      console.log(res);
    }).catch((e) => {
      console.log(e);
    })

};

return uploadFile('b45f250a-ba75-41aa-a97d-0bc002de7249', './test.jpg', './test/images/test.jpg')