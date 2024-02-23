<script lang="ts">
	import '$styles/grid-styles.css'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import * as allIonicIcons from 'ionicons/icons'
	import type { AppsRecord, MachinesRecord } from '$models/pocketbase-types'
	import { chooseRegion, getRegionName } from '$services/region.service'

	import {
		addOutline,
		arrowBackOutline,
		arrowForwardOutline,
		checkmarkCircleOutline,
		checkmarkOutline,
		closeCircleOutline,
		codeDownloadSharp,
		ellipse,
		ellipseSharp,
		syncCircleOutline,
		trashOutline,
	} from 'ionicons/icons'
	import { currentUser, pb } from '$services/backend.service'
	import { goto } from '$app/navigation'
	import { toast } from '$services/toast'
	export const Domain = $page.params.Domain

	import { showConfirm } from '$services/alert.service'
	import { loadingBox } from '$services/loadingMessage'
	import { dropdownmenu } from '$components/DropdownMenu'
	import { version } from '$app/environment'
	import { checkDomainAvailability } from '$services/app-utils.service'

	let machines: MachinesRecord[] = []

	let app: AppsRecord;
	let form = { title: '', Domain: '', type: '' }

	const ionViewWillEnter = async () => {
		console.log('ionViewWillEnter...')
		if (!$currentUser) {
			console.log('no current user, going to /')
			goto('/')
		}
		localStorage.setItem('page', window.location.pathname)
		await updateStatus()
	}
	const loadData = async () => {
		// let loader = await loadingBox('Loading app info...')
		try {
			app = await pb.collection('apps').getFirstListItem(`Domain="${Domain}"`, {
				// expand: 'relField1,relField2.subRelField',
			});
			console.log('app', app)
		} catch (err) {
			// loader.dismiss()
			console.log('error getting app record', err)
			goto('/apps')
		}
		console.log('get machines for app', app.Domain)
		if (app.Domain) {
			// loader.dismiss()
			// loader = await loadingBox('Loading machine(s) info...')
			machines = await pb.collection('machines').getFullList({
				filter: `Domain = '${app.Domain}'`,
				// sort: 'name,type,site_name,instance_status',
			})
			console.log('machines', machines)
			// loader.dismiss()
		}
		
		console.log('setting form values')
		console.log('app.title', app.title)
		console.log('app.Domain', app.Domain)
		console.log('app.type', app.type)
		form.title = app.title || ""
		form.Domain = app.Domain || ""
		form.type = app.type || ""
	}
	const updateStatus = async () => {
		// const loader = await loadingBox('Updating app status...')
		try {
			const { data, error } = await pb.send(`/update-app-status/${Domain}`, {
				method: 'GET',
			})
			// loader.dismiss()
			console.log('updateStatus: data, error', data, error)
		} catch (err) {
			// loader.dismiss()
			console.log('OOPS: error updating status', err)
		}
		loadData();
	}
	const back = async () => {
		goto('/apps')
	}

	const handleChange = async (event: any) => {
		form[event.target.id as keyof typeof form] = event.target.value
	}
	const addNewRegion = async (e: any) => {
		// const loader = await loadingBox('Adding new region...')
		const region: any = await chooseRegion(e)
		if (region) {
			await showConfirm({
				header: 'Add New Region',
				message: `This will create a new app instance in ${getRegionName(region)}.  Are you SURE?`,
				okHandler: async () => {
					const loader = await loadingBox(`Creating new app instance in ${getRegionName(region)}...`)
					loader.present()
					const { data, error } = await pb.send(`/add-region/${Domain}/${region}`, {
						method: 'GET',
					})
					console.log('add-region data, error', data, error)
					loader.dismiss()
					if (error) {
						toast('Error: ' + JSON.stringify(error), 'danger')
					} else {
						await updateStatus()
						toast('New region added', 'success') 
					}
				},
			})
		}
	}
	const removeMachine = async (machine: MachinesRecord) => {
		await showConfirm({
			header: 'Remove Machine',
			message: `This will completely remove this machine in ${getRegionName(machine.region || "")}.  Are you SURE?`,
			okHandler: async () => {
				const loader = await loadingBox(`Deleting machine in ${getRegionName(machine.region || "")}...`)
				loader.present()
				const { data, error } = await pb.send(`/remove-machine/${machine.machine_id}`, {
					method: 'GET',
				})
				console.log('remove-machine data, error', data, error)
				loader.dismiss()
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					await updateStatus()
					toast('Machine removed', 'success') 
				}
			},
		})
	}

	const resync = async () => {
		toast('This feature is not ready yet', 'danger')
		if (machines.length < 2) {
			toast('You must have at least two instances to resync', 'danger')
			return
		}
		// await showConfirm({
		// 	header: 'Resync Project Instances',
		// 	message: `This will sync all files and data between the primary and replica instances.  Are you SURE?`,
		// 	okHandler: async () => {
		// 		const loader = await loadingBox('Resyncing replicas with primary...')
		// 		loader.present()
		// 		const { data, error } = await pb.send(`/resync/${app.id}`, {
		// 			method: 'GET',
		// 		})
		// 		loader.dismiss()
		// 		if (error) {
		// 			toast('Error: ' + JSON.stringify(error), 'danger')
		// 		} else {
		// 			toast('Resync complete', 'success')
		// 		}
		// 	},
		// })
	}
	const removeApp = async () => {
		await showConfirm({
			header: 'Delete App',
			message: `Are you SURE?  This cannot be undone.`,
			okHandler: async () => {
				const loader = await loadingBox('Deleting app...')
				const { data, error } = await pb.send('/remove-app', {
					method: 'POST',
					body: {
						Domain
					},
				})
				loader.dismiss()
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					toast('App deleted', 'success')
					goto('/apps')
				}
			},
		})
	}


	const changeVersion = async (e: any) => {
		toast('This feature is not ready yet', 'danger')
	}
	const notready = () => {
		toast('This feature is not ready yet', 'danger')
	}
	const change_app_title = async () => {
		const loader = await loadingBox('Changing app title...')
		try {
			const record = await pb.collection('apps').update(app.id, { title: form.title });
			loader.dismiss()
			toast('App name changed', 'success')
		} catch (err) {
			console.error('error updating app title', err)
			loader.dismiss()
			toast('Error: ' + JSON.stringify(err), 'danger')
		}
	}
	const change_app_type = async () => {
		const loader = await loadingBox('Changing app type...')
		try {
			const record = await pb.collection('apps').update(app.id, { type: form.type });
			loader.dismiss()
			toast('App type changed', 'success')
		} catch (err) {
			console.error('error updating app type', err)
			loader.dismiss()
			toast('Error: ' + JSON.stringify(err), 'danger')
		}
	}
	const actionMenu = async (e: any) => {
		const items = [
			{
				text: 'Re-Sync Instances',
				icon: allIonicIcons.syncOutline,
				handler: () => {
					resync()
				},
			},
			{
				text: 'Delete App',
				icon: allIonicIcons.trashOutline,
				textcolor: 'danger',
				color: 'danger',
				handler: () => {
					removeApp()
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
			<ion-title>{app?.title || 'App'}</ion-title>
			<ion-buttons slot="end">
				<ion-button on:click={updateStatus}>
					<ion-icon slot="icon-only" icon={allIonicIcons.refreshOutline} />
				</ion-button>

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
					<ion-label>App Title</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="title"
							name="title"
							placeholder="App Title"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={form.title}
							debounce={500}
						>
							<ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={app?.title === form?.title}
								on:click={change_app_title}
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
							disabled={true}
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="domain"
							name="domain"
							placeholder="domain"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={app?.Domain}
							debounce={500}
						>
							<!-- <ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={app.Domain === form.Domain}
								on:click={change_domain}
								>Change
							</ion-button> -->
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>

			<!-- <ion-row>
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
			</ion-row> -->

			<ion-row>
				<ion-col>
					<ion-label>App Type</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="type"
							name="type"
							placeholder="App Type"
							style="--padding-start: 10px;--padding-end: 10px;"
							value={form.type}
							debounce={500}
						>
							<ion-button
								slot="end"
								size="small"
								expand="block"
								fill="solid"
								disabled={app?.type === form.type}
								on:click={change_app_type}
								>Change
							</ion-button>
						</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-label>Regions</ion-label>
				</ion-col>
			</ion-row>
			<ion-row><ion-col>
					<ion-list>
					<ion-accordion-group>
						{#each machines as machine}
							<ion-accordion value="first">
								<ion-item slot="header" color="light">
									<ion-label><b>{machine.region}</b>: {getRegionName(machine.region || "")}</ion-label>
									<ion-icon slot="end" icon={ellipse} color={machine.state==='started'?'success':'warning'} />
								</ion-item>
								<div class="ion-padding" slot="content">
										<ion-item>
											Config:
											<ion-text slot="end">
											{machine?.config?.guest?.cpus} {machine?.config?.guest?.cpu_kind} CPU(s) with {machine?.config?.guest?.memory_mb}mb ram
											</ion-text>
										</ion-item>
										<ion-item>
											Pocketbase Version: 
											<ion-text slot="end">{machine?.image_ref?.tag}</ion-text>
										</ion-item>
										<ion-item>
											State:
											<ion-text slot="end">{machine?.state}</ion-text>
										</ion-item>
										<ion-item>
											Created:
											<ion-text slot="end">{machine?.created_at}</ion-text>
										</ion-item>
										<ion-item>
											Updated:
											<ion-text slot="end">{machine?.updated_at}</ion-text>
										</ion-item>
										<ion-item-divider>
											<ion-label>Events</ion-label>
										</ion-item-divider>
										<!-- <ion-item> -->
											<ion-grid style="width: 100%;">
											<ion-row style="width: 100%; font-weight: bold;">
												<ion-col>
													<ion-label>Src</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>Status</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>Type</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>Timestamp</ion-label>
												</ion-col>
											</ion-row>
											{#each machine?.events as event}
											<ion-row style="width: 100%;">
												<ion-col>
													<ion-label>{event?.source}</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>{event?.status}</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>{event?.type}</ion-label>
												</ion-col>
												<ion-col>
													<ion-label>{@html new Date((event?.timestamp || 0)).toLocaleString().replace(',','<br/>')}</ion-label>
												</ion-col>
											</ion-row>	
											{/each}
											</ion-grid>
											<div class="ion-padding">
												<ion-button size="small" expand="block" on:click={() => {removeMachine(machine)}} color="danger">
													<ion-icon slot="start" icon={trashOutline} />
													Remove Machine
												</ion-button>
											</div>
										<!-- </ion-item>								 -->
								</div>
							</ion-accordion>
						  {/each}
					  </ion-accordion-group>
				<!-- </ion-col>
			</ion-row></ion-grid> -->
			</ion-list>
			<ion-item>
				<div style="width:100%;text-align:center;">
					<ion-button size="small" expand="block" on:click={addNewRegion}>
						<ion-icon slot="icon-only" icon={addOutline} />
						&nbsp;Add New Region
					</ion-button>
				</div>
			</ion-item>
			</ion-col></ion-row></ion-grid>
	</ion-content>
</IonPage>
