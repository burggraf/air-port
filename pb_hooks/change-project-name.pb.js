// requires:
// 	 instance_id
// 	 status (online, offline, maintenance)
routerAdd('POST', '/change-project-name', async (c) => {
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
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
	if (!data?.project_name) {
		return c.json(200, { data: null, error: 'project_name is required' })
	}
	const project_id = data?.project_id;
	const project_name = data?.project_name;
	
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
	// change the name of the project
	const { data: updateData, error: updateError } = 
		execute(`update projects 
				set name = '${project_name.replace(/'/g, "''")}'
				where id = '${project_id}'`); // potential SQL Injection
	if (updateError) return c.json(200, { data: null, error: 'unable to update project name' })
	else {
		return c.json(200, { data: 'ok', error: null })
	}
})


