var catalog, dictionary;

$.getJSON('catalog.json', function(data) { catalog = data; initCatalog(); });
$.getJSON('dictionary/dictionary_ru.json', function(data) { dictionary = data; initCatalog(); });

var j = 0;

var alphabet = '0123456789_~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function numset_pack(numbers) {
    // Sort input
    var sorted_numbers = numbers.slice(0);
    sorted_numbers.sort(function(a,b){return a-b;});

    // RLE
    var lengths = [];
    var empty_range_start = 0;
    for (var pos = 0; pos < sorted_numbers.length; ++pos) {
        // starting number of current range
        var full_range_start = sorted_numbers[pos];

        // trace continuous range of numbers (allows duplicates)
        while (pos + 1 < sorted_numbers.length && sorted_numbers[pos + 1] <= sorted_numbers[pos] + 1)
            pos++;

        // ending number of current range
        var full_range_end = sorted_numbers[pos];

        // save next empty range
        lengths.push(full_range_start - empty_range_start);

        // save next full range
        lengths.push(full_range_end - full_range_start + 1);

        empty_range_start = full_range_end + 1;
    }

    // Prefix encoding
    var output = '';
    for (var pos = 0; pos < lengths.length; ++pos) {
        while (lengths[pos] >= 32) {
            // Store high-order parts of a number in 1XXXXX form
            var lowpart = lengths[pos] & 0x1f;
            lengths[pos] = lengths[pos] >> 5;
            lowpart |= 0x20;
            output += '' + alphabet.substr(lowpart, 1);
        }
        // Store low-order part of a number in 0XXXXX form
        output += '' + alphabet.substr(lengths[pos], 1);
    }

    return output;
}

function initCatalog() {
	if (typeof catalog !== 'object' || typeof dictionary !== 'object')
		return; // need all data

	// Prepare catalog hierarchy
	var catalog_root_items = [];
	var catalog_by_name = {};
	for (var icatitem = 0; icatitem < catalog.length; icatitem++) {
		catalog[icatitem].childs = [];
		catalog_by_name[catalog[icatitem].name] = catalog[icatitem];

		if (catalog[icatitem].parent.length == 0) {
			catalog_root_items.push(catalog[icatitem]);
		}
		for (var iparent = 0; iparent < catalog[icatitem].parent.length; iparent++) {
			catalog_by_name[catalog[icatitem].parent[iparent]].childs.push(catalog[icatitem]);
		}
	}

	$('#viewer').empty().append(createList(catalog_root_items));
	if (window.location.hash !== '')
		window.location = window.location.hash;
}

function createTag(key, val) {
	var tag, wiki_url, taginfo_url;

	if (arguments.length == 1) {
		tag = key + '=*';
		wiki_url = 'https://wiki.openstreetmap.org/wiki/Key:' + key;
		taginfo_url = 'http://taginfo.openstreetmap.ru/keys/' + key;
	} else {
		tag = key + '=' + val;
		wiki_url = 'https://wiki.openstreetmap.org/wiki/Tag:' + key + '%3D' + val;
		taginfo_url = 'http://taginfo.openstreetmap.ru/tags/' + key + '=' + val;
	}

	return [
		$('<span>').addClass('tag').text(tag),
		' (',
		$('<a>').prop('href', wiki_url).text('wiki'),
		' ',
		$('<a>').prop('href', taginfo_url).text('taginfo'),
		')'
	];
}

function createList(items) {
	if (items.length == 0)
		return;

	var ul = $('<ul>').addClass('catalog-item');

	items = items.sort(function(a, b) {
		var aa = dictionary.catalog[a.name].name;
		var bb = dictionary.catalog[b.name].name;
		if (aa < bb)
			return -1;
		if (aa > bb)
			return 1;
		return 0;
	} );

	for (var iitem = 0; iitem < items.length; iitem++) {
		var catname = items[iitem].name;
		var rusname = dictionary.catalog[catname].name;

		var tags = $('<span>').addClass('details');
		var first = true;
		for (var tag in items[iitem].tags) {
			if (first) {
				first = false;
			} else {
				tags.append(' + ');
			}

			var val = items[iitem].tags[tag];
			if (val[0] === '!') {
				tags.append('отсутствие ');
				val = val.substr(1);
			}

			tags.append(createTag(tag, val));
		}

		var view = $('<span>').addClass('details').append(
			$('<a>').prop('href', 'http://openstreetmap.ru/#poi=' + numset_pack([items[iitem].id])).text('смотреть POI')
		);

		var moretags = undefined;
		for (var moretag in items[iitem].moretags) {
			if (typeof moretags === 'undefined')
				moretags = $('<ul>');

			var rusmoretag = dictionary.moretags[moretag].name;
			$('<li>').append(
				$('<span>').prop('title', 'В каталоге значится как ' + moretag).text(rusmoretag)
			).append(
				': '
			).append(
				createTag(items[iitem].moretags[moretag].tag)
			).appendTo(moretags);
		}
		if (typeof moretags !== 'undefined') {
			moretags = $('<div>').addClass('poi-proplist').append(
					$('<span>').text('Дополнительные тэги:')
			).append(moretags);
		}

		var seealsos = undefined;
		for (var seealso in dictionary.catalog[catname].seealso) {
			if (typeof seealsos === 'undefined')
				seealsos = $('<ul>').addClass('poi-proplist');

			var seealsoname = dictionary.catalog[catname].seealso[seealso];
			var russeealso = dictionary.catalog[seealsoname].name;
			$('<li>').append(
				$('<a>').prop('href', '#' + seealsoname).text(russeealso)
			).appendTo(seealsos)
		}
		if (typeof seealsos !== 'undefined') {
			seealsos = $('<div>').addClass('poi-proplist').append(
				$('<span>').text('Смотри также:')
			).append(seealsos);
		}

		var description = undefined;
		if (dictionary.catalog[catname].description != '') {
			description = $('<span>').addClass('details').append('(' + dictionary.catalog[catname].description + ')');
		}
		$('<li>').append(
					$('<div>').addClass('poi-info').append(
						$('<div>').addClass('poi-info-left').append(
							$('<div>').addClass('poi-icon').css('background-image', 'url(poi_marker/' + catname + '.png)')
						)
					).append(
						$('<div>').addClass('poi-info-right').append(
							$('<div>').addClass('poi-info-top').append(
								$('<a>').addClass('poi-name').prop('href', 'viewer.html#' + catname).prop('title', 'В каталоге значится как ' + catname).prop('name', catname).text(rusname)
							).append(
								$(' ')
							).append(
								tags
							).append(
								view
							).append(
								description
							)
						).append(
							$('<div>').addClass('poi-info-bottom').append(
								moretags
							).append(
								seealsos
							)
						)
					).append(
						$('<div>').addClass('poi-info-float-breaker')
					)
				)
				.append(createList(items[iitem].childs))
				.appendTo(ul);
	}

	return ul;
}
