<script lang="ts">
    import Keys from '$components/Keys.svelte'
    import type { ProjectInstance, ProjectInstanceKey, Key } from '$models/interfaces'
	import { currentUser, pb } from '$services/backend.service'
    import { toast } from '$services/toast'
	import { instanceTab } from './instanceTabStore'

    // export let id: string = ''
    export let keys: Key[] = []
	export let project_instance_keys: ProjectInstanceKey[] = []
    export let project_instance: ProjectInstance = 
		{
            name: '',
            project_id: '',
            owner: '',
            ownertype: '',
            code: '',
            domain: '',
            id: '',
            port: 0,
            site_domain: '',
            site_name: 'Select a site',
            site_id: '',
            type: 'primary',
            db_streaming_backup_location: '',
            logs_streaming_backup_location: '',
            db_streaming_backup_retention: 0,
            logs_streaming_backup_retention: 0
        };
	
    instanceTab.subscribe(async (value: string) => {
        // console.log('tab switched to cli, load keys now')
        if (value === 'cli') {
            await loadProjectInstanceKeys()
        }
    })
    const loadProjectInstanceKeys = async () => {
		project_instance_keys = await pb.collection('project_instance_keys').getFullList({
			filter: `project_instance_id = "${project_instance.id}"`,
			fields: 'id,project_instance_id,user_keys_id',
		})
	}

	const toggleKey = async (user_keys_id: string) => {
		// add or remove the key from the project_instance_keys collection
		const project_instance_key = project_instance_keys.find((project_instance_key) => {
			return project_instance_key.user_keys_id === user_keys_id
		})
		if (project_instance_key) {
			// remove it
			const result = await pb.collection('project_instance_keys').delete(project_instance_key.id)
		} else {
			// add it
			const payload = {
				project_instance_id: project_instance.id,
				user_keys_id: user_keys_id,
				user_id: $currentUser.id,
				project_id: project_instance.project_id,
			}
            try {
                const result = await pb.collection('project_instance_keys').create(payload)
            } catch (toggleError) {
                console.error('toggleKey error', toggleError)
            }
		}
		const { data, error } = await pb.send(`/create-ssh-keys/${project_instance.id}`, {
			method: 'GET',
		})
		if (error) {
			toast(error, 'danger')
		} else {
			toast('SSH Keys updated for this project', 'success')
		}
		loadProjectInstanceKeys()
	}
    if (localStorage.getItem('instance.tab') === 'cli') {
        setTimeout(async () => {await loadProjectInstanceKeys();}, 1000)   
    }

</script>
<ion-grid class="ion-padding Grid">
    <ion-row>
        <ion-col style="width: 100%; border-bottom: 1px solid;">
            <ion-label><h1>SSH Keys</h1></ion-label>
        </ion-col>
    </ion-row>
    <!-- code, domain, id, port, site_domain, site_name, type -->

        <ion-row>
            <ion-col class="ion-text-center">
                <ion-label>{project_instance.site_name}</ion-label>
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col class="ion-text-center" style="border: 1px solid;">
                <ion-label>installed keys:</ion-label><br />
                {#each keys as key, index}
                    <ion-chip
                        outline={project_instance_keys.find((project_instance_key) => {
                            return project_instance_key.user_keys_id === key.id
                        })
                            ? false
                            : true}
                        on:click={() => {
                            toggleKey(key.id)
                        }}>{key.title}</ion-chip
                    >
                {/each}
            </ion-col>
        </ion-row>
        <ion-row>
            <ion-col>
                {#if project_instance_keys.length > 0}
                    <ion-label>Example <b>scp</b> copy commands:</ion-label>
                    <pre>
scp -P 2222 -r pb_public/* \
{project_instance.domain}@{project_instance.site_domain}:/pb_public
scp -P 2222 -r pb_hooks/* \
{project_instance.domain}@{project_instance.site_domain}:/pb_hooks
scp -P 2222 -r pb_migrations/* \
{project_instance.domain}@{project_instance.site_domain}:/pb_migrations</pre>
                    <ion-label>To connect via <b>sftp</b>:</ion-label>
                    <pre>
sftp -P 2222 {project_instance.domain}@{project_instance.site_domain}
                       </pre>
                {:else}
                    <ion-label>
                        In order to use <b>scp</b> or <b>sftp</b> to copy files to your project:<br />
                        <ul>
                            <li>Add at least one SSH Public Key</li>
                            <li>
                                Select at least one SSH Public Key above (this installs the SSH Public Key
                                to your server instance automatically)
                            </li>
                        </ul>
                    </ion-label>
                {/if}
            </ion-col>
        </ion-row>
    <Keys />
</ion-grid>
