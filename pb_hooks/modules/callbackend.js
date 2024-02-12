const updateroutes = (project_id, current_user_id) => {
	const { select } = require(`${__hooks}/modules/sql.js`)

    const { data: dnsData, error: dnsError } = 
        select({domain: ''}, `select domain from sites where dns_host is true`);
    if (dnsError) return { data: null, error: dnsError };
    // console.log('updateroutes, dnsData', JSON.stringify(dnsData, null, 2))

	const { data: instanceData, error: instanceError } = 
		select({port: 0, site_domain: '', domain: '', owner: '', ownertype: '', project_metadata: {}, instance_status: ''},
		`select port, site_domain, domain, owner, ownertype, project_metadata, instance_status 
         from instance_view 
         where project_id = '${project_id}' 
         order by type`);
    if (instanceError) return { data: null, error: instanceError };
	if (instanceData.length === 0) return { data: null, error: 'instance(s) not found' };
	if (instanceData[0].owner !== current_user_id) return { data: null, error: 'not your project' };	
    for (let i = 0; i < instanceData.length; i++) {
        const instance = instanceData[i];
        const port = instance.port.toString();
        const domain = instance.domain;
        const site_domain = instance.site_domain;
        const pb_version = instance.project_metadata?.get("pb_version") || 'v0.21.1';
        const otherServers = [];
        const instance_status = instance.instance_status;
        for (let j = 0; j < instanceData.length; j++) {
            const otherInstance = instanceData[j];
            if (otherInstance.site_domain !== instance.site_domain) {
                otherServers.push({
                    domain: otherInstance.domain,
                    site_domain: otherInstance.site_domain,
                    port: otherInstance.port,
                })
            }
        }
        let updateRouteTrials = 0;
        let updatedRoute = false;
        if (updateRouteTrials <= 3 && !updatedRoute) {
            const { data, error } = updateroute(port, domain, site_domain, pb_version, otherServers, instance_status);
            if (error) {
                console.error('got error from updateroute (port, domain, site_domain, error)',
                port, domain, site_domain, error)
                console.error('updateRouteTrials', updateRouteTrials)
                updateRouteTrials++;
                if (updateRouteTrials === 3) return { data: null, error: error };
            } else {
                updatedRoute = true;   
            }
        }
        // remove this entry from the dnsData if it exists
        for (let k = 0; k < dnsData.length; k++) {
                // console.log('removing this entry from dnsData if necessary' );
                // console.log('dnsData[k].domain', dnsData[k].domain)
                // console.log('site_domain', site_domain)
                if (dnsData[k].domain === site_domain) {
                // console.log('removing it')
                dnsData.splice(k, 1);
                // console.log('dnsData is now', JSON.stringify(dnsData, null, 2))
            }
        }
    } 
    // now we are left with the dnsData items that need to be updated
    // this is because they are not in the instanceData and the dns hosts need to answer for
    // this domain and point it to the correct server(s)
    // console.log('should we update the dns routes here?', dnsData.length);
    if (dnsData.length > 0) {
        const { data: dnsUpdateData, error: dnsUpdateError } = 
            update_dns_only_routes(dnsData, instanceData);
        // console.log('update_dns_only_routes data', JSON.stringify(dnsUpdateData, null, 2));
        // console.log('update_dns_only_routes error', JSON.stringify(dnsUpdateError, null, 2));
        if (dnsUpdateError) return { data: null, error: dnsUpdateError };
    }
    // console.log('returning OK from updateroutes');
    return { data: 'OK', error: null };
}
const updateroute = (port, domain, site_domain, pb_version, otherServers, instance_status) => {
    let frontendRoute = frontendRouteTemplate;
    let backendRoute = backendRouteTemplate;
    let statusPort = port; // the standard port
    switch (instance_status) {
        case 'maintenance':
            statusPort = '9998';
            break;
        case 'offline':
            statusPort = '9999';
            break;
        default:
            statusPort = port;
    }
    frontendRoute = frontendRoute.replace(/\[PORT\]/g, port);
    frontendRoute = frontendRoute.replace(/\[STATUSPORT\]/g, statusPort);
    frontendRoute = frontendRoute.replace(/\[LOCAL_FQD\]/g, domain + '.' + site_domain);
    frontendRoute = frontendRoute.replace(/\[GLOBAL_FQD\]/g, domain + '.' + 'azabab.com');
    frontendRoute = frontendRoute.replace(/\[PB_VERSION\]/g, pb_version);
    backendRoute = backendRoute.replace(/\[PORT\]/g, port);
    backendRoute = backendRoute.replace(/\[STATUSPORT\]/g, statusPort);
    backendRoute = backendRoute.replace(/\[LOCAL_FQD\]/g, domain + '.' + site_domain);
    backendRoute = backendRoute.replace(/\[GLOBAL_FQD\]/g, domain + '.' + 'azabab.com');
    backendRoute = backendRoute.replace(/\[PB_VERSION\]/g, pb_version);
    let otherServersString = '';
    for (let i = 0; i < otherServers.length; i++) {
        const otherServer = otherServers[i];
        otherServersString += 
        `    server ${otherServer.site_domain}_${otherServer.port} ${otherServer.domain}.${otherServer.site_domain}:80 check\n`;
    }
    frontendRoute = frontendRoute.replace(/\[OTHER_SERVERS\]/g, otherServersString);
    backendRoute = backendRoute.replace(/\[OTHER_SERVERS\]/g, otherServersString);
    let retryCount = 0;
    // put the routing file on the server
    let updateRouteResponse;
    try {
        updateRouteResponse = $http.send({
            url: `http://${site_domain}:5000/updateroute`,
            method: 'POST',
            body: JSON.stringify({
                port: port,
                frontend: frontendRoute,
                backend: backendRoute,
            }),
            headers: {
                'content-type': 'application/json',
                Authorization: 'your_predefined_auth_token',
            },
            timeout: 120, // in seconds
        })
        if (updateRouteResponse.json?.error) {
            console.error('**********************************************')
            console.error('update route error (port, domain, site_domain, pb_version, otherServers, instance_status)', 
                    port, domain, site_domain, pb_version, otherServers, instance_status)
            console.error('**********************************************')
            return { data: null, error: updateRouteResponse.json.error || updateRouteResponse.json || updateRouteResponse.raw };                
        }  else {
            const ts = +new Date();
            let healthy = false;
            let tries = 0;
            while (!healthy && (+new Date()) - ts < 20000) {
                // only perform check once per second for 20 seconds
                const elapsed = (+new Date()) - ts;
                if (elapsed > (tries * 1000)) {
                    const result = checkHealth(domain + '.' + site_domain);
                    if (result === 200) {
                        healthy = true;
                        // return { data: res, error: null };
                    }
                    tries++;    
                }
            }
            if (!healthy) {
                return { data: null, error: 'health check failed' };    
            } else {
                return { data: updateRouteResponse, error: null };
            }
        }
    } catch (updaterouteError) {
        console.error('updaterouteError', updaterouteError);
        console.error('updateRouteResponse', JSON.stringify(updateRouteResponse, null, 2))
        return { data: null, error: updaterouteError?.value?.error() || updaterouteError };		
    }
}
const update_dns_only_routes = (dnsData, instanceData) => {
    // console.log('*** update_dns_only_routes ***')
    // console.log('dns items to be updated:', JSON.stringify(dnsData, null, 2))
    // console.log('with these instances:', instanceData.map(i => i.site_domain))
    const port = instanceData[0].port.toString();
    const domain = instanceData[0].domain;
    const pb_version = instanceData[0].project_metadata?.get("pb_version") || 'v0.21.1';

    let frontendRoute = frontendRouteTemplateForDNS;
    let backendRoute = backendRouteTemplateForDNS;
    frontendRoute = frontendRoute.replace(/\[PORT\]/g, port);
    frontendRoute = frontendRoute.replace(/\[GLOBAL_FQD\]/g, domain + '.' + 'azabab.com');
    frontendRoute = frontendRoute.replace(/\[PB_VERSION\]/g, pb_version);
    backendRoute = backendRoute.replace(/\[PORT\]/g, port);
    backendRoute = backendRoute.replace(/\[GLOBAL_FQD\]/g, domain + '.' + 'azabab.com');
    backendRoute = backendRoute.replace(/\[PB_VERSION\]/g, pb_version);
    let otherServersString = '';
    for (let i = 0; i < instanceData.length; i++) {
        const otherServer = instanceData[i];
        otherServersString += 
        `    server ${otherServer.site_domain}_${otherServer.port} ${otherServer.domain}.${otherServer.site_domain}:80 check\n`;
    }
    frontendRoute = frontendRoute.replace(/\[OTHER_SERVERS\]/g, otherServersString);
    backendRoute = backendRoute.replace(/\[OTHER_SERVERS\]/g, otherServersString);
    for (let i = 0; i < dnsData.length; i++) {
        // console.log('updating dns route, i:', i);
        const dnsItem = dnsData[i];
        let retryCount = 0;
        // put the routing file on the server
        let updateRouteResponse;
        try {
            // console.log(`updating dns route ${dnsItem.domain}`);
            // console.log('port', port, typeof port)
            // console.log('frontendRoute', frontendRoute)
            // console.log('backendRoute', backendRoute)
            updateRouteResponse = $http.send({
                url: `http://${dnsItem.domain}:5000/updateroute`,
                method: 'POST',
                body: JSON.stringify({
                    port: port,
                    frontend: frontendRoute,
                    backend: backendRoute,
                }),
                headers: {
                    'content-type': 'application/json',
                    Authorization: 'your_predefined_auth_token',
                },
                timeout: 120, // in seconds
            })
            // console.log('updateRouteResponse', JSON.stringify(updateRouteResponse, null, 2))
            if (updateRouteResponse.json?.error) {
                console.error('**********************************************')
                console.error('update dns route error', dnsItem.domain)
                console.error('**********************************************')
                return { data: null, error: updateRouteResponse.json.error || updateRouteResponse.json || updateRouteResponse.raw };                
            }
        } catch (updaterouteError) {
            console.error('updateDNSrouteError', updaterouteError);
            console.error('updateDNSRouteResponse', JSON.stringify(updateRouteResponse, null, 2))
            return { data: null, error: updaterouteError?.value?.error() || updaterouteError };		
        }
    }
    // console.log('finished updating dns routes');
    return { data: 'OK', error: null };
}

