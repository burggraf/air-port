/// <reference path="../pb_data/types.d.ts" />

// **** add ssh keys to an instance ****
routerAdd('POST', '/clone', (c) => {
	console.log('clone 01')
	const { updateroutes, sync } = require(`${__hooks}/modules/callbackend.js`)
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	console.log('clone 02')
	const data = $apis.requestInfo(c).data

	const source_id = data?.source_id;
	const destination_id = data?.destination_id;
	const direction = data?.direction;
	const excludes = data?.excludes;
	console.log('clone 03: source_id, destination_id, direction, excludes', source_id, destination_id, direction, excludes)
	if (!source_id) {
		return c.json(200, { data: null, error: 'source_id is required' })
	}
	if (!excludes) {
		return c.json(200, { data: null, error: 'excludes is required' })
	}
	if (!destination_id) {
		return c.json(200, { data: null, error: 'destination_id is required' })
	}
	if (!direction || (direction !== 'up' && direction !== 'down')) {
		return c.json(200, { data: null, error: 'direction must be up or down' })
	}

	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	console.log('clone 04')
	let source;
	try {
		const sourceData = arrayOf(
			new DynamicModel({
				type: '',
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
				project_id: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`SELECT type, owner, ownertype, port, site_domain, project_id
				from instance_view
				where id = '${source_id}' limit 1` 
			)
			.all(sourceData) // throw an error on db failure
		if (sourceData.length === 0) {
			return c.json(200, { data: null, error: 'source instance not found' })
		}
		if (sourceData[0].owner !== user.id) {
			return c.json(200, { data: null, error: 'you are not the source project instance owner' })
		}
		source = sourceData[0]
	} catch (sourceError){
		return c.json(200, { data: null, error: sourceError.value.error() || sourceError })
	}
	console.log('clone 06')
	let destination;
	try {
		const destinationData = arrayOf(
			new DynamicModel({
				type: '',
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
				project_id: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`SELECT type, owner, ownertype, port, site_domain, project_id
				from instance_view
				where id = '${destination_id}' limit 1` 
			)
			.all(destinationData) // throw an error on db failure
		if (destinationData.length === 0) {
			return c.json(200, { data: null, error: 'destination instance not found' })
		}
		if (destinationData[0].owner !== user.id) {
			return c.json(200, { data: null, error: 'you are not the destination project instance owner' })
		}
		destination = destinationData[0]
	} catch (destinationError){
		return c.json(200, { data: null, error: destinationError.value.error() || destinationError })
	}
	console.log('clone 08')
	// take the source and destination instance offline
	const { data: offlineData, error: offlineError } = 
		execute(`update project_instance 
				set instance_status = 'offline' 
				where id in ('${source_id}','${destination_id}')`);
	console.log('clone 09: offlineData, offlineError', offlineData, offlineError)
	if (offlineError) return c.json(200, { data: null, error: offlineError })
	const { data: offlineRoutes1, error: offlineRoutesError1 } = 
		updateroutes(source.project_id, user?.id);
	console.log('clone 10: offlineRoutes1, offlineRoutesError1', offlineRoutes1, offlineRoutesError1)
	if (offlineRoutesError1) return c.json(200, { data: null, error: offlineRoutesError1 })
	if (source.project_id !== destination.project_id) {
		const { data: offlineRoutes2, error: offlineRoutesError2 } = 
			updateroutes(destination.project_id, user?.id);
		if (offlineRoutesError2) return c.json(200, { data: null, error: offlineRoutesError2 })
	}
	console.log('clone 11')
	const doSyncs = async () => {
		// add to excludes
		excludes.push('/.ssh/**');
		excludes.push('/marmot/**');
		let excludesString = '';
		for (let i = 0; i < excludes.length; i++) {
			excludesString += ` --exclude ${excludes[i]}`
		}
		// copy source UP
		let command = `sync ${source.port} la:azabab/${source.port}/sync ${excludesString}`

		const { data: syncUpData, error: syncUpError } = 
			await sync(command, source.site_domain);
		if (syncUpError) return c.json(200, { data: null, error: syncUpError })
		// copy destination DOWN
	 	command = `sync la:azabab/${source.port}/sync ${destination.port} ${excludesString}`
		const { data: syncDownData, error: syncDownError } = 
			await sync(command, destination.site_domain);
		if (syncDownError) return c.json(200, { data: null, error: syncUpError })
		// delete the clone data
		// this will use the port of the SOURCE
		command = `delete la:azabab/${source.port}/sync`
		const { data: deleteData, error: deleteError } = 
			await sync(command, source.site_domain);
		if (deleteError) return c.json(200, { data: null, error: deleteError })

		// take the source and destination instance online
		const { data: offlineData, error: offlineError } = 
			execute(`update project_instance 
					set instance_status = 'online' 
					where id in ('${source_id}','${destination_id}')`);
		if (offlineError) return c.json(200, { data: null, error: offlineError })
		const { data: offlineRoutes1, error: offlineRoutesError1 } = 
			updateroutes(source.project_id, user?.id);
		if (offlineRoutesError1) return c.json(200, { data: null, error: offlineRoutesError1 })
		if (source.project_id !== destination.project_id) {
			const { data: offlineRoutes2, error: offlineRoutesError2 } = 
				updateroutes(destination.project_id, user?.id);
			if (offlineRoutesError2) return c.json(200, { data: null, error: offlineRoutesError2 })
		}
		return c.json(200, { data: 'OK', error: null })
	}
	doSyncs();
})

