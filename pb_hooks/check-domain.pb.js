/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/check-domain/:Domain', (c) => {
	const { select } = require(`${__hooks}/modules/sql.js`)
    const config = require(`${__hooks}/config.json`)

	const Domain = c.pathParam('Domain')
	if (!Domain) {
		return c.json(200, { data: null, error: 'Domain is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		//return c.json(200, { data: null, error: 'not logged in' })
	}

	// throws on timeout or network connectivity error
	try {
		console.log('checking domain with api.machines.dev')
		const res = $http.send({
			url:     `https://api.machines.dev/v1/apps/${Domain}`,
			method:  "GET",
			body:    "", // eg. JSON.stringify({"test": 123})
			headers: {"Content-Type": "application/json",
				"Authorization": `Bearer ${config.FLY_ORG_TOKEN}`},
			timeout: 20, // in seconds
		})

		// console.log('domain check:', Domain, JSON.stringify(res?.json))
		// console.log(res.headers)    // the response headers (eg. res.headers['X-Custom'][0])
		// console.log(res.cookies)    // the response cookies (eg. res.cookies.sessionId.value)
		// console.log(res.statusCode) // the response HTTP status code
		// console.log(res.raw)        // the response body as plain text
		// console.log(res.json)       // the response body as parsed json array or map
		// res.json:
		// {"data":{"error":"App not found"},"error":null}
		// {"data":{"error":"unauthorized"},"error":null}
		// {"data":{"id":"xxxxxxx","name":"app-from-my-org","organization":{"name":"air-port.dev","slug":"air-port-dev"},"status":"suspended"},"error":null}
		if (res?.json?.data?.error) {
			return c.json(200, { data: null, error: res.json.data.error })
		}
		if (res?.json?.error === 'App not found') {
			return c.json(200, { data: "available", error: null })
		} else if (res?.json?.error === 'unauthorized') {
			return c.json(200, { data: "unavailable: external", error: null })
		} else if (res?.json?.id) {
			return c.json(200, { data: "unavailable: local", error: null })
		} else {
			return c.json(200, { data: null, error: res.json })
		}
	} catch (err) {
		return c.json(200, { data: null, error: err.message })
	}

})