const checkHealth = (domain) => {
    // console.log('checkHealth: ',`https://${domain}/api/health`)
    const test = $http.send({
        url: `https://${domain}/api/health`,
        method: 'GET',
        timeout: 120, // in seconds                    
    })
    if (test.statusCode !== 200) console.error(`checkHealth https://${domain}/api/health status code ${test.statusCode}`)
    return test.statusCode;
}
const frontendRouteTemplate = `
    acl is_[PORT]_local hdr(host) -i [LOCAL_FQD]
    acl is_[PORT]_global hdr(host) -i [GLOBAL_FQD] 

    # Define the condition for primary server down
    acl primary_down_[PORT] nbsrv(backend_global_[PORT]_[GLOBAL_FQD]) lt 2

    # Backend selection based on ACLs
    use_backend backend_local_[PORT]_[LOCAL_FQD] if is_[PORT]_local
    use_backend backend_global_[PORT]_[GLOBAL_FQD] if is_[PORT]_global
`;
const backendRouteTemplate = `
# Backend for alpha_lax_hh_azabab_com
backend backend_local_[PORT]_[LOCAL_FQD]
    http-request set-header X-Original-URI %[url]
    http-request set-header X-Original-Port [PORT]
    http-request set-header X-PB-Version [PB_VERSION]
    server local_app_[PORT] 127.0.0.1:[STATUSPORT] check
    server local_error_handler_[PORT] 127.0.0.1:5000 backup

# Backend for backend_global_[PORT]_[GLOBAL_FQD]
backend backend_global_[PORT]_[GLOBAL_FQD]
    http-request set-header X-Original-URI %[url]
    http-request set-header X-Original-Port [PORT]
    http-request set-header X-PB-Version [PB_VERSION]

    balance roundrobin
    # option ssl-hello-chk
    stick-table type string len 50 size 30k expire 30m 
    stick on src

    # other servers below
    server global_app_[PORT] 127.0.0.1:[STATUSPORT] check
[OTHER_SERVERS]
    server global_error_handler_[PORT] 127.0.0.1:5000 backup
`;
const frontendRouteTemplateForDNS = `
    acl is_[PORT]_global hdr(host) -i [GLOBAL_FQD] 
    use_backend backend_global_[PORT]_[GLOBAL_FQD] if is_[PORT]_global
`;
const backendRouteTemplateForDNS = `
# Backend for backend_global_[PORT]_[GLOBAL_FQD]
backend backend_global_[PORT]_[GLOBAL_FQD]
    http-request set-header X-Original-URI %[url]
    http-request set-header X-Original-Port [PORT]
    http-request set-header X-PB-Version [PB_VERSION]

    balance roundrobin
    # option ssl-hello-chk
    stick-table type string len 50 size 30k expire 30m 
    stick on src
[OTHER_SERVERS]
`;

