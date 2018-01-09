const express = require('express');
const app = express();
const path = require('path');
const mv = require('mv');
const fileUpload = require('express-fileupload');
const index=path.join(__dirname, './', 'upload.html');
app.use(fileUpload());

app.get('/', (req, res) => res.sendFile(index));

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
 
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./files/file.csv', function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});

app.listen(8000, () => console.log('Example app listening on port 8000!'));