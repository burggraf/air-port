<script lang="ts">
	import '$styles/grid-styles.css'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import * as allIonicIcons from 'ionicons/icons'

	import {
		addOutline,
		arrowBackOutline,
		arrowForwardOutline,
		checkmarkCircleOutline,
		checkmarkOutline,
		closeCircleOutline,
		codeDownloadSharp,
		ellipseSharp,
		syncCircleOutline,
	} from 'ionicons/icons'
	import { currentUser, pb } from '$services/backend.service'
	import { goto } from '$app/navigation'
	import { toast } from '$services/toast'
	export let id = $page.params.id

	import type { Project, ProjectInstance } from '$models/interfaces'
	import { showConfirm } from '$services/alert.service'
	import { loadingBox } from '$services/loadingMessage'
	import { dropdownmenu } from '$components/DropdownMenu'
	import { version } from '$app/environment'
	import { checkDomainAvailability } from '$services/project-utils.service'

	const versions = ['v0.21.1', 'v0.21.0', 'v0.20.7', 'v0.20.6', 'v0.20.5', 'v0.20.4', 'v0.20.3', 'v0.20.2', 'v0.20.1', 'v0.20.0']
	const default_version = versions[0]

	let instances: ProjectInstance[] = []
	$: domainAvailable = false

	const project: Project = {
		id: '',
		domain: '',
		name: '',
		owner: $currentUser?.id,
		ownertype: 'person',
		port: 0,
		metadata: {},
		type: 'production',
	}
	let form = { project_name: '', domain: '', project_type: '' }

	const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/')
		}
		localStorage.setItem('page', window.location.pathname)
		const record = await pb.collection('projects').getOne(id, {})
		if (record) {
			for (let attr in project) {
				project[attr] = record[attr]
			}
		} else {
			toast('Project not found', 'danger')
			goto('/projects')
		}
		const records = await pb.collection('instance_view').getFullList({
			filter: `project_id="${id}"`,
		})
		if (records) {
			for (let instance of records) {
				const newInstance: ProjectInstance = {
					id: instance.id,
					owner: instance.owner,
					ownertype: instance.ownertype,
					name: instance.name,
					domain: instance.domain,
					project_id: instance.project_id,
					project_name: instance.project_name,
					type: instance.type,
					site_name: instance.site_name,
					site_domain: instance.site_domain,
					site_id: instance.site_id,
					port: instance.port,
					code: instance.code,
					db_streaming_backup_location: instance.db_streaming_backup_location,
					logs_streaming_backup_location: instance.logs_streaming_backup_location,
					db_streaming_backup_retention: instance.db_streaming_backup_retention,
					logs_streaming_backup_retention: instance.logs_streaming_backup_retention,
					instance_status: instance.instance_status,
					metadata: instance.project_instance_metadata,
				}
				instances.push(newInstance)
			}
			instances = instances // stupid svelte
		}
		form.project_name = project.name
		form.domain = project.domain
		form.project_type = project.type
	}
	const back = async () => {
		goto('/projects')
	}

	const handleChange = async (event: any) => {
		form[event.target.id as keyof typeof form] = event.target.value
		if (event.target.id === 'domain') {
			domainAvailable = await checkDomainAvailability(form.domain)
		}
	}
	const createNewInstance = async () => {
		for (let i = 0; i < instances.length; i++) {
			const instance = instances[i]
			if (
				instance.db_streaming_backup_location !== '' ||
				instance.logs_streaming_backup_location !== ''
			) {
				toast(
					'You cannot create a new instance if you are configured for streaming backup',
					'danger'
				)
				return
			}
		}
		goto(`/newinstance/${project.id}`)
	}
	const resync = async () => {
		if (instances.length < 2) {
			toast('You must have at least two instances to resync', 'danger')
			return
		}
		await showConfirm({
			header: 'Resync Project Instances',
			message: `This will sync all files and data between the primary and replica instances.  Are you SURE?`,
			okHandler: async () => {
				const loader = await loadingBox('Resyncing replicas with primary...')
				loader.present()
				const { data, error } = await pb.send(`/resync/${project.id}`, {
					method: 'GET',
				})
				loader.dismiss()
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					toast('Resync complete', 'success')
				}
			},
		})
	}
	const updateRoutes = async () => {
		// if (instances.length < 2) {
		// 	toast('You must have at least two instances to update routes', 'danger')
		// 	return
		// }
		await showConfirm({
			header: 'Update Routing Rules',
			message: `This will sync all routing rules on the primary and replica instances.  Are you SURE?`,
			okHandler: async () => {
				const loader = await loadingBox('Updating routes...')
				loader.present()
				const { data, error } = await pb.send(`/update-routes/${project.id}`, {
					method: 'GET',
				})
				loader.dismiss()
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					toast('Routes updated', 'success')
				}
			},
		})
	}
	const changeVersion = async (e: any) => {
		let items = []
		for (let i = 0; i < versions.length; i++) {
			const version = versions[i]
			items.push({
				text: version,
				iconSrc: '/pb.svg', //allIonicIcons.ellipseOutline,
				color: 'primary',
				textcolor: 'dark',
				handler: async () => {},
			})
		}
		const result = await dropdownmenu(e, items)
		if (!project.metadata) project.metadata = {}
		project.metadata.pb_version = result.text
		const loader = await loadingBox('Updating version...')
		const { data, error } = await pb.send(`/changeversion`, {
			method: 'POST',
			body: {
				project_id: project.id,
				pb_version: result.text,
			},
		})
		loader.dismiss()
		if (error) {
			toast('Error: ' + JSON.stringify(error), 'danger')
			return
		}
		toast('Version changed', 'success')
	}
	const notready = () => {
		toast('This feature is not ready yet', 'danger')
	}
	const change_project_name = async () => {
		const loader = await loadingBox('Changing project name...')
		const { data, error } = await pb.send(`/change-project-name`, {
			method: 'POST',
			body: {
				project_id: project.id,
				project_name: form.project_name,
			},
		})
		loader.dismiss()
		if (error) {
			toast('Error: ' + JSON.stringify(error), 'danger')
		} else {
			project.name = form.project_name
			toast('Project name changed', 'success')
		}
	}
	const change_project_type = async () => {
		const loader = await loadingBox('Changing project type...')
		const { data, error } = await pb.send(`/change-project-type`, {
			method: 'POST',
			body: {
				project_id: project.id,
				project_type: form.project_type,
			},
		})
		loader.dismiss()
		if (error) {
			toast('Error: ' + JSON.stringify(error), 'danger')
		} else {
			project.type = form.project_type
			toast('Project type changed', 'success')
		}
	}
	const change_domain = async () => {
		const loader = await loadingBox('Changing domain...')
		const { data, error } = await pb.send(`/change-domain`, {
			method: 'POST',
			body: {
				project_id: project.id,
				domain: form.domain,
			},
		})
		loader.dismiss()
		if (error) {
			toast('Error: ' + JSON.stringify(error), 'danger')
		} else {
			project.domain = form.domain
			toast('Domain changed', 'success')
		}
	}
	const actionMenu = async (e: any) => {
		const items = [
			{
				text: 'Update Routes',
				icon: allIonicIcons.globeOutline,
				handler: () => {
					updateRoutes()
				},
			},
			{
				text: 'Re-Sync Instances',
				icon: allIonicIcons.syncOutline,
				handler: () => {
					resync()
				},
			},
			{
				text: 'Cancel',
				icon: allIonicIcons.closeOutline,
				handler: () => {},
			},
		]
		const result = await dropdownmenu(e, items)
		// console.log('result', result)
	}
