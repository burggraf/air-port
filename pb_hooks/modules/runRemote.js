const runRemote = async (Domain, machine_id, private_ip, command_to_run) => {
    console.log('*** runRemote', Domain, machine_id, private_ip, command_to_run)
    const { data, error } = await run(Domain, machine_id, private_ip, command_to_run);
    return { data, error };
}
const startMachine = async (Domain, machine_id) => {
    const config = require(`${__hooks}/config.json`)
    let cmd;
    let output;
    try {
        cmd = $os.cmd(
            `fly`,
            `machines`,
            `start`,
            `${machine_id}`,
            `--app`,
            `${Domain}`,
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`
        )
        output = String.fromCharCode(...cmd.output())
        console.log('runRemote: start machine output: ', output)
        return { data: output, error: null}
    } catch (err) {
        console.log('runRemote: could not start machine', err)
        return { data: null, error: err }
    }

}
const run = async (Domain, machine_id, private_ip, command_to_run) => {
    console.log('run...', Domain, machine_id, private_ip, command_to_run)
    const config = require(`${__hooks}/config.json`)
    let cmd;
    let output;
    // START MACHINE
    const { data: startMachineData, error: startMachineError } = 
        await startMachine(Domain, machine_id)
    if (startMachineError) {
        return { data: null, error: startMachineError }
    }
    // RUN COMMAND
    try {
        // fly ssh console -A <ipv6> -a <domain> -C <cmd>
        cmd = $os.cmd(
            `fly`,
            `ssh`,
            `console`,
            `-A`,
            `${private_ip}`,
            `-a`,
            `${Domain}`,
            `-C`,
            // `/bin/sh -c "${command_to_run.replace(/"/g, '\\"')}"`,
            //`'${command_to_run.replace(/'/g, "\\'")}'`,
            //...(command_to_run.split(' ')),
            command_to_run,
            `-t`,
            `${config.FLY_ORG_TOKEN}`
        )
        // console.log('***********************************')
        // console.log('runRemote 1: fly ssh console cmd:')
        // console.log('***********************************')
        // console.log(cmd)
        // console.log('***********************************')
        console.log('running command now')
        console.log('command', command_to_run)
        console.log('we are on:')
        console.log('FLY_APP_NAME', process.env.FLY_APP_NAME)
        console.log('FLY_MACHINE_ID', process.env.FLY_MACHINE_ID)
        console.log('FLY_PRIVATE_IP', process.env.FLY_PRIVATE_IP)
        console.log('FLY_REGION', process.env.FLY_REGION)
        console.log('we are running this on private_ip:', private_ip)
        output = String.fromCharCode(...cmd.output())
        // console.log('***********************************')
        // console.log('runRemote 2: fly ssh console output: ')
        // console.log('***********************************')
        console.log('output', output)
        // console.log('***********************************')
        return { data: output, error: null }
    } catch (err) {
        console.log('command', command_to_run)
        console.log('ERROR', String.fromCharCode(...(err.value.stderr)))
        return { data: null, error: err }
    }	    
}
module.exports = { runRemote, startMachine }