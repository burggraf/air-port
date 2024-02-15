routerAdd('POST', '/createproject', (c) => {
	console.log('createproject 01')
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
    const config = require(`${__hooks}/config.json`)

	console.log('createproject 01A')
	// try {
		// const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	// } catch (e) {
	// 	console.log('setup updateroutes error', e)
	// }
	console.log('createproject 02')

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
	if (data?.project?.owner !== user?.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	if (!data?.project?.name) {
		return c.json(200, { data: null, error: 'project name is required' })
	}
	if (!data?.project?.domain) {
		return c.json(200, { data: null, error: 'domain is required' })
	}
	if (!data?.project_instance?.region) {
		return c.json(200, { data: null, error: 'region is required' })
	}
	if (
		data?.project_instance?.type !== 'primary' &&
		data?.project_instance?.type !== 'replica'
	) {
		return c.json(200, { data: null, error: 'type must be "primary" or "replica"' })
	}
	const userid = user?.id
	const projectname = data?.project?.name
	const projectdomain = data?.project?.domain
	const projecttype = data?.project?.type || 'production'
	const projectowner = data?.project?.owner
	const projectregion = data?.project_instance?.region

	console.log('createproject 03')
	const { data: insertProjectData, error: insertProjectError } = execute(
		`INSERT INTO project (name, domain, fqd, type, owner, metadata) VALUES ('${projectname}', '${projectdomain}', '${projectdomain}.fly.dev', '${projecttype}', '${projectowner}', '{}')`
	)
	if (insertProjectError) {
		return c.json(200, { data: null, error: insertProjectError })
	} else {
		console.log('insertProjectData', insertProjectData)
	}
	console.log('createproject 04')

	//console.log('config.FLY_ORG_TOKEN', config.FLY_ORG_TOKEN)

	// CREATE APP, VOLUME, MACHINE
	let cmd = $os.cmd(`fly`,`apps`,`create`,`${projectdomain}`,`--org`,`air-port-dev`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	let output = String.fromCharCode(...cmd.output());
	console.log('app create output', output)
	cmd = $os.cmd(`fly`,`volumes`,`create`,`pb_data`,`--size=1`,`--app`,`${projectdomain}`,`--region`,`${projectregion}`,`-y`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	output = String.fromCharCode(...cmd.output());
	console.log('volume create output', output)
	cmd = $os.cmd(`fly`,`deploy`,`--app`,`${projectdomain}`,`--config`,`${__hooks}/fly.toml`,`--image`,`registry.fly.io/air-port-dev:latest`,`--region`,`${projectregion}`,`--now`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
	output = String.fromCharCode(...cmd.output());
	console.log('machine create output', output)
	// get the app status
	cmd = $os.cmd(`fly`,`status`,`--app`,`${projectdomain}`,`-j`)
	let jsonStatus = String.fromCharCode(...cmd.output());
	// put the app status into the project table
	jsonStatus = jsonStatus.replace(/'/g, "''");
	console.log('jsonStatus', jsonStatus)
	const sql = `update project set metadata = '${jsonStatus.replace(/'/g,"''")}' WHERE domain = '${projectdomain}'`;

	const { data: statusData, error: statusError } = execute( sql )
	if (statusError) {
		return c.json(200, { data: null, error: statusError })
	}
	else {
		console.log('statusData', statusData)	
	}

	// fly status --app old-scissors-same -j
	if (output.indexOf('Visit your newly deployed app at') > -1) {
		return c.json(200, { data: "OK", error: null })
	} else {
		return c.json(200, { data: null, error: 'There was an error launching the machine' })
	}
})

