var fs = require('fs');
var catalog = JSON.parse(fs.readFileSync('catalog.json'));

var free_id = 390 + 1; // root id is hardcoded after adding introducing to catalog

for (var entry in catalog) {
	if (catalog[entry].id >= free_id) {
		free_id = catalog[entry].id + 1;
	}
}

console.log(free_id);
