/// <reference path="../pb_data/types.d.ts" />

/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/get-environment', (c) => {
	// const { hello } = require(`${__hooks}/modules/callbackend.js`)
	return c.json(200, { data: `ENVIRONMENT: ${$os.getenv("ENVIRONMENT")}`, error: null })		
})

