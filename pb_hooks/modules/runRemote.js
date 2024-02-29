const runRemote = (Domain, machine_id, private_ip, command_to_run) => {
    const config = require(`${__hooks}/config.json`)
    let cmd;
    let output;
    // START MACHINE
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
    } catch (err) {
        console.log('runRemote: could not start machine', err)
        return c.json(200, { data: null, error: err })
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
        output = String.fromCharCode(...cmd.output())
        // console.log('***********************************')
        // console.log('runRemote 2: fly ssh console output: ')
        // console.log('***********************************')
        console.log(output)
        // console.log('***********************************')
        return { data: output, error: null }
    } catch (err) {
        console.log('ERROR runRemote 3: could not exec fly ssh console')
        console.log('err.value.stderr >>>>>', String.fromCharCode(...(err.value.stderr)))
        console.log('ERROR command_to_run 4', command_to_run)
        console.log('*************************************')
        console.log(cmd)
        console.log('*************************************')
        return { data: null, error: err }
    }	
}
module.exports = { runRemote }