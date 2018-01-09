const csv=require('csvtojson');
var path = require('path');
const csvFilePath=path.join(__dirname, './', 'test.csv');

exports = module.exports = {};

exports.function process(path) {
	csv()
	.fromFile(csvFilePath)
	.on('json',(jsonObj)=>{
		console.log(jsonObj);

	})
	.on('done',(e)=>{
	    if(e) {
	    	console.log(e);
	    };
	});
};



