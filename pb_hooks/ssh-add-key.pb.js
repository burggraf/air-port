/// <reference path="../pb_data/types.d.ts" />

routerAdd('POST', '/ssh-add-key', async (c) => {
	console.log('ssh-add-key 01')
    const { select } = require(`${__hooks}/modules/sql.js`)
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)
    // const config = require(`${__hooks}/config.json`)
	const req_data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
    if (!user) return c.json(200, { data: null, error: 'not logged in' })
    if (!user.verified) return c.json(200, { data: null, error: 'user not verified' })
    if (!req_data?.Domain) return c.json(200, { data: null, error: 'Domain is required' })
    if (!req_data?.machine_id) return c.json(200, { data: null, error: 'machine_id is required' })
    if (!req_data?.public_key) return c.json(200, { data: null, error: 'public_key is required' })
    const Domain = req_data.Domain
    const machine_id = req_data.machine_id
    const public_key = req_data.public_key
    console.log('ssh-add-key 02', Domain, machine_id, public_key.substring(0, 20) + '...')
    const { data: machineData, error: machineDataError } = select(
        { private_ip: '', userid: ''},
        `select private_ip, userid 
         from machines where machine_id = '${machine_id}'`
    )
    if (machineDataError) return c.json(200, { data: null, error: 'error getting machine data' })
    if (machineData.length > 1) return c.json(200, { data: null, error: 'duplicate machines found' })
    if (machineData.length < 1) return c.json(200, { data: null, error: 'machine not found' })
    if (machineData[0].userid !== user.id) return c.json(200, { data: null, error: 'not your machine' })
    console.log('ssh-add-key 03', machineData[0].private_ip)
    const private_ip = machineData[0].private_ip
    let cmd;
    let output;
	try {
		cmd = $os.cmd(
			`/pb/ssh-adduser`,
			`${Domain}`,
		)
		output = String.fromCharCode(...cmd.output())
	} catch (err) {
		console.log('could not complete ssh-adduser', err)
		return c.json(200, { data: null, error: err })
	}
    const air_port_app_key = output
    console.log('ssh-add-key 04', air_port_app_key)
	try {
		cmd = $os.cmd(
			`/pb/ssh-add-key`,
			`${Domain}`,
            `${public_key}`
		)
		output = String.fromCharCode(...cmd.output())
	} catch (err) {
		console.log('could not complete ssh-add-key', err)
		return c.json(200, { data: null, error: err })
	}
    console.log('ssh-add-key 05', output)
    const { data: addKeyData, error: addKeyError } = await runRemote(
        Domain,
        machine_id,
        private_ip,
        `/add-key.sh "${air_port_app_key}"`
    )
    // `/bin/sh -c "rm -f /pb/litestream.yml"`
    if (addKeyError) console.log('could not complete /addkey.sh', addKeyError)
    if (addKeyError) return c.json(200, { data: null, error: addKeyError })
    console.log('ssh-add-key 06', addKeyData)

    return c.json(200, { data: 'OK', error: null })

    /*

    let cmd;
    let output;
    // ************* rsync ***************
    const { data: publicData, error: publicError } = await runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_public/ root@[${targetMachine.private_ip}]:/pb/pb_public/`
    )
    if (publicError) return c.json(200, { data: null, error: publicError })

    const { data: migrationsData, error: migrationsError } = await runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_migrations/ root@[${targetMachine.private_ip}]:/pb/pb_migrations/`
    )
    if (migrationsError) return c.json(200, { data: null, error: migrationsError })

    const { data: hooksData, error: hooksError } = await runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_hooks/ root@[${targetMachine.private_ip}]:/pb/pb_hooks/`
    )
    if (hooksError) return c.json(200, { data: null, error: hooksError })

    const { data: dataData, error: dataError } = await runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_data/ root@[${targetMachine.private_ip}]:/pb/pb_data/`
    )
    if (dataError) return c.json(200, { data: null, error: dataError })

    // RESTART MARMOT ON THE TARGET MACHINE
    const { data: marmotData, error: marmotError } = await runRemote(
        Domain,
        targetMachine.machine_id,
        targetMachine.private_ip,
        `/bin/sh -c "/reset_marmot.sh"`)
    if (marmotError) return c.json(200, { data: null, error: marmotError })

    return c.json(200, { data: 'OK', error: null })
    */

});
