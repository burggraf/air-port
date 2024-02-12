// requires:
// 	 instance_id
// 	 status (online, offline, maintenance)
routerAdd('POST', '/changeversion', async (c) => {
	console.log('changeversion 00')
	// const { changeversion } = require(`${__hooks}/modules/callbackend.js`)
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	console.log("changeversion 01")
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
	if (!data?.pb_version) {
		return c.json(200, { data: null, error: 'pb_version is required' })
	}
	console.log("changeversion 02")
	const pb_version = data?.pb_version;
	const project_id = data?.project_id;
	console.log("changeversion 03")
	const { data: instanceData, error: instanceError } = 
		select({id: '', port: 0, site_domain: '', domain: '', owner: '', ownertype: ''},
		`select id, port, site_domain, domain, owner, ownertype from instance_view where project_id = '${data?.project_id}'`);
	if (instanceError) return c.json(200, { data: null, error: instanceError })
	if (instanceData.length < 1) {
		return c.json(200, { data: null, error: 'instance not found' })
	}
	if (instanceData[0].owner !== user.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}	
	console.log("changeversion 04")
	console.log('instanceData', JSON.stringify(instanceData, null, 2));
	// change the version in the projects record
	console.log(`update projects set metadata = JSON_SET(coalesce(metadata,'{}'), '$.pb_version', '${pb_version}') where id = '${data?.project_id}'`);
	const { data: updateData, error: updateError } = 
		execute(`update projects set metadata = JSON_SET(coalesce(metadata,'{}'), '$.pb_version', '${pb_version}') where id = '${data?.project_id}'`);
	if (updateError) return c.json(200, { data: null, error: updateError })
	console.log('calling updateroutes, project_id, user?.id:', project_id, user?.id);
	const { data: updateRoutesData, error: updateRoutesError } = updateroutes(project_id, user?.id);
    if (updateRoutesError) {
        return c.json(200, { data: null, error: 'unable to update routes' })
    }
	return c.json(200, { data: 'OK', error: null })	

})


