/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/create-ssh-keys/:project_instance_id', (c) => {
	const { select } = require(`${__hooks}/modules/sql.js`)
	const { createuser } = require(`${__hooks}/modules/callbackend.js`)

	const project_instance_id = c.pathParam('project_instance_id')
	if (!project_instance_id) {
		return c.json(200, { data: null, error: 'project_instance_id is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
	let keys;
	const { data:keys1, error:keysError1 } = select(
		{site: '', username: '', port: 0, key: ''},
		`SELECT sites.domain as site,project_instance.domain as username,
			project_instance.port as port,key 
			from project_instance_keys 
			join project_instance on project_instance.id = project_instance_keys.project_instance_id 
			join user_keys on user_keys.user_id = project_instance_keys.user_id 
				and user_keys.id = project_instance_keys.user_keys_id
			join sites on project_instance.site_id = sites.id
			where project_instance_keys.project_instance_id = '${project_instance_id}' 
				and project_instance_keys.user_id = '${user.id}'`)
	if (keysError1) {
		console.log('keysError1', JSON.stringify(keysError1));
		return c.json(200, { data: null, error: keysError?.value?.error() || keysError })
	} else {
		keys = keys1;
	}
    let ssh_key_string = ''
	for (const kkey of keys) {
		ssh_key_string += kkey.key
	}
	if (keys.length === 0) {
		const { data: keys2, error: keysError2 } = select(
			{site: '', username: '', port: 0, key: ''},
			`SELECT sites.domain as site,project_instance.domain as username,
			project_instance.port as port,'' as key 
			from project_instance join sites on sites.id = project_instance.site_id 
			join projects on projects.id = project_instance.project_id 
			where project_instance.id = '${project_instance_id}' 
			and projects.owner = '${user.id}'`);
			if (keysError2) {
				console.log('keysError2', JSON.stringify(keysError2));
				return c.json(200, { data: null, error: keysError?.value?.error() || keysError })
			} else {
				keys = keys2;
			}
	}
	// key: {username,port,ssh_key_string,site}
	const key = {username:keys[0].username,port:keys[0].port,
					ssh_key_string:ssh_key_string,site:keys[0].site}
	const { data: createUser, error: createUserError } = createuser(key);
	if (createUserError) {
		return c.json(200, { data: null, error: createUserError })
	} else {
		return c.json(200, { data: createUser, error: null })
	}
})

