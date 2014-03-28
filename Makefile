NODE?=	node

all: check

check: catalog.json check.js
	${NODE} check.js

id nextid:
	${NODE} get_next_free_id.js

array pois:
	${NODE} get_poi_id_array.js
