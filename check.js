var fs = require('fs');

// Load data
var catalog = JSON.parse(fs.readFileSync('catalog.json'));
var dictionary = JSON.parse(fs.readFileSync('dictionary/dictionary_ru.json')); // TODO: no support for multiple languages

var errors = 0;

// Load entries into by-name hash
var entry_by_name = {};
for (var entry in catalog) {
	if (typeof catalog[entry].name !== 'string') {
		console.log('Entry with no name: ' + catalog.entry);
		errors++;
	}

	if (typeof entry_by_name[catalog[entry].name] !== 'undefined') {
		console.log('Duplicate name: ' + catalog[entry].name);
		errors++;
	}

	entry_by_name[catalog[entry].name] = catalog[entry];
}

for (var entry in entry_by_name) {
	// Check parent connectivity
	for (var parent in entry_by_name[entry].parent) {
		if (entry_by_name[entry].parent[parent] === '')
			continue;
		if (typeof entry_by_name[entry_by_name[entry].parent[parent]] !== 'object') {
			console.log(entry_by_name[entry].name + ': parent not found: ' + entry_by_name[entry].parent[parent]);
			errors++;
		}
	}

	// Check type
	for (var type in entry_by_name[entry].type) {
		if (entry_by_name[entry].type[type] !== 'node' && entry_by_name[entry].type[type] !== 'area' && entry_by_name[entry].type[type] !== '') {
			console.log(entry_by_name[entry].name + ': unknown type: ' + entry_by_name[entry].type[type]);
			errors++;
		}
	}

	// Check translation
	if (typeof dictionary.catalog[entry_by_name[entry].name] !== 'object') {
		console.log(entry_by_name[entry].name + ': no translation');
		errors++;
	} else {
		for (var moretag in entry_by_name[entry].moretags) {
			if (entry_by_name[entry].moretags[moretag].type === 'translate') {
				if (typeof dictionary.moretags[moretag] !== 'object') {
					console.log(entry_by_name[entry].name + ': no translation for moretag ' + moretag);
					errors++;
				}
			}
		}
	}
}

console.log(errors + ' error(s)');

process.exit(errors);
