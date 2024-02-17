routerAdd('POST', '/create-app', (c) => {
	console.log('create-app 01')
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
    const config = require(`${__hooks}/config.json`)

	console.log('create-app 01A')
	// try {
		// const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	// } catch (e) {
	// 	console.log('setup updateroutes error', e)
	// }
	console.log('create-app 02')

	// read the body via the cached request object
	// (this method is commonly used in hook handlers because it allows reading the body more than once)
	const data = $apis.requestInfo(c).data

	const info = $apis.requestInfo(c)
	// const admin  = info.admin;      // empty if not authenticated as admin
	const user = info.authRecord // empty if not authenticated as regular auth record
	// console.log('info', JSON.stringify(info, null, 2));
	// console.log('admin', JSON.stringify(admin, null, 2));
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!user.verified) {
		return c.json(200, { data: null, error: 'user not verified' })
	}
	if (data?.app?.userid !== user?.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	if (!data?.app?.title) {
		return c.json(200, { data: null, error: 'project title is required' })
	}
	if (!data?.app?.Domain) {
		return c.json(200, { data: null, error: 'Domain is required' })
	}
	if (!data?.primary_region) {
		return c.json(200, { data: null, error: 'primary_region is required' })
	}
	const userid = user?.id
	const title = data?.app?.title
	const Domain = data?.app?.Domain
	const type = data?.app?.type || 'production'
	const owner = data?.app?.owner
	const primary_region = data?.primary_region

	console.log('create-app 03')
	const { data: insertAppData, error: insertAppError } = execute(
		`INSERT INTO apps (title, Domain, type, userid, primary_region) 
			VALUES ('${title}', '${Domain}', '${type}', '${userid}', '${primary_region}')`
	)
	if (insertAppError) {
		return c.json(200, { data: null, error: insertAppError })
	} else {
		console.log('insertAppData', insertAppData)
	}
	console.log('create-app 04')

	//console.log('config.FLY_ORG_TOKEN', config.FLY_ORG_TOKEN)

	// CREATE APP, VOLUME, MACHINE
	let cmd = $os.cmd(`fly`,`apps`,`create`,`${Domain}`,`--org`,`air-port-dev`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	let output = String.fromCharCode(...cmd.output());
	console.log('app create output', output)
	cmd = $os.cmd(`fly`,`volumes`,`create`,`pb_data`,`--size=1`,`--app`,`${Domain}`,`--region`,`${primary_region}`,`-y`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	output = String.fromCharCode(...cmd.output());
	console.log('volume create output', output)
	cmd = $os.cmd(`fly`,`deploy`,`--app`,`${Domain}`,`--config`,`${__hooks}/fly.toml`,`--image`,`registry.fly.io/air-port-dev:latest`,`--region`,`${primary_region}`,`--now`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	output = String.fromCharCode(...cmd.output());
	console.log('machine create output', output)
	// get the app status
	cmd = $os.cmd(`fly`,`status`,`--app`,`${Domain}`,`-j`)
	let jsonStatus = String.fromCharCode(...cmd.output());
	// put the app status into the project table
	jsonStatus = jsonStatus.replace(/'/g, "''");
	let j;
	try {
		j = JSON.parse(jsonStatus)
	} catch (e) {
		console.log('jsonStatus', jsonStatus)
		console.log('jsonStatus error', e)
		return c.json(200, { data: null, error: 'JSON parse error' })
	}
	console.log('j', JSON.stringify(j, null, 2))
	let sql = `update apps set 
		AppURL = '${j.AppURL || ""}',
		Deployed = '${j.Deployed ? 'true' : 'false'}',
		Hostname = '${j.Hostname || ""}',
		Name = '${j.Name || ""}',
		PlatformVersion = '${j.PlatformVersion || ""}',
		Status = '${j.Status || ""}',
		Version = ${j.Version || 1}
		WHERE Domain = '${Domain}'`;

	const { data: statusData, error: statusError } = execute( sql )
	if (statusError) {
		return c.json(200, { data: null, error: statusError })
	}
	else {
		console.log('statusData', statusData)	
	}
	console.log('ready to insert machine data')
	const machine = j.Machines[0]
	// get machine data now
	sql = `insert into machines (machine_id, name, state, region, 
		image_ref, instance_id, private_ip, created_at, updated_at, 
		config, events, userid, Domain) values (`;
	sql +=	`'${machine.id || ""}',`
	sql +=	`'${machine.name || ""}',`
	sql +=	`'${machine.state || ""}',`
	sql +=	`'${machine.region || ""}',`
	sql +=	`'${JSON.stringify(machine.image_ref).replace(/\'/g,"''") || ""}',`
	sql +=	`'${machine.instance_id || ""}',`
	sql +=	`'${machine.private_ip || ""}',`
	sql +=	`'${machine.created_at || ""}',`
	sql +=	`'${machine.updated_at || ""}',`
	sql +=	`'${JSON.stringify(machine.config).replace(/\'/g,"''") || ""}',`
	sql +=	`'${JSON.stringify(machine.events).replace(/\'/g,"''") || ""}',`
	sql +=	`'${userid || ""}',`
	sql +=	`'${Domain || ""}')`;
	console.log('sql', sql)
	const { data: insertMachineData, error: insertMachineError } = execute( sql );
	if (insertMachineError) {
		return c.json(200, { data: null, error: insertMachineError })
	}
	else {
		console.log('insertMachineData', insertMachineData)
	}
	// fly status --app old-scissors-same -j
	if (output.indexOf('Visit your newly deployed app at') > -1) {
		return c.json(200, { data: "OK", error: null })
	} else {
		return c.json(200, { data: null, error: 'There was an error launching the machine' })
	}
})

