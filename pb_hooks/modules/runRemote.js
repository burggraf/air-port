const runRemote = (Domain, machine_id, private_ip, cmd) => {
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
            `--access-token`,
            `${config.FLY_ORG_TOKEN}`,
            `-C`,
            `${cmd}`
        )
        console.log('runRemote: fly ssh console cmd', cmd)
        output = String.fromCharCode(...cmd.output())
        console.log('runRemote: fly ssh console output: ', output)
        return c.json(200, { data: output, error: null })
    } catch (err) {
        console.log('runRemote: could not exec fly ssh console', err)
        return c.json(200, { data: null, error: err })
    }	
}
module.exports = { runRemote }