<script lang="ts">
	import '$styles/grid-styles.css'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import * as allIonicIcons from 'ionicons/icons'
	import type { AppsRecord, MachinesRecord } from '$models/pocketbase-types'
	import { getRegionName, regions } from '$services/region.service'

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

	import { showConfirm } from '$services/alert.service'
	import { loadingBox } from '$services/loadingMessage'
	import { dropdownmenu } from '$components/DropdownMenu'
	import { version } from '$app/environment'
	import { checkDomainAvailability } from '$services/app-utils.service'

	let machines: MachinesRecord[] = []

	let app: AppsRecord;
	let form = { title: '', Domain: '', type: '' }

	const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/')
		}
		localStorage.setItem('page', window.location.pathname)
		let loader = await loadingBox('Loading app info...')
		try {
			app = await pb.collection('apps').getOne(id, {})
			console.log('app', app)
		} catch (err) {
			loader.dismiss()
			console.log('error getting app record', err)
			goto('/apps')
		}
		console.log('get machines for app', app.Domain)
		if (app.Domain) {
			loader.dismiss()
			loader = await loadingBox('Loading machine(s) info...')
			machines = await pb.collection('machines').getFullList({
				filter: `Domain = '${app.Domain}'`,
				// sort: 'name,type,site_name,instance_status',
			})
			console.log('machines', machines)
			loader.dismiss()
		}
		
		console.log('setting form values')
		console.log('app.title', app.title)
		console.log('app.Domain', app.Domain)
		console.log('app.type', app.type)
		form.title = app.title || ""
		form.Domain = app.Domain || ""
		form.type = app.type || ""
	}
	const back = async () => {
		goto('/apps')
	}

	const handleChange = async (event: any) => {
		form[event.target.id as keyof typeof form] = event.target.value
	}
	const createNewMachine = async () => {
		toast('This feature is not ready yet', 'danger')
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

			<!-- <ion-row>
				<ion-col>
					<ion-item>
						<ion-label slot="start">Pocketbase Version</ion-label>
						<ion-button slot="end" size="small" expand="block" fill="solid" on:click={changeVersion}
							>&nbsp;&nbsp;&nbsp;{project.metadata?.pb_version || default_version}&nbsp;&nbsp;&nbsp;
						</ion-button>
					</ion-item>
				</ion-col>
			</ion-row> -->

			<ion-row>
				<ion-col>
					<ion-list>
						<ion-item-divider>
							<ion-label>Machines</ion-label>
						</ion-item-divider>
						{#each machines as machine}
							<ion-item
								style="cursor:pointer;--padding-start:0px;--inner-padding-end: 0px;"
								lines="full"
								on:click={() => {
									// goto(`/instance/${instance.id}`)
									toast('not implemented yet', 'danger')
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

								{machine.region} : {getRegionName(machine.region || "")}

								<ion-button
									slot="end"
									size="small"
									fill="solid"
									color={machine.state === 'stopped'
										? 'danger'
										: 'success'}
									on:click|stopPropagation={() => {
										// launch in another windows
										toast('not implemented yet', 'danger')
										//window.open(`https://${instance.domain}.${instance.site_domain}/`, '_blank')
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
										toast('not implemented yet', 'danger')
										//window.open(`https://${instance.domain}.${instance.site_domain}/_/`, '_blank')
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
								<ion-button size="small" expand="block" on:click={createNewMachine}>
									<ion-icon slot="icon-only" icon={addOutline} />
									&nbsp;New Machine
								</ion-button>
							</div>
						</ion-item>
					</ion-list>
				</ion-col>
			</ion-row></ion-grid
		>
	</ion-content>
</IonPage>
