var catalog, dictionary;

$.getJSON('catalog.json', function(data) { catalog = data; initCatalog(); });
$.getJSON('dictionary/dictionary_ru.json', function(data) { dictionary = data; initCatalog(); });

var j = 0;

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

		var tags = [];
		for (var tag in items[iitem].tags) {
			if (tags.length != 0)
				tags.push(' + ');

			tags.push(
				$('<a>').addClass('tag').prop('href', 'https://wiki.openstreetmap.org/wiki/Tag:' + tag + '%3D' + items[iitem].tags[tag]).text(tag + '=' + items[iitem].tags[tag])
			);
		}

		var moretags = undefined;
		for (var moretag in items[iitem].moretags) {
			if (typeof moretags === 'undefined')
				moretags = $('<ul>');

			var rusmoretag = dictionary.moretags[moretag].name;
			$('<li>').append(
				$('<span>').prop('title', 'В каталоге значится как ' + moretag).text(rusmoretag)
			).append(
				$('<a>').addClass('tag').addClass('details').prop('href', 'https://wiki.openstreetmap.org/wiki/Key:' + items[iitem].moretags[moretag].tag).text(items[iitem].moretags[moretag].tag + '=*')
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
								$('<span>').addClass('details').append(tags)
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
