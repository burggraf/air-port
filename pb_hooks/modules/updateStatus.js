const updateStatus = (Domain, userid) => {
	const { select, execute } = require(`${__hooks}/modules/sql.js`)
	const config = require(`${__hooks}/config.json`)

	// get the app status
	try {
		cmd = $os.cmd(`fly`,`status`,`--app`,`${Domain}`,`-j`, `--access-token`,`${config.FLY_ORG_TOKEN}`)
		let jsonStatus = String.fromCharCode(...cmd.output());
	
		// put the app status into the project table
		jsonStatus = jsonStatus.replace(/'/g, "''");
		let j;
		try {
			j = JSON.parse(jsonStatus)
		} catch (e) {
			return { data: null, error: 'JSON parse error' };
		}
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
		if (statusError) return { data: null, error: statusError };

		// insert / update machines
		for (let i = 0; i < j.Machines.length; i++) {
			const machine = j.Machines[i]
			try {
				const { data: getMachineRecordData, error: getMachineRecordError } = 
				select({id: ''},
				`select id from machines where machine_id = '${machine.id}'`);	

				sql = `update machines 
					set machine_id = '${machine.id || ""}',
					name = '${machine.name || ""}', 
					state = '${machine.state || ""}', 
					region = '${machine.region || ""}', 
					image_ref = '${JSON.stringify(machine.image_ref).replace(/\'/g,"''") || ""}', 
					instance_id = '${machine.instance_id || ""}', 
					private_ip = '${machine.private_ip || ""}', 
					created_at = '${machine.created_at || ""}', 
					updated_at = '${machine.updated_at || ""}', 
					config = '${JSON.stringify(machine.config).replace(/\'/g,"''") || ""}', 
					events = '${JSON.stringify(machine.events).replace(/\'/g,"''") || ""}', 
					userid = '${userid || ""}', 
					Domain = '${Domain || ""}'
					where machine_id = '${machine.id}'`;
				console.log('update machine', sql)
				const { data: updateMachineData, error: updateMachineError } = execute( sql );
				if (updateMachineError) return { data: null, error: updateMachineError };	
			} catch (err) {
				// machine record does not exist -- create it
				sql = `insert into machines (machine_id, name, state, region, 
					image_ref, instance_id, private_ip, created_at, updated_at, 
					config, events, userid, Domain) values (
					'${machine.id || ""}',
					'${machine.name || ""}',
					'${machine.state || ""}',
					'${machine.region || ""}',
					'${JSON.stringify(machine.image_ref).replace(/\'/g,"''") || ""}',
					'${machine.instance_id || ""}',
					'${machine.private_ip || ""}',
					'${machine.created_at || ""}',
					'${machine.updated_at || ""}',
					'${JSON.stringify(machine.config).replace(/\'/g,"''") || ""}',
					'${JSON.stringify(machine.events).replace(/\'/g,"''") || ""}',
					'${userid || ""}',
					'${Domain || ""}')`;
				const { data: insertMachineData, error: insertMachineError } = execute( sql );
				if (insertMachineError) return { data: null, error: insertMachineError };	
			}
		}
		return { data: 'OK', error: null };
	} catch (err) {
		return { data: null, error: err };
	}
}

module.exports = { updateStatus };