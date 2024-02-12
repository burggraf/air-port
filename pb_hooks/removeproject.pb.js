routerAdd('POST', '/removeproject', async (c) => {
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
	if (data?.project_instance?.owner !== user?.id) {
		return c.json(200, { data: null, error: 'not your project' })
	}
	if (data?.project_instance?.ownertype !== 'person' && data?.project?.ownertype !== 'org') {
		return c.json(200, { data: null, error: 'ownertype must be "person" or "org"' })
	}
	if (!data?.project_instance?.id) {
		return c.json(200, { data: null, error: 'project_instance id is required' })
	}
	const domain = data?.project_instance?.domain
	const port = data?.project_instance?.port
	const project_instance_id = data?.project_instance?.id
	const project_id = data?.project_instance?.project_id
	const site_domain = data?.project_instance?.site_domain
	// console.log('domain', domain)
	// console.log('port', port)
	// console.log('project_instance_id', project_instance_id)
	// console.log('project_id', project_id)
	// console.log('site_domain', site_domain)
	if (!domain) {
		return c.json(200, { data: null, error: 'project_instance.domain is required' })
	}
	if (!port) {
		return c.json(200, { data: null, error: 'project_instance.port is required' })
	}
	if (!project_id) {
		return c.json(200, { data: null, error: 'project.id is required' })
	}
	if (!site_domain) {
		return c.json(200, { data: null, error: 'project_instance.site_domain is required' })
	}	
	try {
		const res = await $http.send({
			url: `http://${site_domain}:5000/removeproject`,
			method: 'POST',
			body: JSON.stringify({
				domain: domain + '.' + site_domain,
				port: port.toString(),
			}),
			headers: {
				'content-type': 'application/json',
				Authorization: 'your_predefined_auth_token',
			},
			timeout: 120, // in seconds
		})
		if (res.json?.error) {
			return c.json(200, { data: null, error: res.json.error })
		} else {
			try {
				$app
					.dao()
					.db()
					.newQuery(
						`delete from project_instance_keys where project_instance_id = '${project_instance_id}'`
					)
					.execute()
			} catch (removeProjectInstanceKeysError) {
				//removeProjectInstanceError.value.error()
				const error_to_return = removeProjectInstanceKeysError.value.error()
				return c.json(200, {
					data: null,
					error: error_to_return || JSON.stringify(removeProjectInstanceKeysError),
				})
			}

			try {
				const res = await $http.send({
					url: `http://${site_domain}:5000/removeuser`,
					method: 'POST',
					body: JSON.stringify({
						username: domain,
					}),
					headers: {
						'content-type': 'application/json',
						Authorization: 'your_predefined_auth_token',
					},
					timeout: 120, // in seconds
				})
				if (res.json?.error) {
					return c.json(200, { data: null, error: res.json.error })
				}
			} catch (removeUserError) {
				const error_to_return = removeUserError.value.error()
				return c.json(200, {
					data: null,
					error: error_to_return || JSON.stringify(removeUserError),
				})
			}

			try {
				$app
					.dao()
					.db()
					.newQuery(`delete from project_instance where id = '${project_instance_id}'`)
					.execute()
			} catch (removeProjectInstanceError) {
				//removeProjectInstanceError.value.error()
				const error_to_return = removeProjectInstanceError.value.error()
				return c.json(200, {
					data: null,
					error: error_to_return || JSON.stringify(removeProjectInstanceError),
				})
			}
			try {
				// are there any more project instances for this project?
				const projectInstanceCount = arrayOf(
					new DynamicModel({
						thecount: 0,
					})
				)
				$app
					.dao()
					.db()
					.newQuery(
						`select count(*) as thecount from project_instance where project_id = '${project_id}'`
					)
					.all(projectInstanceCount) // throw an error on db failure
				if (projectInstanceCount[0].thecount === 0) {
					// delete project
					try {
						$app
							.dao()
							.db()
							.newQuery(`delete from projects where id = '${project_id}'`)
							.execute()
					} catch (removeProjectError) {
						//removeProjectInstanceError.value.error()
						const error_to_return = removeProjectError.value.error()
						return c.json(200, {
							data: null,
							error: error_to_return || JSON.stringify(removeProjectError),
						})
					}
					// finished???
					return c.json(200, { data: "0", error: null })
				} else {
					return c.json(200, { data: `${projectInstanceCount[0].thecount}`, error: null })
				}
			} catch (projectInstanceCountError) {
				//removeProjectInstanceError.value.error()
				const error_to_return = projectInstanceCountError.value.error()
				return c.json(200, {
					data: null,
					error: error_to_return || JSON.stringify(projectInstanceCountError),
				})
			}
		}
		// reload domain_ports.txt file to update domain port mappings
		// ssh ubuntu@$1  "sudo kill -HUP \$(cat /var/run/nginx.pid)"
	} catch (projectInsertError) {
		return c.json(200, { data: null, error: projectInsertError.value.error() })
	}
})
