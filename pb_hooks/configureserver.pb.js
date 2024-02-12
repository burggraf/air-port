/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/configureserver/:fqd', async (c) => {
	const { configureserver } = require(`${__hooks}/modules/callbackend.js`)
	const { select } = require(`${__hooks}/modules/sql.js`)

	const token = c.request().header.get("Authorization")
	if (!token || token !== 'my_secret_token') {
		return c.json(200, { data: null, error: 'not authorized' })
	}	
	const fqd = c.pathParam('fqd')
	if (!fqd) {
		return c.json(200, { data: null, error: 'fqd is required' })
	}
	const info = $apis.requestInfo(c)
	const admin = info.admin // empty if not authenticated as admin

	const { data:s3, error:s3err } = 
	  select({code: '', access_key_id: '', secret_access_key: '', endpoint: ''}, 
	  `select code,access_key_id,secret_access_key,endpoint from s3`)
	if (s3err) {
		return c.json(200, { data: null, error: s3err?.value?.error() || s3err })
	}
	let rcloneConf = ''
	// create /root/.config/rclone/rclone.conf file
	for (let i = 0; i < s3.length; i++) {
		rcloneConf += `[${s3[i].code}]\n`
		rcloneConf += `type = s3\n`
		rcloneConf += `provider = IDrive\n`
		rcloneConf += `access_key_id = ${s3[i].access_key_id}\n`
		rcloneConf += `secret_access_key = ${s3[i].secret_access_key}\n`
		rcloneConf += `endpoint = ${s3[i].endpoint}\n`
	}
	const { data, error } = await configureserver(fqd, rcloneConf);
	console.log('configureserver returned', data, error)
	if (error) {
		return c.json(200, { data: null, error: error?.value?.error() || error })
	} else {
		console.log('configureserver completed', data)
		return c.json(200, { data: data, error: null })
	}	
})

