/// <reference path="../pb_data/types.d.ts" />

// rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key \
//      -o StrictHostKeyChecking=no" /pb/pb_public/ root@[$1]:/pb/pb_public/

// const runRemote = (Domain, machine_id, private_ip, command_to_run) => {

routerAdd('POST', '/rsync', async (c) => {
	console.log('rsync 01')
    const { select } = require(`${__hooks}/modules/sql.js`)
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)
    const config = require(`${__hooks}/config.json`)
	const req_data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
    if (!user) return c.json(200, { data: null, error: 'not logged in' })
    if (!user.verified) return c.json(200, { data: null, error: 'user not verified' })
    if (!req_data?.Domain) return c.json(200, { data: null, error: 'Domain is required' })
    if (!req_data?.machine_id) return c.json(200, { data: null, error: 'machine_id is required' })
    const Domain = req_data.Domain
    const { data: machinesData, error: machinesDataError } = select(
        { private_ip: '', machine_id: '', is_primary: false, userid: '', region: ''},
        `select private_ip, machine_id, is_primary, userid, region 
         from machines where Domain = '${Domain}'`
    )
    if (machinesDataError) return c.json(200, { data: null, error: 'error getting machine(s) data' })
    if (machinesData.length < 2) return c.json(200, { data: null, error: 'less than 2 machines found' })
    // get primary machine
    const primaryMachine = machinesData.filter((m) => m.is_primary === true)[0];
    if (!primaryMachine) return c.json(200, { data: null, error: 'primary machine not found' })
    console.log('got primaryMachine: ', primaryMachine.machine_id, primaryMachine.region, Domain)
    if (primaryMachine.userid !== user.id) return c.json(200, { data: null, error: 'not your project' })
    console.log('machine_id test', primaryMachine.machine_id, req_data.machine_id);
    if (primaryMachine.machine_id === req_data.machine_id) return c.json(200, { data: null, error: 'cannot sync to primary machine' })
    // get target machine
    const targetMachine = machinesData.filter((m) => m.machine_id === req_data.machine_id)[0];
    if (!targetMachine) return c.json(200, { data: null, error: 'target machine not found' })
    console.log('got targetMachine: ', targetMachine.machine_id, targetMachine.region, Domain)

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

});
