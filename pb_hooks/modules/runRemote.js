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
            `--command`,
            `/bin/sh -c "${command_to_run.replace(/"/g, '\\"')}"`,
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`
        )
        console.log('runRemote 1: fly ssh console cmd:')
        console.log(cmd)
        output = String.fromCharCode(...cmd.output())
        console.log('runRemote 2: fly ssh console output: ', output)
        return { data: output, error: null }
    } catch (err) {
        console.log('ERROR runRemote 3: could not exec fly ssh console', err)
        console.log('ERROR command_to_run 4', command_to_run)
        return { data: null, error: err }
    }	
}
module.exports = { runRemote }