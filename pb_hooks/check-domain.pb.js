/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/check-domain/:domain', (c) => {
	const { select } = require(`${__hooks}/modules/sql.js`)

	const domain = c.pathParam('domain')
	if (!domain) {
		return c.json(200, { data: null, error: 'domain is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}

	const { data:domains, error:err } = select({count: 0},
		`select count(*) as count from projects where domain = '${domain}'`
	)
	if (err) {
		return c.json(200, { data: null, error: err?.value?.error() || err })
	}
	if (domains.length === 0) {
		return c.json(200, { data: null, error: 'error looking up domain' })
	} else {
		return c.json(200, { data: domains[0].count, error: null })
	}	
})

