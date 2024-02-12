// requires:
// 	 instance_id
// 	 status (online, offline, maintenance)
routerAdd('POST', '/toggleinstance', async (c) => {
	const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	if (!data?.instance_id) {
		return c.json(200, { data: null, error: 'instance_id is required' })
	}
	if (!data?.status) {
		return c.json(200, { data: null, error: 'status is required' })
	}
	if (data?.status !== 'online' && data?.status !== 'offline' && data?.status !== 'maintenance') {
		return c.json(200, { data: null, error: 'invalid status' })
	}
	const { data: instanceData, error: instanceError } = 
		select({id: '',port: 0, site_domain: '', domain: '', owner: '', ownertype: '', project_id: ''},
		`select id, port, site_domain, domain, owner, ownertype, project_id from instance_view where id = '${data?.instance_id}'`);
	if (instanceError) return c.json(200, { data: null, error: instanceError })
	if (instanceData.length !== 1) {
		return c.json(200, { data: null, error: 'instance not found' })
	}
	if (instanceData[0].owner !== user.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	// let site_domain = instanceData[0].site_domain;
	// let domain = instanceData[0].domain;
	let port = instanceData[0].port;
	let project_id = instanceData[0].project_id;
	let status = '';
	switch (data?.status) {
		case 'online':
			status = port.toString();
			break;
		case 'offline':
			status = '9999'
			break;
		case 'maintenance':
			status = '9998'
			break;
		default:
			return c.json(200, { data: null, error: 'invalid status' })
	}	
	// update the instance record
	const { data: updateData, error: updateError } = 
		execute(`update project_instance set instance_status = '${data?.status}' where id = '${data?.instance_id}'`);
	if (updateError) return c.json(200, { data: null, error: updateError })

	// updateroutes = (project_id, current_user_id)
	// take the instance online, offline, or into maintenance mode
	const { data: d1, error: e1 } = updateroutes(project_id, user?.id);
	if (e1) return c.json(200, { data: null, error: e1 })
	else return c.json(200, { data: d1, error: null })
	
})


