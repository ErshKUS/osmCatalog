var fs = require('fs');

// Load data
var catalog = JSON.parse(fs.readFileSync('catalog.json'));
var dictionary = JSON.parse(fs.readFileSync('dictionary/dictionary_ru.json')); // TODO: no support for multiple languages

var errors = 0;
var warnings = 0;

// Load entries into by-name hash, do basic name checks along the way
var entry_by_name = {};
for (var entry in catalog) {
	if (typeof catalog[entry].name !== 'string') {
		console.log('ERROR[1]: Entry with no name: ' + catalog.entry);
		errors++;
	}

	if (!catalog[entry].name.match(/^[a-z0-9_]+$/)) {
		console.log('ERROR[2]: Invalid name: ' + catalog[entry].name);
		errors++;
	}

	if (typeof entry_by_name[catalog[entry].name] !== 'undefined') {
		console.log('ERROR[3]: Duplicate name: ' + catalog[entry].name);
		errors++;
	}

	entry_by_name[catalog[entry].name] = catalog[entry];
}

var used_moretags = {};
for (var entry in entry_by_name) {
	// Check parent connectivity
	for (var parent in entry_by_name[entry].parent) {
		if (typeof entry_by_name[entry_by_name[entry].parent[parent]] !== 'object') {
			console.log('ERROR[4]: ' + entry_by_name[entry].name + ': parent not found: ' + entry_by_name[entry].parent[parent]);
			errors++;
		}
	}

	// Check type
	for (var type in entry_by_name[entry].type) {
		if (entry_by_name[entry].type[type] !== 'node' && entry_by_name[entry].type[type] !== 'area') {
			console.log('ERROR[5]: ' + entry_by_name[entry].name + ': unknown type: ' + entry_by_name[entry].type[type]);
			errors++;
		}
	}

	// Check translation
	if (typeof dictionary.catalog[entry_by_name[entry].name] !== 'object') {
		console.log('ERROR[6]: ' + entry_by_name[entry].name + ': no translation');
		errors++;
	} else {
		for (var moretag in entry_by_name[entry].moretags) {
			used_moretags[moretag] = 1;
			if (entry_by_name[entry].moretags[moretag].type === 'translate') {
				if (typeof dictionary.moretags[moretag] !== 'object') {
					console.log('ERROR: ' + entry_by_name[entry].name + ': no translation for moretag ' + moretag);
					errors++;
				}
			}
		}
	}

	// Check moretags
	for (var moretag in entry_by_name[entry].moretags) {
		if (typeof entry_by_name[entry].moretags[moretag]['class'] === 'undefined') {
			console.log('ERROR[7]: ' + entry_by_name[entry].name + ', moretag ' + moretag + ': no class');
			errors++;
		}
		if (typeof entry_by_name[entry].moretags[moretag]['tag'] === 'undefined') {
			console.log('ERROR[8]: ' + entry_by_name[entry].name + ', moretag ' + moretag + ': no tag');
			errors++;
		}
		if (typeof entry_by_name[entry].moretags[moretag]['type'] === 'undefined') {
			console.log('ERROR[9]: ' + entry_by_name[entry].name + ', moretag ' + moretag + ': no type');
			errors++;
		}
	}
}

// Check dictionary
for (var entry in dictionary.catalog) {
	if (typeof entry_by_name[entry] === 'undefined') {
		console.log('WARNING[1]: ' + entry + ': name found in dictionary, but not in the catalog');
		warnings++;
	}
}
for (var entry in dictionary.moretags) {
	if (typeof used_moretags[entry] === 'undefined') {
		console.log('WARNING[2]: ' + entry + ': moretag found in dictionary, but not in the catalog');
		warnings++;
	}
}

// POIs without icons
var entry_names_sorted = [];
for (var entry in entry_by_name)
	entry_names_sorted.push(entry);
entry_names_sorted = entry_names_sorted.sort();

for (var entry in entry_names_sorted) {
	if (entry_by_name[entry_names_sorted[entry]].poi && !fs.existsSync('poi_marker/' + entry_names_sorted[entry] + '.png')) {
		//pois_without_icons.push(entry);
		console.log('WARNING[3]: ' + entry_names_sorted[entry] + ': POI without icon');
		warnings++;
	}
}

// Icons without POIs
var icons = fs.readdirSync('poi_marker');
for (icon in icons) {
	var name = icons[icon].replace(/\.png$/, '');
	if (typeof entry_by_name[name] !== 'object') {
		console.log('WARNING[4]: ' + name + ': unused icon');
		warnings++;
	}
}

// Done
console.log(errors + ' error(s), ' + warnings + ' warning(s)');
process.exit(errors);
