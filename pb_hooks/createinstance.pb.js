routerAdd('POST', '/createinstance', async (c) => {
	console.log('*************************')
	console.log('*** createinstance    ***')
	console.log('*************************')
	const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	console.log('*** createinstance 01')
	// read the body via the cached request object
	// (this method is commonly used in hook handlers because it allows reading the body more than once)
	const data = $apis.requestInfo(c).data

	const info = $apis.requestInfo(c)
	// const admin  = info.admin;      // empty if not authenticated as admin
	const user = info.authRecord // empty if not authenticated as regular auth record
	// console.log('info', JSON.stringify(info, null, 2));
	// console.log('admin', JSON.stringify(admin, null, 2));
	console.log('*** createinstance 02')

	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!user.verified) {
		return c.json(200, { data: null, error: 'user not verified' })
	}
	if (!data?.project_instance) {
		return c.json(200, { data: null, error: 'project_instance is required' })
	}
	if (!data?.project_instance?.project_id) {
		return c.json(200, { data: null, error: 'project_id is required' })
	}
	if (data?.project_instance?.owner !== user?.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	if (data?.project_instance?.type !== 'read write replica' && 
		data?.project_instance?.type !== 'read only replica') {
		return c.json(200, { data: null, error: 'invalid project type' })
	}
	console.log('*** createinstance 03')

	try {
		// create the projectData record
		const projectData = arrayOf(
			new DynamicModel({
				id: '',
				port: 0,
				domain: '',
				name: '',
				owner: '',
				ownertype: ''
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`select id, port, domain, name, owner, ownertype from projects where id = '${data?.project_instance?.project_id}'`
			)
			.all(projectData) // throw an error on db failure
		console.log('*** createinstance 04')
		console.log('projectData', JSON.stringify(projectData, null, 2))

		if (projectData.length !== 1) {
			return c.json(200, { data: null, error: 'project not found' })
		}
		if (projectData[0].owner !== user.id) {
			return c.json(200, { data: null, error: 'not your project' })
		}
		if (projectData[0].ownertype !== data?.project_instance?.ownertype) {
			return c.json(200, { data: null, error: 'project ownertype mismatch' })
		}
		if (projectData[0].domain !== data?.project_instance?.domain) {
			return c.json(200, { data: null, error: 'project domain mismatch' })
		}
		if (projectData[0].name !== data?.project_instance?.name) {
			return c.json(200, { data: null, error: 'project name mismatch' })
		}
		if (projectData[0].port !== data?.project_instance?.port) {
			return c.json(200, { data: null, error: 'project port mismatch' })
		}
	} catch (projectDataError) {
		console.log('projectDataError', projectDataError)
		return c.json(200, { data: null, error: projectDataError?.value?.error() || projectDataError })
	}
	console.log('*** createinstance 05')

	let site_domain = '';
	// get the site info
	let siteData;
	try {
		siteData = arrayOf(
			new DynamicModel({
				domain: '',
				code: '',
				name: '',
				active: false
			})
		)
		$app			
			.dao()
			.db()
			.newQuery(
				`select code, name, domain, active from sites where id = '${data?.project_instance?.site_id}'`
			)
			.all(siteData) // throw an error on db failure
		if (siteData.length !== 1) {
			return c.json(200, { data: null, error: 'site not found' })
		} else if (siteData[0].active !== true) {
			return c.json(200, { data: null, error: 'site not active' })
		} else {
			site_domain = siteData[0].domain;
		}
	} catch (siteDataError) {
		console.log('siteDataError', siteDataError)
		return c.json(200, { data: null, error: siteDataError?.value?.error() || siteDataError })
	}
	console.log('*** createinstance 06')

	console.log('*************************')
	console.log('siteData', JSON.stringify(siteData, null, 2))
	console.log('*************************')

	let newId = '';
	try {
		// create the project_instance record
		const instanceInsert = arrayOf(
			new DynamicModel({
				id: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`insert into project_instance (project_id, site_id, port, type, domain, 
					db_streaming_backup_location, db_streaming_backup_retention, 
					logs_streaming_backup_location, logs_streaming_backup_retention, instance_status) 
                    values (
						'${data?.project_instance?.project_id}',
						'${data?.project_instance?.site_id}',
						${data?.project_instance?.port},
						'${data?.project_instance?.type}',
						'${data?.project_instance?.domain}',
					    '',0,'',0,'online' 
					)
					returning id`
			)
			.all(instanceInsert) // throw an error on db failure
		if (instanceInsert.length !== 1) {
			return c.json(200, { data: null, error: 'project instance insert failed' })
		} else {
			// get the id of the newly inserted instance
			newId = instanceInsert[0].id
		}
	} catch (projectInsertError) {
		console.log('projectInsertError', projectInsertError)
		return c.json(200, { data: null, error: projectInsertError?.value?.error() || projectInsertError })
	}
	console.log('*** createinstance 07')

	console.log('*************************')
	console.log('newId', newId)
	console.log('*************************')


	console.log('creatinstance now calling updateroutes')
	console.log('*** createinstance 08')

	console.log('data?.project_instance?.project_id', data?.project_instance?.project_id)
	console.log('*** createinstance 09')
	console.log('user?.id', user?.id)
	console.log('*** createinstance 10')

	const { data: updateroutesData, error: updateroutesError } = 
		updateroutes(data?.project_instance?.project_id, user?.id)
	console.log('createinstance updateroutesData', JSON.stringify(updateroutesData,null,2))
	console.log('createinstance updateroutesError', JSON.stringify(updateroutesError,null,2))
	if (updateroutesError) {
		return c.json(200, { data: null, error: updateroutesError })
	} else {
		return c.json(200, { data: newId, error: null })
	}

})


