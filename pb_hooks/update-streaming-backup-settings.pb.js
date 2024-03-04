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
		{ userid: '', metadata: {}, Domain: '', private_ip: ''},
		`select userid, metadata, Domain, private_ip from machines where machine_id = '${machine_id}'`
	)
	if (machineDataError) return c.json(200, { data: null, error: 'cannot check userid' })
	if (machineData.length !== 1) return c.json(200, { data: null, error: 'machine not found' })
	if (machineData[0].userid !== userid) return c.json(200, { data: null, error: 'not your machine' })
	const Domain = machineData[0].domain
	const private_ip = machineData[0].private_ip
	// update pitr
	let metadata = machineData[0].metadata || "{}"
	if (JSON.stringify(metadata) === "{}") {
		metadata = {}
	} else {
		metadata = JSON.parse(JSON.stringify(metadata))
	}
	if (!metadata?.pitr) { metadata.pitr = {} }
	metadata.pitr = pitr
	const { data: updateData, error: updateError } = execute(
		`update machines set metadata = '${JSON.stringify(metadata)}' where machine_id = '${machine_id}'`
	)
	if (updateError) return c.json(200, { data: null, error: 'error updating metadata' })
	const bucket = metadata.pitr?.bucket || 'air-port-sjc'
	const path = metadata.pitr?.path || 'litestream/'+Domain
	const endpoint = metadata.pitr?.endpoint || ''
	const access_key_id = metadata.pitr?.access_key_id || ''
	const secret_access_key = metadata.pitr?.secret_access_key || ''
	const retention = metadata.pitr?.retention || '24'
	const snapshot_interval = metadata.pitr?.snapshot_interval || '24'
	const sync_interval = metadata.pitr?.sync_interval || '30'
	const force_path_style = metadata.pitr?.force_path_style || true

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
	let cmd;
	if (metadata.pitr.data_enabled || metadata.pitr.logs_enabled) {
		cmd = `/bin/sh -c "cat << EOF > /pb/litestream.yml\n${config_file}\nEOF"`
	} else {
		cmd = `/bin/sh -c "rm -f /pb/litestream.yml"`
	}
	const { data: putConfigData, error: putConfigError } = await runRemote(
		Domain,
		machine_id,
		private_ip,
		cmd
	)
	if (putConfigError) return c.json(200, { data: null, error: putConfigError })
	return c.json(200, { data: 'OK', error: null })
})


