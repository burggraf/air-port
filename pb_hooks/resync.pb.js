/// <reference path="../pb_data/types.d.ts" />
// **** add ssh keys to an instance ****
routerAdd('GET', '/resync/:project_id', (c) => {
	console.log('resync 01')
	const { toggleinstance, sync } = require(`${__hooks}/modules/callbackend.js`)
	const { execute, select } = require(`${__hooks}/modules/sql.js`)
	//
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
	let instances
	try {
		instances = arrayOf(
			new DynamicModel({
				type: '',
				owner: '',
				ownertype: '',
				port: 0,
				site_domain: '',
			})
		)
		$app
			.dao()
			.db()
			.newQuery(
				`select type, owner, ownertype, port, site_domain from instance_view where project_id = '${project_id}' order by type`
			)
			.all(instances) // throw an error on db failure

		if (instances.length < 2) {
			return c.json(200, { data: null, error: 'less than 2 instances found' })
		}
	} catch (instancesErr) {
		return c.json(200, { data: null, error: instancesErr?.value?.error() || instancesErr })
	}
	console.log('resync 02, instances', instances, instances.length)
	if (instances[0].owner !== user.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	const primary = instances[0]
	if (primary.type !== 'primary') {
		return c.json(200, { data: null, error: 'first instance is not a primary instance' })
	}
	//
	const sync_all_instances = async () => {
		console.log('resync_all_instances')
		try {
			console.log('resync 03, primary', primary.site_domain, primary.port)
			console.log('sync', typeof sync)
			// destination hard-coded to "la" for now
			const { data: primarySyncData, error: primarySyncError } = sync(
				`sync ${primary.port} la:azabab/${primary.port}/sync --exclude marmot/marmot.toml`,
				primary.site_domain
			)
			console.log('resync 03, primarySyncData', JSON.stringify(primarySyncData))
			console.log('resync 03, primarySyncError', JSON.stringify(primarySyncError))
			if (primarySyncError) {
				return c.json(200, { data: null, error: primarySyncError })
			}
			for (let i = 1; i < instances.length; i++) {
				const instance = instances[i]
				console.log('resync 04, instance', instance.site_domain)
				if (instance.type === 'primary') {
					continue
				}
				const { data: syncData, error: syncError } = sync(
					`sync la:azabab/${primary.port}/sync ${primary.port} --exclude marmot/marmot.toml`,
					instance.site_domain
				)
				if (syncError) {
					console.log(`${instance.site_domain} syncError`, syncError)
					return c.json(200, { data: null, error: syncError })
				}
			}
			// remove the sync data now
			const { data: deleteSyncData, error: deleteSyncError } = sync(
				`delete la:azabab/${primary.port}/sync`,
				primary.site_domain
			)
			if (deleteSyncError) {
				return c.json(200, { data: null, error: deleteSyncError })
			}
		} catch (err) {
			console.log('ERROR: sync_all_instances', JSON.stringify(err))
			return c.json(200, { data: null, error: err?.value?.error() || err })
		}
		// try {
		// 	// take all instances offline
		// 	for (let i = 0; i < instances.length; i++) {
		// 		const instance = instances[i]
		// 		toggleStatus(instance.site_domain, instance.port, 'online', instance.id)
		// 	}
		// } catch (toggleinstanceError) {
		// 	return c.json(200, {
		// 		data: null,
		// 		error: toggleinstanceError?.value?.error() || toggleinstanceError,
		// 	})
		// }

		return c.json(200, { data: `resynced ${instances.length} instances`, error: null })
	}
	console.log('resync ready to resync_all_instances');
	sync_all_instances()
})
