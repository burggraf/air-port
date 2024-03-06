routerAdd('POST', '/get-litestream-wal', async (c) => {
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
	const Domain = data.Domain
	const machine_id = data.machine_id
	const private_ip = data.private_ip
	const restoreDBType = data.restoreDBType
	const generation_id = data.generation_id
	// get owner of machine
	const { data: machineData, error: machineDataError } = select(
		{ userid: ''},
		`select userid from machines where machine_id = '${machine_id}'`
	)
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine data' })
	if (machineData.length !== 1) return c.json(200, { data: null, error: 'machine not found' })
	if (machineData[0].userid !== user.id) return c.json(200, { data: null, error: 'not your project' })

	console.log(`litestream wal -config /pb/litestream.yml -generation ${generation_id} /pb/pb_data/${restoreDBType}.db`);
	try {
		console.log('RUN 01', Domain, machine_id, private_ip, restoreDBType)
		const { data: walData, error: walError } = await runRemote(
			Domain,
			machine_id,
			private_ip,
			`litestream wal -config /pb/litestream.yml -generation ${generation_id} /pb/pb_data/${restoreDBType}.db`
		)
		console.log('walData', JSON.stringify(walData, null, 2))
		/*
	   "replica  generation        index  offset  size  created
		s3       9f2e6c6daa23cf89  6      0       2329  2024-03-04T13:10:56Z
		s3       9f2e6c6daa23cf89  6      20632   2211  2024-03-04T13:11:00Z
		s3       9f2e6c6daa23cf89  6      45352   1096  2024-03-04T13:11:05Z
		s3       9f2e6c6daa23cf89  6      53592   5315  2024-03-04T13:11:10Z
		s3       9f2e6c6daa23cf89  6      98912   389   2024-03-04T13:11:15Z
		s3       9f2e6c6daa23cf89  6      107152  6154  2024-03-04T13:11:20Z
		s3       9f2e6c6daa23cf89  6      152472  394   2024-03-04T13:11:25Z
		s3       9f2e6c6daa23cf89  7      0       2483  2024-03-04T13:12:00Z
		s3       9f2e6c6daa23cf89  7      37112   1096  2024-03-04T13:12:05Z
		s3       9f2e6c6daa23cf89  8      0       2484  2024-03-04T13:13:00Z
		s3       9f2e6c6daa23cf89  8      37112   1096  2024-03-04T13:13:05Z"		
		*/
		if (walError) return c.json(200, { data: null, error: walError })
		const wal = walData.split('\n');
		for (let i = 0; i < wal.length; i++) {
			wal[i] = wal[i].replace(/\s+/g,' ').split(' ')
			if (wal[i].length !== 6) {
				wal.splice(i, 1)
			}
		}
		// remove header
		let output = []
		for (let i = 1; i < wal.length; i++) {
			//name  generation        lag        start                 end
			output.push({
				replica: wal[i][0],
				generation: wal[i][1],
				index: wal[i][2],
				offsite: wal[i][3],
				size: wal[i][4],
				created: wal[i][5]
			})
		}
		// sort on "start" as a string value
		output.sort((a, b) => a.created.localeCompare(b.start));
		console.log('NEW output', JSON.stringify(output, null, 2))	
		return c.json(200, { data: output, error: null })	

	} catch (error) {
		console.log('try/catch error', JSON.stringify(error))
		return c.json(200, { data: null, error: error })
	}
	// restore:
	// litestream restore -config /pb/litestream.yml -o <OUTPUT_PATH> -generation <GENERATION> /pb/pb_data/data.db
})


