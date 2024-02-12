routerAdd('POST', '/pitr', async (c) => {
	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!data?.instance_id) {
		return c.json(200, { data: null, error: 'instance_id is required' })
	}
	if (!data?.db) {
		return c.json(200, { data: null, error: 'db is required: data or logs' })
	}
	if (!data?.timestamp) {
		return c.json(200, { data: null, error: 'timestamp is required' })
	}
	if (!data?.mode) {
		return c.json(200, { data: null, error: 'mode is required' })
	}

	let port = 0;
	let site_domain = '';
	let lookup;
	try {
		// check if the user is the owner of the instance
		lookup = arrayOf(
			new DynamicModel({
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`select owner, ownertype, port, site_domain
						from instance_view 
						where instance_view.id = '${data?.instance_id}'`
			)
			.all(lookup) // throw an error on db failure
		if (lookup.length === 0) {
			return c.json(200, { data: null, error: 'project instance not found' })
		}
		// get the id of the newly inserted project
		if (lookup[0].owner !== user?.id) {
			return c.json(200, { data: null, error: 'not the owner of this project' })
		} else {
			port = lookup[0].port
			site_domain = lookup[0].site_domain
		}
	} catch (lookupError) {
		const error_to_return = lookupError.value.error()
		return c.json(200, {
			data: null,
			error: error_to_return || JSON.stringify(lookupError),
		})
	}

	function convertToUTC(dateString) {
		// Create a Date object from the local date string
		var localDate = new Date(dateString);
	
		// Calculate the UTC offset for PST
		// Note: Adjust this offset for Daylight Saving Time if necessary
		var utcOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
	
		// Add the offset to the local time
		var utcDate = new Date(localDate.getTime() + utcOffset);
	
		return utcDate.toISOString();
	}
	// convert timestamp from local time to UTC
	let UTCtimestamp;
	if (data.timestamp !== 'latest') {
	 	UTCtimestamp = convertToUTC(data.timestamp)
	}
	console.log(JSON.stringify({
		url: `http://${site_domain}:5000/pitr`,
		method: 'POST',
		body: JSON.stringify({
			db: data.db,
			timestamp: UTCtimestamp || 'latest', //data.timestamp,
			mode: data.mode,
			port: port.toString(),
		}
		),
		headers: {
			'content-type': 'application/json',
			Authorization: 'your_predefined_auth_token',
		},
		timeout: 120, // in seconds
	},null,2))
	
	console.log('data.timestamp', data.timestamp)
	console.log('UTCtimestamp', UTCtimestamp)

	const res = $http.send({
			url: `http://${site_domain}:5000/pitr`,
			method: 'POST',
			body: JSON.stringify({
				db: data.db,
				timestamp: UTCtimestamp || 'latest', //data.timestamp,
				mode: data.mode,
				port: port.toString(),
			}
			),
			headers: {
				'content-type': 'application/json',
				Authorization: 'your_predefined_auth_token',
			},
			timeout: 120, // in seconds
		})
		// if data.mode is "download", return the response as a file
		if (res.json?.error) {
			return c.json(200, { data: null, error: res.json.error })
		} else {
			return c.json(200, { data: res, error: null })
		}	
})


