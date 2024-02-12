// requires:
// 	 instance_id
// 	 status (online, offline, maintenance)
routerAdd('POST', '/change-domain', async (c) => {
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	console.log('change-domain 01')
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
	if (!data?.project_id) {
		return c.json(200, { data: null, error: 'project_id is required' })
	}
	if (!data?.domain) {
		return c.json(200, { data: null, error: 'domain is required' })
	}
	const project_id = data?.project_id;
	const domain = data?.domain;
	console.log('change-domain 02')
	
	const { data: ownerData, error: ownerError } = 
		select({owner: '', ownertype: ''},
		`select owner, ownertype from projects where id = '${project_id}'`);
	if (ownerError) return c.json(200, { data: null, error: 'cannot check ownership' })
	if (ownerData.length !== 1) {
		return c.json(200, { data: null, error: 'project not found' })
	}
	if (ownerData[0].owner !== user.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	console.log('change-domain 03')
	// check that domain is not already taken
	const { data:domainCheck, error:domainCheckError } = select({count: 0},
		`select count(*) as count from projects where domain = '${domain.replace(/'/g, "''")}'`
	)
	if (domainCheckError) {
		return c.json(200, { data: null, error: 'could not verify domain availability' })
	} else {
		if (domainCheck[0].count !== 0) {
			console.log('domainCheck', JSON.stringify(domainCheck));
			return c.json(200, { data: null, error: 'domain unavailable' })
		}
	}
	console.log('change-domain 04')
	// update the domain in the database (projects and project_instance)
	const { data: oldDomain, error: oldDomainError } = select({domain: ''},
		`select domain from projects where id = '${project_id}'`
	)
	if (oldDomainError || oldDomain.length !== 1) {
		return c.json(200, { data: null, error: 'could not retrieve old domain' })
	}
	console.log('change-domain 05')
	console.log('oldDomain', JSON.stringify(oldDomain));
	const old_domain = oldDomain[0].domain;
	console.log('old_domain', old_domain);
	console.log('domain', domain);
	console.log('domain replaced', domain.replace(/'/g, "''"));
	console.log('project_id', project_id);
	
	console.log(`update projects 
	set domain = '${domain.replace(/'/g, "''")}'
	where id = '${project_id}'`);
	const { data: update1Data, error: update1Error } = 
		execute(`update projects 
				set domain = '${domain.replace(/'/g, "''")}'
				where id = '${project_id}'`); // potential SQL Injection
	console.log('change-domain 05.1')
	if (update1Error) return c.json(200, 
		{ data: null, error: 'unable to update project domain' })
	console.log('change-domain 06')
	const { data: update2Data, error: update2Error } =
		execute(`update project_instance
				set domain = '${domain.replace(/'/g, "''")}'
				where project_id = '${project_id}'`); // potential SQL Injection
	if (update2Error) {
		// roll back
		const { data: update3Data, error: update3Error } = 
			execute(`update projects 
					set domain = '${old_domain}'
					where id = '${project_id}'`); // potential SQL Injection
		if (update3Error) return c.json(200, 
			{ data: null, error: 'unable to roll back domain name' })
	}
	console.log('change-domain 07')
    const { data: updateRoutesData, error: updateRoutesError } = updateroutes(project_id, user?.id);
    if (updateRoutesError) {
        return c.json(200, { data: null, error: 'unable to update routes' })
    }
	console.log('change-domain 08')
    return c.json(200, { data: 'OK', error: null })

})


