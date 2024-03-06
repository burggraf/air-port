routerAdd('POST', '/get-litestream-generations', async (c) => {
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
	const Domain = data.Domain
	const machine_id = data.machine_id
	const private_ip = data.private_ip
	const restoreDBType = data.restoreDBType
	// get owner of machine
	const { data: machineData, error: machineDataError } = select(
		{ userid: ''},
		`select userid from machines where machine_id = '${machine_id}'`
	)
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine data' })
	if (machineData.length !== 1) return c.json(200, { data: null, error: 'machine not found' })
	if (machineData[0].userid !== user.id) return c.json(200, { data: null, error: 'not your project' })

	console.log(`litestream generations -config /pb/litestream.yml /pb/pb_data/${restoreDBType}.db`);
	try {
		console.log('RUN 01', Domain, machine_id, private_ip, restoreDBType)
		const { data: generationsData, error: generationsError } = await runRemote(
			Domain,
			machine_id,
			private_ip,
			`litestream generations -config /pb/litestream.yml /pb/pb_data/${restoreDBType}.db`
		)
		if (generationsError) return c.json(200, { data: null, error: generationsError })
		const generations = generationsData.split('\n');
		for (let i = 0; i < generations.length; i++) {
			generations[i] = generations[i].replace(/\s+/g,' ').split(' ')
			if (generations[i].length !== 5) {
				generations.splice(i, 1)
			}
		}
		// remove header
		let output = []
		for (let i = 1; i < generations.length; i++) {
			//name  generation        lag        start                 end
			output.push({
				name: generations[i][0],
				generation: generations[i][1],
				lag: generations[i][2],
				start: generations[i][3],
				end: generations[i][4]
			})
		}
		// sort on "start" as a string value
		output.sort((a, b) => a.start.localeCompare(b.start));
		// console.log('NEW output', JSON.stringify(output, null, 2))	
		return c.json(200, { data: output, error: null })	

	} catch (error) {
		console.log('try/catch error', JSON.stringify(error))
		return c.json(200, { data: null, error: error })
	}

})


