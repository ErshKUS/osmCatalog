NODE?=	node

all: check

check: catalog.json check.js
	${NODE} check.js

