/// <reference path="../pb_data/types.d.ts" />

// rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key \
//      -o StrictHostKeyChecking=no" /pb/pb_public/ root@[$1]:/pb/pb_public/

// const runRemote = (Domain, machine_id, private_ip, command_to_run) => {

routerAdd('POST', '/rsync', (c) => {
	console.log('rsync 01')
    const { select } = require(`${__hooks}/modules/sql.js`)
	const { runRemote } = require(`${__hooks}/modules/runRemote.js`)
    const config = require(`${__hooks}/config.json`)
	const data = $apis.requestInfo(c).data
	const info = $apis.requestInfo(c)
	const user = info.authRecord // empty if not authenticated as regular auth record
    if (!user) return c.json(200, { data: null, error: 'not logged in' })
    if (!user.verified) return c.json(200, { data: null, error: 'user not verified' })
    if (!data?.Domain) return c.json(200, { data: null, error: 'Domain is required' })
    if (!data?.machine_id) return c.json(200, { data: null, error: 'machine_id is required' })
    const Domain = data.Domain
    const { data: machinesData, error: machinesDataError } = select(
        { private_ip: '', machine_id: '', is_primary: false, userid: '', region: ''},
        `select private_ip, machine_id, is_primary, userid, region 
         from machines where Domain = '${data.Domain}'`
    )
    if (machinesDataError) return c.json(200, { data: null, error: 'error getting machine(s) data' })
    if (machinesData.length < 2) return c.json(200, { data: null, error: 'less than 2 machines found' })
    // get primary machine
    const primaryMachine = machinesData.filter((m) => m.is_primary === true)[0];
    if (!primaryMachine) return c.json(200, { data: null, error: 'primary machine not found' })
    console.log('got primaryMachine: ', primaryMachine.machine_id, primaryMachine.region, Domain)
    if (primaryMachine.userid !== user.id) return c.json(200, { data: null, error: 'not your project' })
    if (primaryMachine.machine_id === data.machine_id) return c.json(200, { data: null, error: 'cannot sync to primary machine' })
    // get target machine
    const targetMachine = machinesData.filter((m) => m.machine_id === data.machine_id)[0];
    if (!targetMachine) return c.json(200, { data: null, error: 'target machine not found' })
    console.log('got targetMachine: ', targetMachine.machine_id, targetMachine.region, Domain)

    let cmd;
    let output;
    // START MACHINES
    try {
        cmd = $os.cmd(
            `fly`,
            `machines`,
            `start`,
            `${primaryMachine.machine_id}`,
            `--app`,
            `${Domain}`,
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`
        )
        console.log('start primary machine cmd: ', cmd)
        output = String.fromCharCode(...cmd.output())
        console.log('start primary machine output: ', output)
    } catch (err) {
        console.log('could not start primary machine', err)
        return c.json(200, { data: null, error: err })
    }
    try {
        cmd = $os.cmd(
            `fly`,
            `machines`,
            `start`,
            `${targetMachine.machine_id}`,
            `--app`,
            `${Domain}`,
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`
        )
        console.log('start target machine cmd: ', cmd)
        output = String.fromCharCode(...cmd.output())
        console.log('start target machine output: ', output)
    } catch (err) {
        console.log('could not start target machine', err)
        return c.json(200, { data: null, error: err })
    }


    const { data: publicData, error: publicError } = runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_public/ root@[${targetMachine.private_ip}]:/pb/pb_public/`
    )
    if (publicError) console.log('publicError', publicError)
    if (publicError) return c.json(200, { data: null, error: publicError })
    if (publicData) console.log('publicData', publicData)

    const { data: migrationsData, error: migrationsError } = runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_migrations/ root@[${targetMachine.private_ip}]:/pb/pb_migrations/`
    )
    if (migrationsError) console.log('migrationsError', migrationsError)
    if (migrationsError) return c.json(200, { data: null, error: migrationsError })
    if (migrationsData) console.log('migrationsData', migrationsData)

    const { data: hooksData, error: hooksError } = runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_hooks/ root@[${targetMachine.private_ip}]:/pb/pb_hooks/`
    )
    if (hooksError) console.log('hooksError', hooksError)
    if (hooksError) return c.json(200, { data: null, error: hooksError })
    if (hooksData) console.log('publicData', hooksData)

    const { data: dataData, error: dataError } = runRemote(
        Domain,
        primaryMachine.machine_id,
        primaryMachine.private_ip,
        `rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_data/ root@[${targetMachine.private_ip}]:/pb/pb_data/`
    )
    if (dataError) console.log('dataError', dataError)
    if (dataError) return c.json(200, { data: null, error: dataError })
    if (dataData) console.log('publicData', dataData)
    return c.json(200, { data: 'OK', error: null })

// rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key \
//      -o StrictHostKeyChecking=no" /pb/pb_public/ root@[$1]:/pb/pb_public/

// const runRemote = (Domain, machine_id, private_ip, command_to_run) => {

});
