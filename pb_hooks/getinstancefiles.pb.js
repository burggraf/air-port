/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/getinstancefiles/:project_instance_id', (c) => {
	console.log('getinstancefiles 01')
	const project_instance_id = c.pathParam('project_instance_id')
	console.log('project_instance_id', project_instance_id)
	if (!project_instance_id) {
		return c.json(200, { data: null, error: 'project_instance_id is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	console.log('getinstancefiles 02')	
	console.log(`SELECT sites.domain as site,port 
	from project_instance 
	join sites on project_instance.site_id = sites.id
	join projects on project_instance.project_id = projects.id
	where project_instance.id = '${project_instance_id}' 
		and projects.owner = '${user.id}'`
	);

	const sites = arrayOf(
		new DynamicModel({
			site: '',
			port: 0,
		})
	)
	$app
		.dao()
		.db()
		.newQuery(
			`SELECT sites.domain as site, project_instance.port 
			from project_instance 
			join sites on project_instance.site_id = sites.id
			join projects on project_instance.project_id = projects.id
			where project_instance.id = '${project_instance_id}' 
				and projects.owner = '${user.id}'`
		)
		.all(sites) // throw an error on db failure

	console.log(`http://${sites[0].site}:5000/getinstancefiles?port=${sites[0].port}`);
	try {
		let res;
		try {
			res = $http.send({
				url:     `http://${sites[0].site}:5000/getinstancefiles?port=${sites[0].port}`,
				method:  "GET",
				// body:    JSON.stringify({
				// 	"username": keys[0].username, 
				// 	"port": keys[0].port.toString(),
				// 	"ssh_keys": ssh_key_string,
				// }),
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
		return c.json(res.statusCode, {data: res?.raw, error: null})
	
	} catch (e) {
		return c.json(200, { data: null, error: createUserError.value.error() })
	}

		
})

