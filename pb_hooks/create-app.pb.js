routerAdd('POST', '/create-app', (c) => {
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	const { updateStatus } = require(`${__hooks}/modules/updateStatus.js`)
    const config = require(`${__hooks}/config.json`)

	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) return c.json(200, { data: null, error: 'not logged in' });
	if (!user.verified) return c.json(200, { data: null, error: 'user not verified' });	
	if (data?.app?.userid !== user?.id) return c.json(200, { data: null, error: 'not your project' });	
	if (!data?.app?.title) return c.json(200, { data: null, error: 'project title is required' });
	if (!data?.app?.Domain) return c.json(200, { data: null, error: 'Domain is required' });
	if (!data?.primary_region) return c.json(200, { data: null, error: 'primary_region is required' });
	const userid = user?.id
	const title = data?.app?.title
	const Domain = data?.app?.Domain
	const type = data?.app?.type || 'production'
	const owner = data?.app?.owner
	const primary_region = data?.primary_region
	console.log('create-app', JSON.stringify(data))
	const { data: insertAppData, error: insertAppError } = execute(
		`INSERT INTO apps (title, Domain, type, userid, primary_region) 
			VALUES ('${title}', '${Domain}', '${type}', '${userid}', '${primary_region}')`
	)
	if (insertAppError) return c.json(200, { data: null, error: insertAppError });
	console.log('insertAppData', insertAppData)

	const deleteAppRecord = (Domain) => {
		const { data: deleteAppData, error: deleteAppError } = execute(
			`DELETE FROM apps WHERE Domain = '${Domain}'` 
		)
		if (deleteAppError) return c.json(200, { data: null, error: 'Error creating app -- could not abort app creation' });	
	}

	// CREATE APP
	let cmd;
	let output;
	try {
		cmd = $os.cmd(`fly`,`apps`,`create`,`${Domain}`,`--org`,`air-port-dev`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
		output = String.fromCharCode(...cmd.output());
		console.log('app create output', output)	
	} catch (err) {
		console.log('app create error -- domain probably exists', err)
		deleteAppRecord(Domain)
		return c.json(200, { data: null, error: 'Error creating app' });	
	}

	// CREATE VOLUME
	try {
		cmd = $os.cmd(`fly`,`volumes`,`create`,`pb_data`,`--size=1`,`--app`,`${Domain}`,`--region`,`${primary_region}`,`-y`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
		output = String.fromCharCode(...cmd.output());
		console.log('volume create output', output)	
	} catch (err) {
		deleteAppRecord(Domain)
		return c.json(200, { data: null, error: 'Error creating volume' });	
	}

	// CREATE MACHINE
	try {
		cmd = $os.cmd(`fly`,`deploy`,`--app`,`${Domain}`,`--config`,`${__hooks}/fly.toml`,`--image`,`registry.fly.io/air-port-dev:latest`,`--region`,`${primary_region}`,`--now`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
		output = String.fromCharCode(...cmd.output());
		console.log('machine create output', output)	
	} catch (err) {
		deleteAppRecord(Domain)
		return c.json(200, { data: null, error: 'Error creating machine' });
	}

	// call updateStatus here
	const { data: updateStatusData, error: updateStatusError} = updateStatus(Domain, userid, true);
	if (updateStatusError) {
		console.log('updateStatusError', updateStatusError)
	}

	if (output.indexOf('Visit your newly deployed app at') > -1) {
		return c.json(200, { data: "OK", error: null })
	} else {
		return c.json(200, { data: null, error: 'There was an error launching the machine' })
	}
})

