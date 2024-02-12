routerAdd('POST', '/get-litestream-generations', async (c) => {
	// read the body via the cached request object
	// (this method is commonly used in hook handlers because it allows reading the body more than once)
	const data = $apis.requestInfo(c).data

	const info = $apis.requestInfo(c)
	// const admin  = info.admin;      // empty if not authenticated as admin
	const user = info.authRecord // empty if not authenticated as regular auth record
	// console.log('info', JSON.stringify(info, null, 2));
	// console.log('admin', JSON.stringify(admin, null, 2));
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!data?.instance_id) {
		return c.json(200, { data: null, error: 'instance_id required' })
	}
	if (!data?.db || (data?.db !== 'data' && data?.db !== 'logs')) {
		return c.json(200, { data: null, error: 'db required (must be: data or logs)' })
	}
	try {
		// get the port of the instance_id
		const instance = arrayOf(
			new DynamicModel({
				port: '',
				owner: '',
				ownertype: '',
				site_domain: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`select port, owner, ownertype, site_domain from instance_view where id = '${data?.instance_id}'`
			)
			.all(instance) // throw an error on db failure
		if (instance.length === 0) {
			return c.json(200, { data: null, error: 'instance_id not found' })
		}
		if (instance[0].owner !== user.id) {
			return c.json(200, { data: null, error: 'not your instance_id' })
		}
		// get the id of the newly inserted project
		const res = $http.send({
			url: `http://${instance[0]?.site_domain}:5000/getlitestreamgenerations`,
			method: 'POST',
			body: JSON.stringify({
				db: data?.db,
				port: instance[0]?.port.toString(),
			}),
			headers: {
				'content-type': 'application/json',
				Authorization: 'your_predefined_auth_token',
			},
			timeout: 120, // in seconds
		})
		console.log('res', JSON.stringify(res, null, 2))
		if (res.json?.error) {
			return c.json(200, { data: null, error: res.json.error })
		} else {
			return c.json(200, { data: res?.json?.data, error: null })
		}
	} catch (instanceError) {
		console.log('instanceError', instanceError)
		const error_to_return = instanceError?.value?.error() || instanceError
		return c.json(200, { data: null, error: error_to_return })
	}
})


