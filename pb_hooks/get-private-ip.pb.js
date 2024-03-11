/// <reference path="../pb_data/types.d.ts" />
routerAdd('GET', '/get-private-ip/:Domain', async (c) => {
	// const token = c.request().header.get("Authorization")
	// if (!token || token !== 'my_secret_token') {
	// 	return c.json(200, 'not authorized')
	// }	
    const { select } = require(`${__hooks}/modules/sql.js`)
    const Domain = c.pathParam('Domain')
    if (!Domain) return c.json(200, 'Domain is required')
    try {
        const { data } = select(
            { private_ip: ''},
            `select private_ip from machines where Domain = '${Domain}' and is_primary limit 1`
        )
        if (data) return c.json(200, data[0].private_ip)
        else return c.json(200, 'ERR-1')
    } catch (error) {
        return c.json(200, 'ERR-2:'+JSON.stringify(error))
    }
});
routerAdd('GET', '/get-private-ip/:Domain/:region_or_machine_id', async (c) => {
	// const token = c.request().header.get("Authorization")
	// if (!token || token !== 'my_secret_token') {
	// 	return c.json(200, 'not authorized')
	// }	
    const { select } = require(`${__hooks}/modules/sql.js`)
    const Domain = c.pathParam('Domain')
    if (!Domain) return c.json(200,'Domain is required')
    const region_or_machine_id = c.pathParam('region_or_machine_id')
    if (!region_or_machine_id) return c.json(200, 'region_or_machine_id is required')
    if (region_or_machine_id.length === 3) { // region
        try {
            const { data } = select(
                { private_ip: ''},
                `select private_ip from machines where Domain = '${Domain}' and region = '${region_or_machine_id}' limit 1`
            )
            if (data) return c.json(200, data[0].private_ip)
            else return c.json(200, 'ERR-1')
        } catch (error) {
            return c.json(200, 'ERR-2:'+JSON.stringify(error))
        }    
    } else { // machine_id
        try {
            const { data } = select(
                { private_ip: ''},
                `select private_ip from machines where Domain = '${Domain}' and machine_id = '${region_or_machine_id}' limit 1`
            )
            if (data) return c.json(200, data[0].private_ip)
            else return c.json(200, 'ERR-1')
        } catch (error) {
            return c.json(200, 'ERR-2:'+JSON.stringify(error))
        }    

    }
});