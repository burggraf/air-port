// enable replication for a project by copying /marmot.toml to /pb/marmot.toml
routerAdd('GET', '/add-region/:Domain/:region', async (c) => {
	console.log('add-region 00')
	const { select } = require(`${__hooks}/modules/sql.js`)
	const { updateStatus } = require(`${__hooks}/modules/updateStatus.js`)
	const config = require(`${__hooks}/config.json`)
	const Domain = c.pathParam('Domain')
	const region = c.pathParam('region')
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) return c.json(200, { data: null, error: 'not logged in' })
	if (!user.verified) return c.json(200, { data: null, error: 'user not verified' })
	if (!Domain) return c.json(200, { data: null, error: 'Domain is required' })
	if (!region) return c.json(200, { data: null, error: 'region is required' })
	const userid = user?.id
	// check ownership
	const { data: appData, error: appDataError } = select(
		{ userid: '' },
		`select userid from apps where Domain = '${Domain}'`
	)
	if (appDataError) return c.json(200, { data: null, error: 'cannot check userid' })
	if (appData.length !== 1) return c.json(200, { data: null, error: 'app not found' })
	if (appData[0].userid !== userid) return c.json(200, { data: null, error: 'not your project' })
	console.log('add-region 01')
	// get all machine data
	const { data: machineData, error: machineDataError } = select(
		{ private_ip: '', machine_id: '', is_primary: false, config: {} },
		`select private_ip, machine_id, is_primary, config from machines where Domain = '${Domain}'`
	)
	console.log('add-region 02')
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine(s) data' })
	if (machineData.length < 1) return c.json(200, { data: null, error: 'primary machine not found' })
	console.log('add-region 02a')
	// get primary machine
	const primaryMachine = machineData.filter((m) => m.is_primary === true)[0]
	console.log('add-region 02b')
	console.log('typeof primaryMachine.config', typeof primaryMachine.config)
	console.log('primaryMachine.config', JSON.stringify(primaryMachine.config, null, 2))
	for (let attr in primaryMachine.config) {
		console.log('attr', attr, typeof primaryMachine.config[attr])
	}
	let primaryMachineConfig;
	try {
		primaryMachineConfig = JSON.parse(primaryMachine.config?.value());
	} catch (err) {
		console.log('could not parse primaryMachine.config', err)
		return c.json(200, { data: null, error: err })
	}

	const primaryVolume = primaryMachineConfig.mounts[0]?.volume
	console.log('primaryVolume', primaryVolume)
	if (!primaryVolume) return c.json(200, { data: null, error: 'primary machine volume not found' })
	let cmd
	let output
	console.log('add-region 03')
	if (machineData.length === 1) {
		// only one machine, we must enable replication on primary
		// START PRIMARY MACHINE
		try {
			cmd = $os.cmd(
				`fly`,
				`machines`,
				`start`,
				`${primaryMachine.machine_id}`,
				`--app`,
				`${Domain}`,
				`--access-token`,
				`${config.FLY_ORG_TOKEN}`
			)
			output = String.fromCharCode(...cmd.output())
			console.log('start primary machine output: ', output)
		} catch (err) {
			console.log('could not start primary machine', err)
			return c.json(200, { data: null, error: err })
		}
		console.log('add-region 04')
		// ENABLE REPLICATION
		// touch /pb/marmot.active;/marmot -config /pb/marmot.toml -cleanup;/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
		const HOST_KEY_PATH = $os.getenv("HOST_KEY_PATH") || '/pb/.ssh/ssh_host_rsa_key'
		try {
			cmd = $os.cmd(
				`ls`,`-al`,`${HOST_KEY_PATH}`
			)
			// cmd = $os.cmd(
			// 	`/usr/bin/ssh`,
			// 	`-p`,`2222`,
			// 	`-i`,`${HOST_KEY_PATH}`,
			// 	`-o`,`StrictHostKeyChecking=no`,
			// 	`root@${primaryMachine.private_ip}`,
			// 	`"touch /pb/marmot.active;/marmot -config /pb/marmot.toml -cleanup;/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &"`
			// )
			console.log('enable replication cmd')
			console.log('*********************')
			console.log(cmd)
			console.log('*********************')
			output = String.fromCharCode(...cmd.output())
			console.log('enable replication output: ', output)
		} catch (err) {
			console.log('could not enable replication', err)
			return c.json(200, { data: null, error: err })
		}
		console.log('add-region 04')
	}
	console.log('add-region 05')
	// CLONE PRIMARY MACHINE VOLUME
	// fly volumes fork --app burggraf vol_krk205zwyq361dyr -r atl -j
	try {
		cmd = $os.cmd(
			`fly`,
			`volumes`,
			`fork`,
			`--app`,
			`${Domain}`,
			`${primaryVolume}`,
			`-r`,
			`${region}`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`,
			`-j`
		)
		output = String.fromCharCode(...cmd.output())
		console.log('fly volumes fork output: ', output)
	} catch (err) {
		console.log('could not fork primary volume', err)
		return c.json(200, { data: null, error: err })
	}
	console.log('add-region 06')
	let newVolume
	try {
		newVolume = JSON.parse(output).id
	} catch (err) {
		console.log('could not parse fly volumes fork output', err)
		return c.json(200, { data: null, error: err })
	}
	console.log('add-region 07')
	// CLONE PRIMARY MACHINE
	// fly machine clone $MACHINE_ID -r $REGION --attach-volume $VOLUME_ID:/pb --app $APP
	try {
		cmd = $os.cmd(
			`fly`,
			`machines`,
			`clone`,
			`${primaryMachine.machine_id}`,
			`--app`,
			`${Domain}`,
			`-r`,
			`${region}`,
			`--attach-volume`,
			`${newVolume}`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`
		)
		output = String.fromCharCode(...cmd.output())
		console.log('fly machines clone output: ', output)
	} catch (err) {
		console.log('could not clone primary machine', err)
		return c.json(200, { data: null, error: err })
	}
	console.log('add-region 08')
	const { data: updateStatusData, error: updateStatusError } = updateStatus(Domain, userid, true)
	if (updateStatusError) {
		console.log('updateStatusError', updateStatusError)
	}
	return c.json(200, { data: 'ok', error: null })
})