</script>

<IonPage {ionViewWillEnter}>
	<ion-header>
		<ion-toolbar color="secondary">
			<ion-buttons slot="start">
				<ion-button on:click={back}>
					<ion-icon slot="icon-only" icon={arrowBackOutline} />
				</ion-button>
			</ion-buttons>
			<ion-title>{project.name || 'Project'}</ion-title>
			<ion-buttons slot="end">
				<ion-button on:click={actionMenu}>
					<ion-icon slot="icon-only" icon={allIonicIcons.ellipsisVerticalOutline} />
				</ion-button>
			</ion-buttons>
			<!-- <ion-buttons slot="end">
					<ion-button on:click={save}>
						<ion-icon slot="icon-only" icon={checkmarkOutline} />
					</ion-button>
			</ion-buttons> -->
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		<ion-grid class="ion-padding Grid">
			<ion-row>
				<ion-col>
					<ion-label>Project Name</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="project_name"
							name="project_name"
							placeholder="Project Name"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={form.project_name}
							debounce={500}
						>
							<ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={project.name === form.project_name}
								on:click={change_project_name}
								>Change
							</ion-button>
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>Subdomain</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="domain"
							name="domain"
							placeholder="domain"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={form.domain}
							debounce={500}
						>
							<ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={project.domain === form.domain}
								on:click={change_domain}
								>Change
							</ion-button>
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>
			{#if project.domain !== form.domain}
				<ion-row>
					<ion-col>
						<ion-label color={domainAvailable ? 'success' : 'danger'} style="padding-left: 20px;">
							{domainAvailable ? `${form.domain} is available` : `Domain is not available`}
							<ion-icon
								color={domainAvailable ? 'success' : 'danger'}
								icon={domainAvailable ? checkmarkCircleOutline : closeCircleOutline}
								style=""
							/>
						</ion-label>
					</ion-col>
				</ion-row>
			{/if}

			<ion-row>
				<ion-col>
					<ion-label>Full Domain</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="fqd"
							placeholder="Full Domain Name"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={project.metadata?.fqd}
							debounce={500}
						>
							<ion-button slot="end" size="small" expand="block" fill="solid" on:click={notready}
								>Change
							</ion-button>
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>Project Type</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="project_type"
							name="project_type"
							placeholder="Project Type"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={form.project_type}
							debounce={500}
						>
							<ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={project.type === form.project_type}
								on:click={change_project_type}
								>Change
							</ion-button>
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-item>
						<ion-label slot="start">Pocketbase Version</ion-label>
						<ion-button slot="end" size="small" expand="block" fill="solid" on:click={changeVersion}
							>&nbsp;&nbsp;&nbsp;{project.metadata?.pb_version || default_version}&nbsp;&nbsp;&nbsp;
						</ion-button>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-list>
						<ion-item-divider>
							<ion-label>Instances</ion-label>
						</ion-item-divider>
						{#each instances as instance}
							<ion-item
								style="cursor:pointer;--padding-start:0px;--inner-padding-end: 0px;"
								lines="full"
								on:click={() => {
									goto(`/instance/${instance.id}`)
								}}
							>
								<!-- <ion-button slot="start" size="small" fill="clear">
									<ion-icon
										slot="icon-only"
										color={instance.instance_status === 'online'
											? 'success'
											: instance.instance_status === 'offline'
											? 'danger'
											: 'warning'}
										icon={ellipseSharp}
									/>
								</ion-button> -->

								{instance.site_name}
								{instance.type}<br />
								{instance.domain}.{instance.site_domain}

								<ion-button
									slot="end"
									size="small"
									fill="solid"
									color={instance.instance_status === 'online'
										? 'success'
										: instance.instance_status === 'offline'
										? 'danger'
										: 'warning'}
									on:click|stopPropagation={() => {
										// launch in another windows
										window.open(`https://${instance.domain}.${instance.site_domain}/`, '_blank')
									}}
								>
									<ion-icon slot="icon-only" src="/launch.svg" />
								</ion-button>

								<ion-button
									slot="end"
									size="small"
									fill="clear"
									on:click|stopPropagation={() => {
										// launch in another windows
										window.open(`https://${instance.domain}.${instance.site_domain}/_/`, '_blank')
									}}
								>
									<ion-icon slot="icon-only" src="/pb.svg" />
								</ion-button>

								<!-- <ion-button
                                        slot="end"
                                        size="small"
                                        fill="outline"
                                        on:click|stopPropagation={() => {
                                            goto(`/instance/${instance.id}`)
                                        }}
                                    >
                                        <ion-icon slot="icon-only" icon={arrowForwardOutline} />
                                    </ion-button> -->
							</ion-item>
						{/each}
						<ion-item>
							<div style="width:100%;text-align:center;">
								<ion-button size="small" expand="block" on:click={createNewInstance}>
									<ion-icon slot="icon-only" icon={addOutline} />
									&nbsp;New Instance
								</ion-button>
							</div>
						</ion-item>
					</ion-list>
				</ion-col>
			</ion-row></ion-grid
		>
	</ion-content>
</IonPage>
