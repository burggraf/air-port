// enable replication for a project by copying /marmot.toml to /pb/marmot.toml
routerAdd('GET', '/remove-machine/:machine_id', async (c) => {
	console.log('remove-machine 00')
	const { select, execute } = require(`${__hooks}/modules/sql.js`)
	console.log('remove-machine 00a')
	const config = require(`${__hooks}/config.json`)
	const machine_id = c.pathParam('machine_id')
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) return c.json(200, { data: null, error: 'not logged in' })
	if (!user.verified) return c.json(200, { data: null, error: 'user not verified' })
	if (!machine_id) return c.json(200, { data: null, error: 'machine_id is required' })
	const userid = user?.id
	// check ownership
	console.log('remove-machine 01')
	// get all machine data
	const { data: machineData, error: machineDataError } = select(
		{ private_ip: '', machine_id: '', is_primary: false, config: {}, userid: '' },
		`select private_ip, machine_id, is_primary, config, userid from machines where machine_id = '${machine_id}'`
	)
	console.log('machineData', JSON.stringify(machineData, null, 2))
	console.log('machineDataError', JSON.stringify(machineDataError, null, 2))
	console.log('remove-machine 02')
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine(s) data' })
	console.log('remove-machine 02a')
	if (machineData.length < 1) return c.json(200, { data: null, error: 'machine not found' })
	console.log('remove-machine 02b')
	if (machineData[0].userid !== userid)
		return c.json(200, { data: null, error: 'not your machine' });
	console.log('remove-machine 02c')
	if (machineData[0].is_primary)
		return c.json(200, { data: null, error: 'cannot remove the primary machine' });
	let volume
	try {
		const parsedConfig = JSON.parse(JSON.stringify(machineData[0].config))
		volume = parsedConfig.mounts[0]?.volume

	} catch (err) {
		console.log('could not get volume', err)
		return c.json(200, { data: null, error: err })
	}
	if (!volume) return c.json(200, { data: null, error: 'volume not found' })
	let cmd
	let output
	console.log('remove-machine 03')

	// REMOVE THE MACHINE
	try {
		cmd = $os.cmd(
			`fly`,
			`machines`,
			`destroy`,
			`${machine_id}`,
			`--force`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`
		)
		console.log('cmd', cmd)
		output = String.fromCharCode(...cmd.output())
		console.log('fly machines destroy output: ', output)
	} catch (err) {
		console.log('could not destroy machine', err)
		return c.json(200, { data: null, error: err })
	}
	console.log('remove-machine 04')
	// REMOVE THE VOLUME
	try {
		cmd = $os.cmd(
			`fly`,
			`volumes`,
			`destroy`,
			`${volume}`,
			`-y`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`
		)
		output = String.fromCharCode(...cmd.output())
		console.log('fly volumes destroy output: ', output)
	} catch (err) {
		console.log('could not destroy volume', err)
		return c.json(200, { data: null, error: err })
	}
	console.log('remove-machine 05')
	// REMOVE THE MACHINE RECORD
	const { data: deleteMachineData, error: deleteMachineError } = execute(
		`delete from machines where machine_id = '${machine_id}'`
	)
	if (deleteMachineError) {
		console.log('error -- could not delete machine record', deleteMachineError)
		return c.json(200, { data: null, error: deleteMachineError })
	}
	return c.json(200, { data: 'ok', error: null })
})
