/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/update-routes/:project_id', (c) => {
	const { updateroutes } = require(`${__hooks}/modules/callbackend.js`)
	const { select } = require(`${__hooks}/modules/sql.js`)

	const project_id = c.pathParam('project_id')
	if (!project_id) {
		return c.json(200, { data: null, error: 'project_id is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin
	let user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) {
		return c.json(200, { data: null, error: 'not logged in' })
	}
    const { data, error } = updateroutes(project_id, user?.id);
    if (error) {
        return c.json(200, { data: null, error: error?.value?.error() || error })
    }
    return c.json(200, { data: data, error: null })
})
