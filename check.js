var fs = require('fs');

// Load data
var catalog = JSON.parse(fs.readFileSync('catalog.json'));
var dictionary = JSON.parse(fs.readFileSync('dictionary/dictionary_ru.json')); // TODO: no support for multiple languages

var errors = 0;

// Load entries into by-name hash, do basic name checks along the way
var entry_by_name = {};
for (var entry in catalog) {
	if (typeof catalog[entry].name !== 'string') {
		console.log('Entry with no name: ' + catalog.entry);
		errors++;
	}

	if (!catalog[entry].name.match(/^[a-z0-9_]+$/)) {
		console.log('Invalid name: ' + catalog[entry].name);
		errors++;
	}

	if (typeof entry_by_name[catalog[entry].name] !== 'undefined') {
		console.log('Duplicate name: ' + catalog[entry].name);
		errors++;
	}

	entry_by_name[catalog[entry].name] = catalog[entry];
}

var used_moretags = {};
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
			used_moretags[moretag] = 1;
			if (entry_by_name[entry].moretags[moretag].type === 'translate') {
				if (typeof dictionary.moretags[moretag] !== 'object') {
					console.log(entry_by_name[entry].name + ': no translation for moretag ' + moretag);
					errors++;
				}
			}
		}
	}

	// Check moretags
	for (var moretag in entry_by_name[entry].moretags) {
		if (typeof entry_by_name[entry].moretags[moretag]['class'] === 'undefined') {
			console.log(entry_by_name[entry].name + ', moretag ' + moretag + ': no class');
			errors++;
		}
		if (typeof entry_by_name[entry].moretags[moretag]['tag'] === 'undefined') {
			console.log(entry_by_name[entry].name + ', moretag ' + moretag + ': no tag');
			errors++;
		}
		if (typeof entry_by_name[entry].moretags[moretag]['type'] === 'undefined') {
			console.log(entry_by_name[entry].name + ', moretag ' + moretag + ': no type');
			errors++;
		}
	}
}

// Check dictionary
for (var entry in dictionary.catalog) {
	if (typeof entry_by_name[entry] === 'undefined') {
		console.log(entry + ': name found in dictionary, but not in the catalog');
		errors++;
	}
}
for (var entry in dictionary.moretags) {
	if (typeof used_moretags[entry] === 'undefined') {
		console.log(entry + ': moretag found in dictionary, but not in the catalog');
		errors++;
	}
}

console.log(errors + ' error(s)');
console.log('');

// POIs without icons
var pois_without_icons = [];
for (var entry in entry_by_name) {
	if (entry_by_name[entry].poi && !fs.existsSync('poi_marker/' + entry + '.png'))
		pois_without_icons.push(entry);
}
pois_without_icons.sort();

console.log(pois_without_icons.length + ' POI(s) without icons: ' + pois_without_icons.join(', '));

process.exit(errors);
