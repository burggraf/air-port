routerAdd('POST', '/createproject', (c) => {
	console.log('createproject 01')
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	console.log('createproject 01A')
	// try {
		const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	// } catch (e) {
	// 	console.log('setup updateroutes error', e)
	// }
	console.log('createproject 02')

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
	if (!user.verified) {
		return c.json(200, { data: null, error: 'user not verified' })
	}
	if (data?.project?.owner !== user?.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	if (!data?.project?.name) {
		return c.json(200, { data: null, error: 'project name is required' })
	}
	if (data?.project?.ownertype !== 'person' && data?.project?.ownertype !== 'org') {
		return c.json(200, { data: null, error: 'ownertype must be "person" or "org"' })
	}
	if (!data?.project?.domain) {
		return c.json(200, { data: null, error: 'domain is required' })
	}
	if (!data?.project_instance?.site_id) {
		return c.json(200, { data: null, error: 'site id is required' })
	}
	if (!data?.project_instance?.domain) {
		return c.json(200, { data: null, error: 'domain is required' })
	}
	if (
		data?.project_instance?.type !== 'primary' &&
		data?.project_instance?.type !== 'replica'
	) {
		return c.json(200, { data: null, error: 'type must be "primary" or "replica"' })
	}
	console.log('createproject 03')
	// get new port number
	let newPort;
	const { data: portData, error: portError } = 
		select({value: ''},
		`update settings set value = (CAST(value as integer) + 1) where name = 'MAX_PORT' returning value`);
	if (portError) return c.json(200, { data: null, error: 'error getting port' })
	if (portData.length !== 1) {
		const { data: insertSettingsData, error: insertSettingsError } = execute(`insert into settings (name, value) values ('MAX_PORT', '10002')`)
		if (insertSettingsError) return c.json(200, { data: null, error: 'error inserting port' })
		newPort = "10002";
	} else {
		newPort = portData[0].value;
	}
	try {
		// create the project record
		const projectInsert = arrayOf(
			new DynamicModel({
				id: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`insert into projects (name, owner, ownertype, domain, port, type) 
                    values ('${data?.project?.name}', 
					'${data?.project?.owner}', 
					'${data?.project?.ownertype}', 
					'${data?.project?.domain}',
					${newPort},
					'${data?.project?.type || "production"}')
                    returning id`
			)
			.all(projectInsert) // throw an error on db failure
		console.log('createproject: projectInsert', JSON.stringify(projectInsert, null, 2))
		if (projectInsert.length !== 1) {
			return c.json(200, { data: null, error: 'project insert failed' })
		}
		// get the id of the newly inserted project
		const newId = projectInsert[0].id
		// create the project_instance record
		console.log('createproject 04')
		console.log('newId', newId)
		console.log('newPort', newPort)
		const project_instancesInsert = arrayOf(
			new DynamicModel({
				id: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`insert into project_instance (project_id, site_id, port, type, domain, instance_status) 
                    values ('${newId}', 
                    '${data?.project_instance?.site_id}',
					${newPort}, 
                    '${data?.project_instance?.type}',
                    '${data?.project_instance?.domain}',
					'online')
                    returning id`
			)
			.all(project_instancesInsert) // throw an error on db failure
		console.log('createproject 05')

		if (project_instancesInsert.length !== 1) {
			return c.json(200, { data: null, error: 'project_instances insert failed' })
		}
		const newProjectInstanceId = project_instancesInsert[0].id
		// now use (data?.project?.domain) and (newPort) to create the nginx config file
		console.log('now create new entry for:')
		console.log('domain', data?.project_instance?.domain)
		console.log('port', newPort)
		console.log('site domain', data?.project_instance?.site_domain)
		// update: /etc/nginx/domain_ports.txt
		/*
        const cmd = $os.cmd(
			'ssh',
			`ubuntu@${data?.site?.domain}`,
			`echo "${data?.project?.domain}.${data?.site?.domain}  ${newPort};" | sudo tee -a /etc/nginx/domain_ports.txt && sudo kill -HUP \$(cat /var/run/nginx.pid)`
		)
		console.log(JSON.stringify(cmd, null, 2))
		const output = String.fromCharCode(...cmd.output())
        */

		console.log('createproject 06')
		console.log('calling updateroutes', newId, user?.id)
		const { data: updateroutesData, error: updateroutesError } = updateroutes(newId, user?.id)
		console.log('updateroutesData', JSON.stringify(updateroutesData,null,2))
		console.log('updateroutesError', JSON.stringify(updateroutesError,null,2))
		if (updateroutesError) {
			return c.json(200, { data: null, error: updateroutesError })
		} else {
			return c.json(200, { data: newProjectInstanceId, error: null })
		}

	} catch (projectInsertError) {
		console.log('projectInsertError', projectInsertError)
		return c.json(200, { data: null, error: projectInsertError?.value?.error() || projectInsertError })
	}
})


