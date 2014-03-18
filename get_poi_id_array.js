var fs = require('fs');

var catalog = JSON.parse(fs.readFileSync('catalog.json'));

var array = [];

for (var entry in catalog) {
	array[catalog[entry].id] = catalog[entry].name;
}

array[390] = 'root'; // root id is hardcoded after adding introducing to catalog

console.log(JSON.stringify(array, null, 2));
