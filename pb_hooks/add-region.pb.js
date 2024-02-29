// enable replication for a project by copying /marmot.toml to /pb/marmot.toml
routerAdd('GET', '/add-region/:Domain/:region', async (c) => {
	console.log('add-region 00')
	const { select } = require(`${__hooks}/modules/sql.js`)
	console.log('add-region 00a')
	const { updateStatus } = require(`${__hooks}/modules/updateStatus.js`)
	console.log('add-region 00b')
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)
	console.log('add-region 00c')
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
	console.log('add-region 00c')
	if (appDataError) return c.json(200, { data: null, error: 'cannot check userid' })
	if (appData.length !== 1) return c.json(200, { data: null, error: 'app not found' })
	if (appData[0].userid !== userid) return c.json(200, { data: null, error: 'not your project' })
	console.log('add-region 01')
	// get all machine data
	const { data: machineData, error: machineDataError } = select(
		{ private_ip: '', machine_id: '', is_primary: false, config: {}, region: ''},
		`select private_ip, machine_id, is_primary, config, region from machines where Domain = '${Domain}'`
	)
	console.log('add-region 02')
	if (machineDataError) return c.json(200, { data: null, error: 'error getting machine(s) data' })
	if (machineData.length < 1) return c.json(200, { data: null, error: 'primary machine not found' })
	console.log('add-region 02a')
	// get primary machine
	const primaryMachine = machineData.filter((m) => m.is_primary === true)[0]
	console.log('primaryMachine')
	console.log(JSON.stringify(primaryMachine,null,2))

	console.log('add-region 02b')
	// let primaryMachineConfig;
	// try {
	// 	primaryMachineConfig = JSON.parse(primaryMachine.config?.value());
	// } catch (err) {
	// 	console.log('could not parse primaryMachine.config', err)
	// 	return c.json(200, { data: null, error: err })
	// }
	let cmd;
	let output;
	console.log(`add-region 03 - clone primary machine from ${primaryMachine.region} to ${region}`)
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
			// `--attach-volume`,
			// `${newVolume}`,
			`--access-token`,
			`${config.FLY_ORG_TOKEN}`
		)
		output = String.fromCharCode(...cmd.output())
	} catch (err) {
		console.log('could not clone primary machine', err)
		return c.json(200, { data: null, error: err })
	}
	// GET THE NEW MACHINE
	// fly machines list --app <APP> -j
	let targetMachine;
	try {
        cmd = $os.cmd(
            `fly`,
            `machines`,
            `list`,
            `--app`,
            `${Domain}`,
			`-j`,
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`
        )
        output = String.fromCharCode(...cmd.output())
		const machines = JSON.parse(output);
		targetMachine = machines.filter((m) => m.region === region)[0];
		targetMachine.machine_id = targetMachine.id;
	} catch (err) {
        console.log('could not get new clone machine info', err)
        return c.json(200, { data: null, error: err })
	}

	// add primary machine's public key to the new machine
	console.log('get primary machine public key')
	// "cat /pb/.ssh/ssh_host_rsa_key.pub"
	console.log('**** primaryMachine', primaryMachine)
    const { data: getKeyData, error: getKeyError } = await runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `cat /pb/.ssh/ssh_host_rsa_key.pub`
    )
    if (getKeyError) return c.json(200, { data: null, error: getKeyError })
	const primaryMachinePublicKey = getKeyData.replace(/\n/g, '');
	console.log('*********************')
	console.log('primaryMachinePublicKey', primaryMachinePublicKey)
	console.log('*********************')

	console.log('add primary machine public key to target machine authorized_keys')
	console.log('**** targetMachine', Domain, targetMachine.machine_id, targetMachine.private_ip)
    const { data: putKeyData, error: putKeyError } = await runRemote(
        Domain,
        targetMachine.machine_id,
        targetMachine.private_ip,
        `/bin/sh -c "echo '${primaryMachinePublicKey}' >> /pb/.ssh/authorized_keys"`
    )
    if (putKeyError) return c.json(200, { data: null, error: putKeyError })
	console.log('*********************')
	console.log('putKeyData', putKeyData)
	console.log('*********************')

	// console.log('add-region 04 - rsync to new machine')
	// now sync the new instance

	// const { data: updateStatusData, error: updateStatusError } = updateStatus(Domain, userid, true)
	// if (updateStatusError) {
	// 	console.log('updateStatusError', updateStatusError)
	// }
	return c.json(200, { data: 'ok', error: null })
})
