routerAdd('POST', '/remove-app', async (c) => {
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	const config = require(`${__hooks}/config.json`)

	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	const Domain = data?.Domain
	if (!Domain) {
		return c.json(200, { data: null, error: 'Domain is required' })
	}
	const { data: userData, error: userError } = 
	select({userid: ''},
	`select userid from apps where Domain = '${Domain}'`);
	if (userError) {
		return c.json(200, { data: null, error: userError })
	} else if (userData.length === 0 || userData[0].userid !== user.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}

	const deleteMachinesRecords = (Domain) => {
		const { data: deleteMachinesData, error: deleteMachinesError } = execute(
			`DELETE FROM machines WHERE Domain = '${Domain}' and userid = '${user.id}'` 
		)
		if (deleteMachinesError) return c.json(200, { data: null, error: 'Error deleting machine(s) records' });	
	}
	const deleteAppRecord = (Domain) => {
		const { data: deleteAppData, error: deleteAppError } = execute(
			`DELETE FROM apps WHERE Domain = '${Domain}' and userid = '${user.id}'` 
		)
		if (deleteAppError) return c.json(200, { data: null, error: 'Error deleting app record' });	
	}


	// CREATE APP
	let cmd;
	let output;
	try {
		cmd = $os.cmd(`fly`,`apps`,`destroy`,`${Domain}`,`-y`,`--access-token`,`${config.FLY_ORG_TOKEN}`)
		output = String.fromCharCode(...cmd.output());
		console.log('app destroy output', output)	
		deleteMachinesRecords(Domain)
		deleteAppRecord(Domain)
		return c.json(200, { data: 'OK', error: null });
	} catch (err) {
		return c.json(200, { data: null, error: 'Error removing app' });	
	}

})
