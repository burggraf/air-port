/// <reference path="../pb_data/types.d.ts" />

// **** add ssh keys to an instance ****
routerAdd('GET', '/setup-marmot/:project_id', (c) => {
	// console.log('**** setup-marmot ****')
	const project_id = c.pathParam('project_id')
	if (!project_id) {
		return c.json(200, { data: null, error: 'project_id is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	try {
		const projectData = arrayOf(
			new DynamicModel({
				domain: '',
				type: '',
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
				node: 0,
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`SELECT domain, type, owner, ownertype, port, site_domain, node
				from instance_view
				where project_id = '${project_id}' order by type, site_domain` 
			)
			.all(projectData) // throw an error on db failure
			//console.log('projectData', JSON.stringify(projectData,null,2))
		if (projectData.length === 0) {
			return c.json(200, { data: null, error: 'project not found' })
		}
		if (projectData[0].owner !== user.id) {
			return c.json(200, { data: null, error: 'you are not the project owner' })
		}
		const template = `
# Variables to be replaced:
# <PORT> (e.g. 10001)
# <HOST> (nats server, e.g. west-1.azabab.com)
# <NODE> (e.g. 1)
# <READWRITE> (e.g. true or false for READONLY)
seq_map_path="/marmot/marmot.cbor"
db_path="/home/pocketbase/pb_data/data.db"
node_id=<NODE>

replicate=true
publish=<READWRITE>

[snapshot]
enabled=false

[nats]
urls=["nats://jetstream:pass@<HOST>:4222"]
subject_prefix="change-log-<PORT>"
stream_prefix="changes-<PORT>"
`;
		let counter = 0;
		for (let i = 0; i < projectData.length; i++) {
			const instance = projectData[i]
			// make a copy of the template
			let config_file = template
			// replace the variables
			config_file = config_file.replace(/<PORT>/g, instance.port.toString())
			config_file = config_file.replace(/<HOST>/g, instance.site_domain)
			config_file = config_file.replace(/<NODE>/g, instance.node.toString())
			config_file = config_file.replace(/<READWRITE>/g, (instance.type === 'read write replica' || instance.type === 'primary') ? 'true' : 'false')

			try {
				const res = $http.send({
					url:     `http://${instance.site_domain}:5000/setupmarmot`,
					method:  "POST",
					body:    JSON.stringify({
						"config_file": config_file,
						"port": instance.port.toString(),
					}),
					headers: {
						"content-type": "application/json",
						"Authorization": "your_predefined_auth_token"
					},
					timeout: 120, // in seconds
				})	
				//console.log('res', JSON.stringify(res,null,2))
				if (res.statusCode === 200) {
					counter++
				} else {
					return c.json(200, { data: null, error: res })
				}
			} catch (httpError) {
				// console.log('httpError', httpError)
				return c.json(200, { data: null, error: httpError.value.error() })
			}
		}
		return c.json(200, { data: 'ok:' + counter + ' instances processed', error: null })
	} catch (e){
		return c.json(200, { data: null, error: e.value.error() || e })
	}
		
})

