routerAdd('POST', '/get-litestream-file', async (c) => {
	const { select, execute } = require(`${__hooks}/modules/sql.js`)
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)

	const data = $apis.requestInfo(c).data

	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	/**
		Domain: machine.Domain,
		machine_id: machine.machine_id,
		primary_ip: machine.private_ip,
		restoreDBType: restoreDBType,
	 */
	if (!data?.Domain) return c.json(200, { data: null, error: 'Domain is required' })
	if (!data?.machine_id) return c.json(200, { data: null, error: 'machine_id is required' })
	if (!data?.private_ip) return c.json(200, { data: null, error: 'private_ip is required' })
	if (!data?.restoreDBType) return c.json(200, { data: null, error: 'restoreDBType is required' })
	if (!data?.generation_id) return c.json(200, { data: null, error: 'generation_id is required' })
	if (!data?.timestamp) return c.json(200, { data: null, error: 'timestamp is required' })
	const Domain = data.Domain
	const machine_id = data.machine_id
	const private_ip = data.private_ip
	const restoreDBType = data.restoreDBType
	const generation_id = data.generation_id
	const timestamp = data.timestamp
	// get owner of machine
	const { data: machineData, error: machineDataError } = select(
		{ userid: ''},
		`select userid from machines where machine_id = '${machine_id}'`
	)
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine data' })
	if (machineData.length !== 1) return c.json(200, { data: null, error: 'machine not found' })
	if (machineData[0].userid !== user.id) return c.json(200, { data: null, error: 'not your project' })

	console.log(`litestream restore -config /pb/litestream.yml -o /pb/pb_data/backups/PITR-${timestamp}.db -generation ${generation_id} -timestamp ${timestamp} /pb/pb_data/${restoreDBType}.db`);
	try {
		console.log('RUN 01', Domain, machine_id, private_ip, restoreDBType)
		const { data: restoreData, error: restoreError } = await runRemote(
			Domain,
			machine_id,
			private_ip,
			`litestream restore -config /pb/litestream.yml -o /pb/pb_data/backups/PITR-${timestamp}.${restoreDBType}.db -generation ${generation_id} -timestamp ${timestamp} /pb/pb_data/${restoreDBType}.db`
		)
		console.log('restoreData', JSON.stringify(restoreData, null, 2))
		/*
		// litestream restore 
		// 		-config /pb/litestream.yml 
		//		-o /pb/tmp001.db 
		// 		-generation xxxxxxxxxxxx 
		// 		-timestamp 2024-03-04T13:10:56Z 
		//		/pb/pb_data/data.db
		*/
		if (restoreError) return c.json(200, { data: null, error: restoreError })
		return c.json(200, { data: "OK", error: null })	

	} catch (error) {
		console.log('try/catch error', JSON.stringify(error))
		return c.json(200, { data: null, error: error })
	}
	// restore:
	// litestream restore -config /pb/litestream.yml -o <OUTPUT_PATH> -generation <GENERATION> /pb/pb_data/data.db
})


