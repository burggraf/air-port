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

	const ccc = {
		env: {
			FLY_PROCESS_GROUP: 'app',
			PRIMARY_REGION: 'sjc',
			SERVER_KEY: 'dc4d3d31-4eae-4b23-8d0f-1c24f31c0953',
			SSH_CONFIG_DIR: '/pb/.ssh',
		},
		guest: { cpu_kind: 'shared', cpus: 1, memory_mb: 256 },
		image:
			'registry.fly.io/air-port-dev:0.21.3@sha256:5d7d149bcaba30f090feb2d9d4974dc397e22a776ac6e49bcd2e7af4e3c9fcc4',
		init: {},
		metadata: {
			fly_flyctl_version: '0.2.9',
			fly_platform_version: 'v2',
			fly_process_group: 'app',
			fly_release_id: 'QgDeJ3o11V2D7fmgnPkPNLbaq',
			fly_release_version: '1',
		},
		mounts: [
			{ encrypted: true, name: 'pb_data', path: '/pb', size_gb: 1, volume: 'vol_nvxj08qo5je286n4' },
		],
		restart: {},
		services: [
			{
				autostart: true,
				autostop: true,
				concurrency: { hard_limit: 550, soft_limit: 500, type: 'requests' },
				force_instance_key: null,
				internal_port: 8080,
				min_machines_running: 0,
				ports: [
					{ force_https: true, handlers: ['http'], port: 80 },
					{ handlers: ['http', 'tls'], port: 443 },
				],
				protocol: 'tcp',
			},
		],
	}

	// REMOVE THE MACHINE
	try {
		cmd = $os.cmd(
			`fly`,
			`machines`,
			`destroy`,
			`${machine_id}`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`
		)
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
