routerAdd('POST', '/update-streaming-backup-settings', async (c) => {
	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!data?.instance_id) {
		return c.json(200, { data: null, error: 'instance_id is required' })
	}
	// get existing codes (destinations) for data and logs in case we have to delete files
	let db_destination = ''
	let logs_destination = ''

	console.log(`select coalesce(data.code,'') as db_destination, coalesce(logs.code,'') as logs_destination 
	from project_instance 
	left outer join s3 as data on data.id = project_instance.db_streaming_backup_location 
	left outer join s3 as logs on logs.id = project_instance.logs_streaming_backup_location 
	where project_instance.id = '${data?.instance_id}'`);

	try {
		const destinationLookup = arrayOf(
			new DynamicModel({
				db_destination: '',
				logs_destination: '',
			})
		)
		$app
		.dao()
		.db()
		.newQuery(
			`select coalesce(data.code,'') as db_destination, coalesce(logs.code,'') as logs_destination 
			from project_instance 
			left outer join s3 as data on data.id = project_instance.db_streaming_backup_location 
			left outer join s3 as logs on logs.id = project_instance.logs_streaming_backup_location 
			where project_instance.id = '${data?.instance_id}'`
		).all(destinationLookup)
		if (destinationLookup.length > 0) {
			db_destination = destinationLookup[0].db_destination
			logs_destination = destinationLookup[0].logs_destination
		}
		console.log('db_destination', db_destination)
		console.log('logs_destination', logs_destination)
	} catch (destinationLookupError) {
			//removeProjectInstanceError.value.error()
			const error_to_return = destinationLookupError.value.error()
			return c.json(200, {
				data: null,
				error: error_to_return || JSON.stringify(destinationLookupError),
			})
	}

	console.log('update the project_instance record')


	console.log(`update project_instance 
	set db_streaming_backup_location = '${data?.data?.db_streaming_backup_location}',
	logs_streaming_backup_location = '${data?.data?.logs_streaming_backup_location}',
	db_streaming_backup_retention = '${data?.data?.db_streaming_backup_retention}',
	logs_streaming_backup_retention = '${data?.data?.logs_streaming_backup_retention}'
	where id = '${data?.instance_id}'`);

	// update the project_instance record
	try {
		$app
		.dao()
		.db()
		.newQuery(
			`update project_instance 
			set db_streaming_backup_location = '${data?.data?.db_streaming_backup_location}',
			logs_streaming_backup_location = '${data?.data?.logs_streaming_backup_location}',
			db_streaming_backup_retention = '${data?.data?.db_streaming_backup_retention}',
			logs_streaming_backup_retention = '${data?.data?.logs_streaming_backup_retention}'
			where id = '${data?.instance_id}'`
		).execute()
		console.log('done updating project_instance with streaming backup settings')
	} catch (update_project_instance_error) {
			//removeProjectInstanceError.value.error()
			const error_to_return = update_project_instance_error.value.error()
			return c.json(200, {
				data: null,
				error: error_to_return || JSON.stringify(update_project_instance_error),
			})
	}
	let port = 0;
	let site_domain = '';
	let lookup;
	try {
		console.log('lookup the instance view record')
		console.log(`select db_streaming_backup_location,
		logs_streaming_backup_location,
		coalesce(db.access_key_id,'') as db_access_key_id, 
		coalesce(db.endpoint,'') as db_endpoint, 
		coalesce(db.secret_access_key,'') as db_secret_access_key, 
		coalesce(logs.access_key_id,'') as logs_access_key_id, 
		coalesce(logs.endpoint,'') as logs_endpoint, 
		coalesce(logs.secret_access_key,'') as logs_secret_access_key, 
		owner, ownertype, port, site_domain, domain, 
		db_streaming_backup_retention,
		logs_streaming_backup_retention
		from instance_view 
		left outer join s3 as db on db.id = coalesce(db_streaming_backup_location,'') 
		left outer join s3 as logs on logs.id = coalesce(logs_streaming_backup_location,'')
		where instance_view.id = '${data?.instance_id}'`);

		// check if the user is the owner of the instance
		lookup = arrayOf(
			new DynamicModel({
				db_streaming_backup_location: '', 
				logs_streaming_backup_location: '',
				db_access_key_id: '',
				db_endpoint: '',
				db_secret_access_key: '',
				logs_access_key_id: '',
				logs_endpoint: '',
				logs_secret_access_key: '',
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
				domain: '',
				db_streaming_backup_retention: 0,
				logs_streaming_backup_retention: 0
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`select db_streaming_backup_location,
						logs_streaming_backup_location,
						coalesce(db.access_key_id,'') as db_access_key_id, 
						coalesce(db.endpoint,'') as db_endpoint, 
						coalesce(db.secret_access_key,'') as db_secret_access_key, 
						coalesce(logs.access_key_id,'') as logs_access_key_id, 
						coalesce(logs.endpoint,'') as logs_endpoint, 
						coalesce(logs.secret_access_key,'') as logs_secret_access_key, 
						owner, ownertype, port, site_domain, domain, 
						db_streaming_backup_retention,
						logs_streaming_backup_retention
						from instance_view 
						left outer join s3 as db on db.id = coalesce(db_streaming_backup_location,'') 
						left outer join s3 as logs on logs.id = coalesce(logs_streaming_backup_location,'')
						where instance_view.id = '${data?.instance_id}'`
			)
			.all(lookup) // throw an error on db failure
			console.log('got lookup', JSON.stringify(lookup,null,2))
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

	const payload = {files: []}
	if (lookup[0]?.db_access_key_id && lookup[0]?.db_access_key_id.length > 0) {
		payload.files.push({filename: `${port}-data`, destination: `${db_destination}`, contents: 
		`  - path: /home/ubuntu/data/${port}/pb_data/data.db\n` +
		`    replicas:\n` +
		`      - type: s3\n` +
		`        bucket: azabab\n` +
		//`        path: ${site_domain}/${port}-data\n` +
		//`        path: backups/${port}-data\n` +
		`        path: ${port}/litestream/${site_domain}/data\n` +
		`        endpoint: ${lookup[0]?.db_endpoint}\n` +
		`        access-key-id: ${lookup[0]?.db_access_key_id || ''}\n` +
		`        secret-access-key: ${lookup[0]?.db_secret_access_key || ''}\n` +
		`        retention: ${lookup[0]?.db_streaming_backup_retention}h\n` +
		`        snapshot-interval: 24h\n` +
		`        sync-interval: 30s\n` +
		`        force-path-style: true\n`
	})
	} else {
		payload.files.push({filename: `${port}-data`, destination: `${db_destination}`, contents: ""})
	}

	if (lookup[0]?.logs_access_key_id && lookup[0]?.logs_access_key_id.length > 0) {
		payload.files.push({filename: `${port}-logs`, destination: `${logs_destination}`, contents: 
		`  - path: /home/ubuntu/data/${port}/pb_data/logs.db\n` +
		`    replicas:\n` +
		`      - type: s3\n` +
		`        bucket: azabab\n` +
		// `        path: ${site_domain}/${port}-logs\n` +
		//`        path: backups/${port}-logs\n` +
		`        path: ${port}/litestream/${site_domain}/logs\n` +
		`        endpoint: ${lookup[0]?.logs_endpoint}\n` +
		`        access-key-id: ${lookup[0]?.logs_access_key_id || ''}\n` +
		`        secret-access-key: ${lookup[0]?.logs_secret_access_key || ''}\n` +
		`        retention: ${lookup[0]?.logs_streaming_backup_retention}h\n` +
		`        snapshot-interval: 24h\n` +
		`        sync-interval: 30s\n` +
		`        force-path-style: true\n`
	})
	} else {
		payload.files.push({filename: `${port}-logs`, destination: `${logs_destination}`, contents: ""})
	}

	/*
  - path: /home/ubuntu/data/<port>/pb_data/data.db
    replicas:
      - type: s3
        bucket: azabab
        path: <site_domain>/<port>-data
        endpoint: xxxx.xx.idrivee2-40.com
        access-key-id: xxxxxxxxxx
        secret-access-key: xxxxxxxxxxxxx
		retention: xxh
        force-path-style: true
	
	*/
	console.log('payload', JSON.stringify(payload,null,2))
	const res = $http.send({
			url: `http://${site_domain}:5000/updatelitestream`,
			method: 'POST',
			body: JSON.stringify(payload.files
				// {
				// domain: data?.project_instance?.domain + '.' + data?.project_instance?.site_domain,
				// port: newPort.toString(),
				// }
			),
			headers: {
				'content-type': 'application/json',
				Authorization: 'your_predefined_auth_token',
			},
			timeout: 120, // in seconds
		})
		if (res.json?.error) {
			return c.json(200, { data: null, error: res.json.error })
		} else {
			return c.json(200, { data: res, error: null })
		}
})


