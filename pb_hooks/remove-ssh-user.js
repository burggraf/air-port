/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/remove-ssh-user/:project_instance_id', (c) => {
	const project_instance_id = c.pathParam('project_instance_id')
	if (!project_instance_id) {
		return c.json(200, { data: null, error: 'project_instance_id is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}

	const data = arrayOf(
		new DynamicModel({
			site: '',
			username: '',
			port: 0,
		})
	)
	$app
		.dao()
		.db()
		.newQuery(
			`SELECT sites.domain as site,project_instance.domain as username,port,key from project_instance_keys 
			join project_instance on project_instance.id = project_instance_keys.project_instance_id 
			join sites on project_instance.site_id = sites.id
			where project_instance_keys.project_instance_id = '${project_instance_id}' 
				and project_instance_keys.user_id = '${user.id}'`
		)
		.all(data) // throw an error on db failure
		console.log('data', JSON.stringify(data,null,2))

	// console.log('ssh_key_string', ssh_key_string)
	// if (ssh_key_string.length === 0) {
	// 	return c.json(200, { data: null, error: 'no keys found' })
	// }

	console.log('data[0].site', data[0].site)
	console.log('data[0].username', data[0].username)
	console.log('data[0].port', data[0].port)
	try {
		let res;
		try {
			res = $http.send({
				url:     `http://${keys[0].site}:5000/removeuser`,
				method:  "POST",
				body:    JSON.stringify({
					"username": keys[0].username, 
					"port": keys[0].port.toString(),
				}),
				headers: {
					"content-type": "application/json",
					"Authorization": "your_predefined_auth_token"
				},
				timeout: 120, // in seconds
			})	
		} catch (httpError) {
			// console.log('httpError', httpError)
			return c.json(200, { data: null, error: httpError.value.error() })
		}
        console.log('res', JSON.stringify(res,null,2))
		return c.json(res.statusCode, res.json)
	
	} catch (e) {
		console.log('e', createUserError.value.error())
		return c.json(200, { data: null, error: createUserError.value.error() })
	}

		
})

