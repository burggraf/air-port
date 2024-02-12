/// <reference path="../pb_data/types.d.ts" />

routerAdd('GET', '/log-disk-usage', async (c) => {
	const token = c.request().header.get("Authorization")
	if (!token || token !== 'my_secret_token') {
		return c.json(200, { data: null, error: 'not authorized' })
	}	
    const { getdiskspace } = require(`${__hooks}/modules/callbackend.js`)
    const { execute } = require(`${__hooks}/modules/sql.js`)
    let sites = [];
    const get_sites = async () => {
        try {
            const sites_buffer = arrayOf(
                new DynamicModel({
                    id: '',
                    name: '',
                    domain: '',
                })
            )
            $app
                .dao()
                .db()
                .newQuery(
                    `select id, name, domain from sites where active = true`
                )
                .all(sites_buffer) // throw an error on db failure
            sites = sites_buffer
            return true;
        } catch (err) {
            console.log('cron: get_sites error', err, (new Date()).toLocaleString())
            return false;
        }
    }
    const gotSites = await get_sites();
    if (!gotSites) {
        return c.json(200, { data: null, error: 'error getting sites' })
    }
    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        const { data, error } = await getdiskspace(site.domain, '*', '0')
        if (error) {
            console.log('cron: getdiskspace error', error, (new Date()).toLocaleString())
            return c.json(200, { data: null, error: error?.value?.error() || error })
        } else {
            // got data, let's import it into the database
            for (let j = 0; j < data.length; j++) {
                const item = data[j].split('\t');
                if (item.length !== 2) continue;
                const { data: insertData, error: insertError } = 
                execute(`insert into disk_usage (site_id, port, ts, size)
                values ('${site.id}', '${item[1]}', '${Math.round((+new Date()) / 1000)}', '${item[0]}')`);
                if (insertError) {
                    console.log('cron: insert disk_usage error', JSON.stringify(insertError), (new Date()).toLocaleString())
                    console.log(`insert into disk_usage (site_id, port, ts, size)
                    values ('${site.id}', '${item[1]}', '${Math.round((+new Date()) / 1000)}', '${item[0]}')`)
                    return c.json(200, { data: null, error: insertError?.value?.error() || insertError })
                }
            }
            console.log(`${site.domain} diskspace:`, JSON.stringify(data,null,2))
        }
    }
    const { data: updateInstanceIDsData, error: updateInstanceIDsError } = 
    execute(`update disk_usage 
            set instance_id = coalesce(
                (select id from project_instance where project_instance.port = disk_usage.port 
                  and project_instance.site_id = disk_usage.site_id)
                ,'MISSING') where disk_usage.instance_id = ''`);
    if (updateInstanceIDsError) {
        console.log('cron: updateInstanceIDs error', updateInstanceIDsError, (new Date()).toLocaleString())
        return c.json(200, { data: null, error: updateInstanceIDsError?.value?.error() || updateInstanceIDsError })
    }
    return c.json(200, { data: 'success', error: null })
});