const sync = async (sync_command, site_domain) => {
    // console.log('**********************************************')
    // console.log('callbackend: sync_command', sync_command);
    // console.log('**********************************************')
    // console.log('sync 01')
    try {
        // console.log('sync 02')
        const data = {
            command: sync_command
        };
        // console.log('sync 03')
        // console.log('**********************************************')
        // console.log(`calling: http://${site_domain}:5000/sync`)
        // console.log('with data', JSON.stringify(data, null, 2));
        // console.log('**********************************************')
        // console.log('sync 04')
        const res = $http.send({
            url: `http://${site_domain}:5000/sync`,
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json',
                Authorization: 'your_predefined_auth_token',
            },
            timeout: 120, // in seconds
        })
        // console.log('sync 05')
        // console.log('**********************************************')
        // console.log('callbackend: sync res', JSON.stringify(res, null, 2));
        // console.log('**********************************************')
        if (res.json?.data !== 'Sync operation complete') {
            return { data: null, error: res.json?.error || res.raw };
        }
        else {
            return { data: res, error: null };        
        }
    } catch (httpError) {
        return { data: null, error: httpError?.value?.error() || httpError };
    }
}

const createuser = async (key) => {
    // key: {username,port,ssh_key_string, site}
    if (typeof key.port !== 'string') key.port = key.port.toString();
    let res;
    try {
        res = await $http.send({
            url:     `http://${key.site}:5000/createuser`,
            method:  "POST",
            body:    JSON.stringify({
                "username": key.username, 
                "port": key.port,
                "ssh_keys": key.ssh_key_string,
            }),
            headers: {
                "content-type": "application/json",
                "Authorization": "your_predefined_auth_token"
            },
            timeout: 120, // in seconds
        })	
        return c.json(res.statusCode, JSON.stringify(res.json))
    } catch (httpError) {
        console.error('createuser failuser, httpError', JSON.stringify(httpError,null, 2))
        return {data: null, error: httpError.value.error() }
    }
	
}
const configureserver = async (fqd, rclone_conf, nats_server_conf) => {
    // key: {username,port,ssh_key_string, site}
    let res;
    try {
        res = await $http.send({
            url:     `http://${fqd}:5000/configureserver`,
            method:  "POST",
            body:    JSON.stringify({
                rclone_conf: rclone_conf,
                nats_server_conf: nats_server_conf,
            }),
            headers: {
                "content-type": "application/json",
                "Authorization": "your_predefined_auth_token"
            },
            timeout: 120, // in seconds
        })	
        return {data: res.raw, error: null};
    } catch (httpError) {
        console.error('configureserver, httpError', JSON.stringify(httpError,null, 2))
        return {data: null, error: httpError.value.error() };
    }
}
const getdiskspace = (site_domain, port, depth) => {
    if (typeof port !== 'string') port = port.toString();
    if (typeof depth !== 'string') depth = depth.toString();
    // console.log(`---> https://${site_domain}/getdiskspace`)
    const res = $http.send({
        url: `http://${site_domain}:5000/getdiskspace`,
        method: 'POST',
        body: JSON.stringify({
            port: port,
            depth: depth,
        }),
        headers: {
            'content-type': 'application/json',
            Authorization: 'your_predefined_auth_token',
        },
        timeout: 120, // in seconds
    })
    // console.log('res', JSON.stringify(res, null, 2))
    if (res.statusCode !== 200) console.error(`http://${site_domain}:5000/getdiskspace failed with status code ${res.statusCode}`)
    return { data: res?.json?.data || null, error: res?.json?.error || null };
}

module.exports = { updateroutes, sync, createuser, configureserver, getdiskspace }