const { config } = require("localforage")

routerAdd('POST', '/update-streaming-backup-settings', async (c) => {
	console.log('update-streaming-backup-settings')
	const { select, execute } = require(`${__hooks}/modules/sql.js`)
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)

	const data = $apis.requestInfo(c).data
	console.log('data', JSON.stringify(data))
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!data?.machine_id) {
		return c.json(200, { data: null, error: 'machine_id is required' })
	}
	if (!data?.pitr) {
		return c.json(200, { data: null, error: 'pitr is required' })
	}
	const machine_id = data.machine_id
	const pitr = data.pitr
	const userid = user?.id
	// check ownership
	const { data: machineData, error: machineDataError } = select(
		{ userid: '', metadata: {}, Domain: '' },
		`select userid, metadata, Domain from machines where machine_id = '${machine_id}'`
	)
	if (machineDataError) return c.json(200, { data: null, error: 'cannot check userid' })
	if (machineData.length !== 1) return c.json(200, { data: null, error: 'machine not found' })
	if (machineData[0].userid !== userid) return c.json(200, { data: null, error: 'not your machine' })
	console.log('machineData', JSON.stringify(machineData, null, 2))
	const Domain = machineData[0].domain
	// update pitr
	let metadata = machineData[0].metadata || "{}"
	console.log('*** metadata (stringified, type)', JSON.stringify(metadata), typeof metadata)
	console.log('JSON.stringify(metadata) === "{}"', JSON.stringify(metadata) === "{}")
	if (JSON.stringify(metadata) === "{}") {
		console.log('set metadata = {} here')
		metadata = {}
	} else {
		console.log('metadata is not empty set it to:', JSON.stringify(metadata))
		metadata = JSON.parse(JSON.stringify(metadata))
		// try {			
		// 	metadata = JSON.parse(metadata)
		// } catch (err) {
		// 	return c.json(200, { data: null, error: 'could not parse metadata' })
		// }	
	}
	console.log('metadata', metadata)
	console.log('metadata.pitr', metadata.pitr, JSON.stringify(metadata.pitr))
	if (!metadata?.pitr) { metadata.pitr = {} }
	console.log("metadata.pitr = pitr")
	metadata.pitr = pitr
	console.log('metadata is now', JSON.stringify(metadata));
	console.log(`update machines set metadata = '${JSON.stringify(metadata)}' where machine_id = '${machine_id}'`)
	const { data: updateData, error: updateError } = execute(
		`update machines set metadata = '${JSON.stringify(metadata)}' where machine_id = '${machine_id}'`
	)
	if (updateError) return c.json(200, { data: null, error: 'error updating metadata' })
	console.log('update result', JSON.stringify(updateData))
	const bucket = metadata.pitr?.bucket || 'air-port-sjc'
	console.log('bucket', bucket)
	const path = metadata.pitr?.path || 'litestream/'+Domain
	console.log('path', path)
	const endpoint = metadata.pitr?.endpoint || ''
	console.log('endpoint', endpoint)
	const access_key_id = metadata.pitr?.access_key_id || ''
	console.log('access_key_id', access_key_id)
	const secret_access_key = metadata.pitr?.secret_access_key || ''
	console.log('secret_access_key', secret_access_key)
	const retention = metadata.pitr?.retention || '24'
	console.log('retention', retention)
	const snapshot_interval = metadata.pitr?.snapshot_interval || '24'
	console.log('snapshot_interval', snapshot_interval)
	const sync_interval = metadata.pitr?.sync_interval || '30'
	console.log('sync_interval', sync_interval)
	const force_path_style = metadata.pitr?.force_path_style || true
	console.log('force_path_style', force_path_style)

	let config_file = `dbs:\n`
	if (metadata.pitr.data_enabled) {
		config_file +=
		`  - path: /pb/pb_data/data.db\n` +
		`    replicas:\n` +
		`      - type: s3\n` +
		`        bucket: ${bucket || 'air-port-sjc'}\n` +
		`        path: ${path ? path + '/data' : 'litestream/'+Domain+'/data'}\n` +
		`        endpoint: ${endpoint}\n` +
		`        access-key-id: ${access_key_id || ''}\n` +
		`        secret-access-key: ${secret_access_key || ''}\n` +
		`        retention: ${retention}h\n` +
		`        snapshot-interval: ${snapshot_interval || '24'}h\n` +
		`        sync-interval: ${sync_interval || '30'}s\n` +
		`        force-path-style: ${typeof force_path_style === 'boolean' ? force_path_style : true}\n`
	}
	if (metadata.pitr.logs_enabled) {
		config_file +=
		`  - path: /pb/pb_data/logs.db\n` +
		`    replicas:\n` +
		`      - type: s3\n` +
		`        bucket: ${bucket || 'air-port-sjc'}\n` +
		`        path: ${path ? path + '/logs' : 'litestream/'+Domain+'/logs'}\n` +
		`        endpoint: ${endpoint}\n` +
		`        access-key-id: ${access_key_id || ''}\n` +
		`        secret-access-key: ${secret_access_key || ''}\n` +
		`        retention: ${retention}h\n` +
		`        snapshot-interval: ${snapshot_interval || '24'}h\n` +
		`        sync-interval: ${sync_interval || '30'}s\n` +
		`        force-path-style: ${typeof force_path_style === 'boolean' ? force_path_style: true}\n`;
	}
	console.log('config_file:')
	console.log('****************************')
	console.log("\n" + config_file)
	console.log('****************************')

	return c.json(200, { data: 'OK', error: null })
})


