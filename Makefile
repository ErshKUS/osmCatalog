NODE?=	node

all: check

check: catalog.json check.js
	${NODE} check.js

nextid:
	${NODE} get_next_free_id.js
