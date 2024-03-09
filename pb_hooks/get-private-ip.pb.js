/// <reference path="../pb_data/types.d.ts" />

$app.rootCmd.addCommand(new Command({
    use: "get-private-ip",
    run: (cmd, args) => {
        const { select } = require(`${__hooks}/modules/sql.js`)
        if (args.length === 0) {
            console.log('get-private-ip <Domain> [region | machine_id]')
            return
        }
        if (args.length === 1) {
            try {
                const { data } = select(
                    { private_ip: ''},
                    `select private_ip from machines where Domain = '${args[0]}' and is_primary = true limit 1`
                )
                if (data) console.log(data[0].private_ip) 
                else console.log('')
                return;
            } catch (error) {
                console.log('')
                return;
            }
        }
        if (args.length === 2 && args[1].length === 3) {
            try {
                const { data } = select(
                    { private_ip: ''},
                    `select private_ip from machines where Domain = '${args[0]}' and region = '${args[1]}' limit 1`
                )    
                if (data) console.log(data[0].private_ip) 
                else console.log('')
                return;
            } catch (error) {
                console.log('')
                return;
            }
        } else {
            try {
                const { data, error } = select(
                    { private_ip: ''},
                    `select private_ip from machines where Domain = '${args[0]}' and machine_id = '${args[1]}' limit 1`
                )
                if (data) console.log(data[0].private_ip) 
                else console.log('')
                return;    
            } catch (error) {
                console.log('')
                return;
            }
        }
    },
}))