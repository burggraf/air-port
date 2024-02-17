/// <reference path="../pb_data/types.d.ts" />
// routerAdd('GET', '/check-domain/:domain', (c) => {
// 	const { select } = require(`${__hooks}/modules/sql.js`)

// 	const domain = c.pathParam('domain')

routerAdd('GET', '/update-app-status/:Domain', (c) => {
	const { updateStatus } = require(`${__hooks}/modules/updateStatus.js`)
    const Domain = c.pathParam('Domain')
    console.log('update-app-status', Domain)
	const info = $apis.requestInfo(c)

	const user = info.authRecord // empty if not authenticated as regular auth record
	if (!user) return c.json(200, { data: null, error: 'not logged in' });
	if (!user.verified) return c.json(200, { data: null, error: 'user not verified' });	
	const userid = user?.id
    console.log('userid', userid)

	// call updateStatus here
    console.log('call updateStatus here...', Domain, userid)
	const { data: updateStatusData, error: updateStatusError} = updateStatus(Domain, userid);
	if (updateStatusError) {
        return c.json(200, { data: null, error: updateStatusError });
	} else {
        return c.json(200, { data: 'OK', error: null });
    }
})

