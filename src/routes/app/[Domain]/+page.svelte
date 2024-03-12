<script lang="ts">
	//import { currentState } from './../../../services/state.service.ts';
	import '$styles/grid-styles.css'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import * as allIonicIcons from 'ionicons/icons'
	import type { AppsRecord, MachinesRecord, IObjectKeys, MachineKeyRecord, UserKeysRecord } from '$models/pocketbase-types'
	import { chooseRegion, getRegionName } from '$services/region.service'
	import Keys from '$components/Keys.svelte'
	import { modalController } from '$ionic/svelte'
	import keyModal from '$components/keyModal.svelte'

	import {
		addOutline,
		arrowBackOutline,
		arrowForwardOutline,
		callOutline,
		checkmarkCircleOutline,
		checkmarkOutline,
		closeCircleOutline,
		cloudUploadOutline,
		codeDownloadSharp,
		ellipse,
		ellipseSharp,
		eyeOutline,
		eyeOffOutline,
		listOutline,
		personOutline,
		refreshOutline,
		settingsOutline,
		star,
		syncCircleOutline,
		timeOutline,
		trashOutline,
		keyOutline,
		lockClosedOutline,
		lockOpenOutline,
		lockOpen,
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
	import { onMount } from 'svelte'

	let keys: UserKeysRecord[] = []
	let machinekeys: MachineKeyRecord[] = []
	let machines: MachinesRecord[] = []
	$: machines = [...machines]
	let xmachinePitrChanged: IObjectKeys = {}
	$: machinePitrChanged = xmachinePitrChanged
	let pitrMode = 'configure'
	let restoreDBType = 'data'

	let generations: any[] = []
	let wal: any[] = []

	let app: AppsRecord
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
	onMount(async () => {
		// const reorderGroup = document.getElementById('keygroup')
		// if (reorderGroup) {
		// 	reorderGroup.addEventListener('ionItemReorder', async ({ detail }) => {
		// 		// console.log('Dragged from index', detail.from, 'to', detail.to)
		// 		const itemToMove = keys.splice(detail.from, 1)[0];
		// 	    keys.splice(detail.to, 0, itemToMove);
		// 		updateKeyOrder()
		// 		detail.complete()
		// 		//loadKeys();
		// 	})
		// }
	})
	const updateKeyOrder = async () => {
		console.log('updateKeyOrder...')
		for (let i = 0; i < keys.length; i++) {
			console.log('i', i)
			const key: UserKeysRecord = keys[i]
			console.log('key', key)
			key.sort_key = i
			await pb.collection('user_keys').update(key.id, key)
		}
	}
	const loadData = async () => {
		// let loader = await loadingBox('Loading app info...')
		try {
			app = await pb.collection('apps').getFirstListItem(`Domain="${Domain}"`, {
				// expand: 'relField1,relField2.subRelField',
			})
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
			console.log('*** loading machines')
			machines = await pb.collection('machines').getFullList({
				filter: `Domain = '${app.Domain}'`,
				// sort: 'name,type,site_name,instance_status',
			})
			loadKeys()
			console.log('*** loading machinekeys')
			machinekeys = await pb.collection('machine_key').getFullList({})
			for (let i = 0; i < machines.length; i++) {
				machines[i].keys = machinekeys.filter((mk) => mk.machine === machines[i].id)
			}
			console.log('machines', machines)
			console.log('machinekeys', machinekeys)
			for (let i = 0; i < machines.length; i++) {
				const reorderGroup = document.getElementById(`keygroup-${machines[i].id}`)
				if (reorderGroup) {
					reorderGroup.addEventListener('ionItemReorder', async ({ detail }) => {
						// console.log('Dragged from index', detail.from, 'to', detail.to)
						const itemToMove = keys.splice(detail.from, 1)[0];
						keys.splice(detail.to, 0, itemToMove);
						updateKeyOrder()
						detail.complete()
						//loadKeys();
					})
				}
			}
			// loader.dismiss()
		}

		console.log('setting form values')
		console.log('app.title', app.title)
		console.log('app.Domain', app.Domain)
		console.log('app.type', app.type)
		form.title = app.title || ''
		form.Domain = app.Domain || ''
		form.type = app.type || ''
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
		await loadData()
		return 'OK'
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
					let loader = await loadingBox(`Creating new app instance in ${getRegionName(region)}...`)
					loader.present()
					const { data, error } = await pb.send(`/add-region/${Domain}/${region}`, {
						method: 'GET',
					})
					console.log('*** add-region data, error', data, error)
					// rsync
					loader.dismiss()
					loader = await loadingBox(`Loading data for new instance: ${getRegionName(region)}...`)
					await updateStatus()
					console.log('... updateStatus done ...')
					console.log('*** ->>>> machines is now', machines)
					loader.dismiss()
					loader = await loadingBox(
						`Syncing data for new app instance in ${getRegionName(region)}...`
					)
					const newMachine: any = machines.find((m) => m.region === region)
					if (!newMachine) {
						toast('Error: new machine not found', 'danger')
						console.log('machines is set to', machines)
						return
					}
					console.log('newMachine', newMachine)
					console.log('***********************')
					console.log('newMachine Domain', newMachine.Domain)
					console.log('newMachine.machine_id', newMachine.machine_id)
					console.log('***********************')
					const { data: rsyncData, error: rsyncError } = await pb.send(`/rsync`, {
						method: 'POST',
						body: {
							Domain: newMachine.Domain,
							machine_id: newMachine.machine_id,
						},
					})
					loader.dismiss()
					if (rsyncError) {
						toast('Error: ' + JSON.stringify(rsyncError), 'danger')
					} else {
						await updateStatus()
						toast('New region added', 'success')
					}
				},
			})
			await updateStatus()
		}
	}
	const removeMachine = async (machine: MachinesRecord) => {
		await showConfirm({
			header: 'Remove Machine',
			message: `This will completely remove this machine in ${getRegionName(
				machine.region || ''
			)}.  Are you SURE?`,
			okHandler: async () => {
				const loader = await loadingBox(
					`Deleting machine in ${getRegionName(machine.region || '')}...`
				)
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
	const rsync = async (machine: MachinesRecord) => {
		await showConfirm({
			header: 'Re-Sync Data',
			message: `This will sync all files and data between the primary and replica instances in ${getRegionName(
				machine.region || ''
			)}.  Are you SURE?`,
			okHandler: async () => {
				const loader = await loadingBox(
					`Resyncing replicas with primary in ${getRegionName(machine.region || '')}...`
				)
				loader.present()
				const { data, error } = await pb.send(`/rsync`, {
					method: 'POST',
					body: {
						Domain: machine.Domain,
						machine_id: machine.machine_id,
					},
				})
				loader.dismiss()
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					toast('Rsync complete', 'success')
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
						Domain,
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
			const record = await pb.collection('apps').update(app.id, { title: form.title })
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
			const record = await pb.collection('apps').update(app.id, { type: form.type })
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
	const setMachinePitr = (e: any, machine: MachinesRecord, key: string) => {
		console.log('setMachinePitr', key, e.target.value)
		const newMachines = [...machines]
		const newMachine: any = newMachines.find((m) => m.machine_id === machine.machine_id)
		console.log('newMachine', newMachine)
		if (!newMachine.metadata) newMachine.metadata = {}
		if (!newMachine.metadata.pitr) newMachine.metadata.pitr = {}
		let value = e.target.value
		if (typeof e.detail.checked === 'boolean') {
			value = e.detail.checked
		}
		newMachine.metadata.pitr[key] = value
		console.log('e', e)
		console.log('e.target.value', e.target.value)
		console.log('newMachine.metadata.pitr', newMachine.metadata.pitr)
		machines = newMachines
		if (machine.machine_id) {
			machinePitrChanged[machine.machine_id] = true
		}
	}
	const updateStreamingBackupSettings = async (machine: MachinesRecord) => {
		console.log('updateStreamingBackupSettings machine:', machine)
		const pitr = machine.metadata?.pitr
		console.log('updateStreamingBackupSettings pitr:', pitr)
		console.log('machine_id:', machine.machine_id)
		const { data, error } = await pb.send(`/update-streaming-backup-settings`, {
			method: 'POST',
			body: {
				machine_id: machine.machine_id,
				pitr,
			},
		})
		console.log('updateStreamingBackupSettings data, error', data, error)
		// reset the button
		machinePitrChanged[machine.machine_id || ''] = false
	}
	const togglePitrMode = (machine: MachinesRecord) => {
		console.log('togglePitrMode: machine', machine)
		if (pitrMode === 'configure') {
			pitrMode = 'restore'
		} else {
			pitrMode = 'configure'
		}
	}
	const loadPitrGenerations = async (machine: MachinesRecord, restoreDBType: string) => {
		console.log('loadPitrGenerations')
		const loader = await loadingBox('Loading backup generations...')
		generations = []
		const { data: generationsData, error: generationsError } = await pb.send(
			`/get-litestream-generations`,
			{
				method: 'POST',
				body: {
					Domain: machine.Domain,
					machine_id: machine.machine_id,
					private_ip: machine.private_ip,
					restoreDBType: restoreDBType,
				},
			}
		)
		console.log('generationsError', generationsError)
		console.log('generationsData', generationsData)
		generations = generationsData
		loader.dismiss()
	}
	const loadPitrWal = async (
		machine: MachinesRecord,
		restoreDBType: string,
		generation_id: string
	) => {
		console.log('loadPitrWal')
		const loader = await loadingBox('Loading backup files...')
		wal = []
		const { data: walData, error: walError } = await pb.send(`/get-litestream-wal`, {
			method: 'POST',
			body: {
				Domain: machine.Domain,
				machine_id: machine.machine_id,
				private_ip: machine.private_ip,
				restoreDBType: restoreDBType,
				generation_id: generation_id,
			},
		})
		console.log('walError', walError)
		console.log('walData', walData)
		// wal = walData
		loader.dismiss()
		return walData
	}
	const restoreFile = async (
		machine: MachinesRecord,
		generation_id: string,
		timestamp: string,
		restoreDBType: string
	) => {
		// litestream restore
		// 		-config /pb/litestream.yml
		//		-o /pb/tmp001.db
		// 		-generation xxxxxxxxxxxx
		// 		-timestamp 2024-03-04T13:10:56Z
		//		/pb/pb_data/data.db
		console.log('restoreFile', generation_id, timestamp, restoreDBType)
		const loader = await loadingBox(`Restoring ${timestamp}`)
		const { data: restoreData, error: restoreError } = await pb.send(`/get-litestream-file`, {
			method: 'POST',
			body: {
				Domain: machine.Domain,
				machine_id: machine.machine_id,
				private_ip: machine.private_ip,
				restoreDBType: restoreDBType,
				generation_id: generation_id,
				timestamp: timestamp,
			},
		})
		console.log('restoreError', restoreError)
		console.log('restoreData', restoreData)
		// wal = walData
		loader.dismiss()
	}
	const ionTabsDidChange = async (item: string) => {
		console.log('ionTabsDidChange', item)
	}
	const addKey = async () => {
		await showKeyModal()
	}
	const editKey = async (key: any) => {
		await showKeyModal(key)
	}
	const showKeyModal = async (key?: any) => {
		const modal = await modalController.create({
			component: keyModal,
			componentProps: {data: key},
			showBackdrop: true,
			backdropDismiss: false,
		})

		modal.onDidDismiss().then((value) => {
			//if (value.role === 'backdrop') console.log('Backdrop clicked');
			loadKeys()
		})

		await modal.present()
	}
	const loadKeys = async () => {
		keys = await pb.collection('user_keys').getFullList({
                fields: 'id,title,key,sort_key',
				sort: 'sort_key',
			});
		console.log('keys', keys);
	}
	const toggleKeyInstallation = async (machine: any, key: UserKeysRecord) => {
		console.log('toggleKeyInstallation', machine, key)
		// machine.keys.find((k) => k.key === key.id))
		const isInstalled = (machine.keys.find((k: any) => k.key === key.id) !== undefined) 
		console.log('isInstalled', isInstalled)
		if (isInstalled) {
			// remove it
			const machine_key = machine.keys.find((mk: any) => mk.key === key.id)
			console.log('machine_key', machine_key)
			const result = await pb.collection('machine_key').delete(machine_key.id)
			console.log('removal result', result)
		} else {
			// add it
			const result = await pb.collection('machine_key').create({
				machine: machine.id,
				key: key.id,
				machine_id: machine.machine_id,
				user: $currentUser.id,
			})
			console.log('install result', result)
		}
		machinekeys = await pb.collection('machine_key').getFullList({})
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
		<ion-grid class="Grid">
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
			<ion-row
				><ion-col>
					<ion-list>
						<ion-accordion-group>
							{#each machines as machine}
								<ion-accordion value={machine.machine_id}>
									<ion-item slot="header" color={machine.is_primary ? 'dark' : 'medium'}>
										<ion-label
											><b>{machine.region}</b>: {getRegionName(machine.region || '')}</ion-label
										>

										<ion-icon
											slot="end"
											icon={cloudUploadOutline}
											color="light"
											style="padding-right: 5px;"
										/>

										<ion-icon
											slot="end"
											icon={machine.is_primary ? star : ellipse}
											color={machine.state === 'started' ? 'success' : 'warning'}
											style="padding-right: 5px;"
										/>
									</ion-item>

									<div slot="content">
										<ion-item style="--padding-start:0px;">
											<div id="xxxxx" style="padding-top:40px;padding-bottom:100%;">
												<ion-tabs style="padding-top: 0px;">
													<!-- Tab views -->
													<ion-tab tab="configuration" style="overflow-y: scroll;">
														<ion-item-divider color="light">
															<ion-label>Configuration</ion-label>
														</ion-item-divider>

														<ion-grid style="width: 100%;">
															<ion-row>
																<ion-col style="font-weight: bold;">
																	<ion-label>Instance Type</ion-label>
																</ion-col>
																<ion-col>
																	<ion-label
																		>{machine?.is_primary ? 'Primary' : 'Replica'}</ion-label
																	>
																</ion-col>
															</ion-row>
															<ion-row>
																<ion-col style="font-weight: bold;"> Hardware </ion-col>
																<ion-col>
																	{machine?.config?.guest?.cpus}
																	{machine?.config?.guest?.cpu_kind} CPU(s) with {machine?.config
																		?.guest?.memory_mb}mb ram
																</ion-col>
															</ion-row>
															<ion-row>
																<ion-col style="font-weight: bold;">
																	<ion-label>PB Version</ion-label>
																</ion-col>
																<ion-col>
																	<ion-label>{machine?.image_ref?.tag}</ion-label>
																</ion-col>
															</ion-row>
															<ion-row>
																<ion-col style="font-weight: bold;">
																	<ion-label>State</ion-label>
																</ion-col>
																<ion-col>
																	<ion-label>{machine?.state}</ion-label>
																</ion-col>
															</ion-row>
															<ion-row>
																<ion-col style="font-weight: bold;">
																	<ion-label>Created</ion-label>
																</ion-col>
																<ion-col>
																	<ion-label>{machine?.created_at}</ion-label>
																</ion-col>
															</ion-row>
															<ion-row>
																<ion-col style="font-weight: bold;">
																	<ion-label>Updated</ion-label>
																</ion-col>
																<ion-col>
																	<ion-label>{machine?.updated_at}</ion-label>
																</ion-col>
															</ion-row></ion-grid
														>
													</ion-tab>
													<ion-tab tab="events" style="overflow-y: scroll;">
														<ion-item-divider color="light">
															<ion-label>Events</ion-label>
														</ion-item-divider>

														<ion-grid style="width: 100%;">
															<ion-row style="width: 100%; font-weight: bold;">
																<ion-col size={'2'}>
																	<ion-label>Src</ion-label>
																</ion-col>
																<ion-col size={'3'}>
																	<ion-label>Status</ion-label>
																</ion-col>
																<ion-col size={'2'}>
																	<ion-label>Evt</ion-label>
																</ion-col>
																<ion-col size={'5'}>
																	<ion-label>Timestamp</ion-label>
																</ion-col>
															</ion-row>
															{#each machine?.events as event}
																<ion-row style="width: 100%;">
																	<ion-col size={'2'}>
																		<ion-label>{event?.source}</ion-label>
																	</ion-col>
																	<ion-col size={'3'}>
																		<ion-label>{event?.status}</ion-label>
																	</ion-col>
																	<ion-col size={'2'}>
																		<ion-label>{event?.type}</ion-label>
																	</ion-col>
																	<ion-col size={'5'}>
																		<ion-label
																			>{@html new Date(
																				event?.timestamp || 0
																			).toLocaleString()}</ion-label
																		>
																	</ion-col>
																</ion-row>
															{/each}
														</ion-grid>
													</ion-tab>
													<ion-tab tab="pitr" style="overflow-y: scroll;">
														<ion-grid class="width-100">
															{#if machinePitrChanged[machine.machine_id || '']}
																<ion-row>
																	<ion-col>
																		<ion-button
																			size="small"
																			expand="block"
																			on:click={() => {
																				updateStreamingBackupSettings(machine)
																			}}
																			color="danger">Update Streaming Backup Settings</ion-button
																		>
																	</ion-col>
																</ion-row>
															{/if}
															<ion-row>
																<ion-segment
																	value={pitrMode}
																	on:ionChange={() => {
																		togglePitrMode(machine)
																	}}
																>
																	<ion-segment-button value="configure">
																		<ion-label>Configure</ion-label>
																	</ion-segment-button>
																	<ion-segment-button value="restore">
																		<ion-label>Restore</ion-label>
																	</ion-segment-button>
																</ion-segment>
															</ion-row>
															{#if pitrMode === 'configure'}
																<ion-row>
																	<ion-col size={'12'}>
																		<ion-grid class="width-100">
																			<ion-row>
																				<ion-col size={'auto'}>
																					<ion-label style="padding-top: 10px;font-weight: bold;"
																						>Streaming Enabled:</ion-label
																					>
																				</ion-col>
																				<ion-col size={'auto'}>
																					<ion-toggle
																						on:ionChange={(e) => {
																							setMachinePitr(e, machine, 'data_enabled')
																						}}
																						checked={machine?.metadata?.pitr?.data_enabled}
																						disabled={false}>data.db</ion-toggle
																					>
																				</ion-col>
																				<ion-col size={'auto'}>
																					<ion-toggle
																						on:ionChange={(e) => {
																							setMachinePitr(e, machine, 'logs_enabled')
																						}}
																						checked={machine?.metadata?.pitr?.logs_enabled}
																						disabled={false}>logs.db</ion-toggle
																					>
																				</ion-col>
																			</ion-row>
																		</ion-grid>
																	</ion-col>
																</ion-row>
																<ion-row>
																	<ion-col style="width: 100%;">
																		<ion-item-divider color="light">
																			Storage Service
																		</ion-item-divider>
																	</ion-col>
																</ion-row>
																<ion-row>
																	<ion-col size={'4'}>
																		<ion-label>Bucket</ion-label>
																	</ion-col>
																	<ion-col size={'8'}>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'bucket')
																			}}
																			class="loginInputBoxWithIcon"
																			type="text"
																			id="bucket"
																			name="bucket"
																			placeholder="bucket"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.bucket}
																			debounce={500}
																		/></ion-col
																	>
																</ion-row>
																<ion-row>
																	<ion-col size={'4'}>
																		<ion-label>Base Path</ion-label>
																	</ion-col>
																	<ion-col size={'8'}>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'path')
																			}}
																			class="loginInputBoxWithIcon"
																			type="text"
																			id="path"
																			name="path"
																			placeholder="path"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadat?.pitr?.path}
																			debounce={500}
																		/></ion-col
																	>
																</ion-row>
																<ion-row>
																	<ion-col size={'4'}>
																		<ion-label>Endpoint</ion-label>
																	</ion-col>
																	<ion-col size={'8'}>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'endpoint')
																			}}
																			class="loginInputBoxWithIcon"
																			type="password"
																			id="endpoint"
																			name="endpoint"
																			placeholder="endpoint"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.endpoint}
																			debounce={500}
																		>
																			<ion-icon
																				style="padding-left: 10px;"
																				icon={eyeOffOutline}
																				on:click={(e) => {
																					console.log('e', e.target.parentElement)
																					const input = e.target.parentElement
																					input.type =
																						input.type === 'password' ? 'text' : 'password'
																					e.target.icon =
																						input.type === 'password' ? eyeOffOutline : eyeOutline
																				}}
																			/>
																		</ion-input></ion-col
																	>
																</ion-row>
																<ion-row>
																	<ion-col size={'4'}>
																		<ion-label>Access Key</ion-label>
																	</ion-col>
																	<ion-col size={'8'}>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'access_key_id')
																			}}
																			class="loginInputBoxWithIcon"
																			type="password"
																			id="access_key_id"
																			name="access_key_id"
																			placeholder="access_key_id"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.access_key_id}
																			debounce={500}
																		>
																			<ion-icon
																				style="padding-left: 10px;"
																				icon={eyeOffOutline}
																				on:click={(e) => {
																					console.log('e', e.target.parentElement)
																					const input = e.target.parentElement
																					input.type =
																						input.type === 'password' ? 'text' : 'password'
																					e.target.icon =
																						input.type === 'password' ? eyeOffOutline : eyeOutline
																				}}
																			/>
																		</ion-input>
																	</ion-col>
																</ion-row>
																<ion-row>
																	<ion-col size={'4'}>
																		<ion-label>Secret Key</ion-label>
																	</ion-col>
																	<ion-col size={'8'}>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'secret_access_key')
																			}}
																			class="loginInputBoxWithIcon"
																			type="password"
																			id="secret_access_key"
																			name="secret_access_key"
																			placeholder="secret_access_key"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.secret_access_key}
																			debounce={500}
																		>
																			<ion-icon
																				style="padding-left: 10px;"
																				icon={eyeOffOutline}
																				on:click={(e) => {
																					console.log('e', e.target.parentElement)
																					const input = e.target.parentElement
																					input.type =
																						input.type === 'password' ? 'text' : 'password'
																					e.target.icon =
																						input.type === 'password' ? eyeOffOutline : eyeOutline
																				}}
																			/>
																		</ion-input></ion-col
																	>
																</ion-row>
																<ion-row>
																	<ion-col>
																		<ion-label>Retention (hrs)</ion-label>
																	</ion-col>
																	<ion-col class="ion-text-center">
																		<ion-label>Snapshot (hrs)</ion-label>
																	</ion-col>
																	<ion-col class="ion-text-right">
																		<ion-label>Sync (secs)</ion-label>
																	</ion-col>
																</ion-row>
																<ion-row>
																	<ion-col>
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'retention')
																			}}
																			class="loginInputBoxWithIcon"
																			type="text"
																			id="retention"
																			name="retention"
																			placeholder="retention (hrs)"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.retention}
																			debounce={500}
																		/></ion-col
																	>
																	<ion-col class="ion-text-center">
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'snapshot_interval')
																			}}
																			class="loginInputBoxWithIcon"
																			type="text"
																			id="snapshot_interval"
																			name="snapshot_interval"
																			placeholder="snapshot (hrs)"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.snapshot_interval}
																			debounce={500}
																		/></ion-col
																	>
																	<ion-col class="ion-text-right">
																		<ion-input
																			on:ionChange={(e) => {
																				setMachinePitr(e, machine, 'sync_interval')
																			}}
																			class="loginInputBoxWithIcon"
																			type="text"
																			id="sync_interval"
																			name="sync_interval"
																			placeholder="sync (secs)"
																			style="--padding-start: 10px;--padding-end: 10px;"
																			value={machine?.metadata?.pitr?.sync_interval}
																			debounce={500}
																		/></ion-col
																	>
																</ion-row>
															{/if}
															{#if pitrMode === 'restore'}
																<ion-item-divider color="light">
																	<ion-label>Restore database:</ion-label>
																</ion-item-divider>

																<ion-row>
																	<ion-segment
																		value={restoreDBType}
																		on:ionChange={(e) => {
																			restoreDBType = e.detail.value
																		}}
																	>
																		<ion-segment-button value="data">
																			<ion-label>data.db</ion-label>
																		</ion-segment-button>
																		<ion-segment-button value="logs">
																			<ion-label>logs.db</ion-label>
																		</ion-segment-button>
																	</ion-segment>
																</ion-row>
																<ion-button
																	size="small"
																	expand="block"
																	on:click={() => {
																		loadPitrGenerations(machine, restoreDBType)
																	}}>view backup generations for {restoreDBType}.db</ion-button
																>

																<ion-accordion-group
																	on:ionChange={async (e) => {
																		console.log('accordion-group ionChange', e)
																		const wal = await loadPitrWal(
																			machine,
																			restoreDBType,
																			e.detail.value
																		)
																		console.log('wal', wal)
																		const el = document.getElementById(e.detail.value + '-content')
																		if (el) {
																			for (let i = 0; i < wal.length; i++) {
																				const btn = document.createElement('ion-button')
																				//btn.size = "small"
																				btn.expand = 'block'
																				btn.color = 'primary'
																				btn.classList.add('restoreButton')
																				btn.textContent = 'restore backup point: ' + wal[i].created
																				btn.onclick = async () => {
																					restoreFile(
																						machine,
																						e.detail.value,
																						wal[i].created,
																						restoreDBType
																					)
																				}
																				el.appendChild(btn)
																			}
																		}
																	}}
																>
																	{#each generations as generation}
																		<ion-accordion
																			id={generation.generation}
																			value={generation.generation}
																		>
																			<ion-item slot="header">
																				Generation: {generation.start}
																			</ion-item>
																			<div slot="content" id={generation.generation + '-content'} />
																		</ion-accordion>
																	{/each}
																</ion-accordion-group>
															{/if}
														</ion-grid>
													</ion-tab>
													<ion-tab tab="keys" style="overflow-y: scroll;">
														<div>

															<ion-grid class="ion-padding Grid">
																<ion-row>
																	<ion-col>
																		<ion-item-divider>Installed on this machine:</ion-item-divider>
																			{#each keys as key}
																				<ion-item>
																					<ion-label>{key.title || "Unnamed Public SSH Key"}</ion-label>
																					<ion-toggle
																						on:ionChange|stopPropagation|preventDefault={()=>{toggleKeyInstallation(machine,key)}}
																						slot="end"
																						checked={Array.isArray(machine.keys) ? (machine.keys.find((k) => k.key === key.id)) : false}
																						disabled={false} />
																				</ion-item>
																			{/each}
																	</ion-col>
																</ion-row>
															</ion-grid>													
															
															
															<ion-grid class="ion-padding Grid">
																<ion-row>
																	<ion-col>
																		<ion-item-divider>My Public SSH Keys</ion-item-divider>
																		<ion-reorder-group id={`keygroup-${machine.id}`} disabled={false}>
																			{#each keys as key}
																				<ion-item on:click={()=>{editKey(key)}}>
																					<ion-label>{key.title || "Unnamed Public SSH Key"}</ion-label>
																					<ion-reorder slot="end" />
																				</ion-item>
																			{/each}
																		</ion-reorder-group>
																		<ion-item lines="none">
																			<ion-button style="width: 100%;" size="small" fill="outline" color="dark" expand="block" on:click={addKey}>
																				<ion-icon slot="icon-only" icon={addOutline} />
																				<ion-label>Add New Public SSH Key</ion-label>
																			</ion-button>
																		</ion-item>
																	</ion-col>
																</ion-row>
															</ion-grid>
													
															
															<!-- <div class="ion-padding">
																<ion-button
																	size="small"
																	expand="block"
																	fill={machine.showKeys ? 'solid' : 'outline'}
																	color="dark"
																	on:click={() => {
																		machine.showKeys = !machine.showKeys
																	}}
																>
																	<ion-icon
																		slot="start"
																		icon={machine.showKeys ? lockOpen : lockClosedOutline}
																	/> Manage Personal Public SSH Keys
																</ion-button>
															</div>

															{#if machine.showKeys}
																<Keys />
															{/if} -->
														</div>
													</ion-tab>

													<!-- Tab bar -->
													<ion-tab-bar slot="top">
														<ion-tab-button
															tab="configuration"
															on:click={() => {
																ionTabsDidChange('configuration')
															}}
														>
															<ion-icon icon={settingsOutline} />
															<ion-label>Configuration</ion-label>
														</ion-tab-button>
														<ion-tab-button
															tab="events"
															on:click={() => {
																ionTabsDidChange('events')
															}}
														>
															<ion-icon icon={listOutline} />
															<ion-label>Events</ion-label>
														</ion-tab-button>
														<ion-tab-button
															tab="pitr"
															on:click={() => {
																ionTabsDidChange('pitr')
															}}
														>
															<ion-icon icon={timeOutline} />
															<ion-label>Streaming Backups</ion-label>
														</ion-tab-button>
														<ion-tab-button
															tab="keys"
															on:click={() => {
																ionTabsDidChange('keys')
															}}
														>
															<ion-icon icon={keyOutline} />
															<ion-label>SSH Keys</ion-label>
														</ion-tab-button>
													</ion-tab-bar>
												</ion-tabs>
											</div>
										</ion-item>
										{#if !machine.is_primary}
											<div class="ion-padding">
												<ion-button
													size="small"
													expand="block"
													on:click={() => {
														rsync(machine)
													}}
													color="medium"
												>
													<ion-icon slot="start" icon={refreshOutline} />
													Re-sync Data
												</ion-button>
												<ion-button
													size="small"
													expand="block"
													on:click={() => {
														removeMachine(machine)
													}}
													color="danger"
												>
													<ion-icon slot="start" icon={trashOutline} />
													Remove Machine
												</ion-button>
											</div>
										{/if}
									</div>
								</ion-accordion>
							{/each}
						</ion-accordion-group>
					</ion-list>
					<ion-item>
						<div style="width:100%;text-align:center;">
							<ion-button size="small" expand="block" on:click={addNewRegion}>
								<ion-icon slot="icon-only" icon={addOutline} />
								&nbsp;Add New Region
							</ion-button>
						</div>
					</ion-item>
				</ion-col></ion-row
			></ion-grid
		>


		

	</ion-content>
</IonPage>

<style>
	.loginInputBoxWithIcon {
		height: 30px;
	}
	.width-100 {
		width: 100%;
	}
	.width-100.ion-row {
		width: 100%;
	}
	.restoreButton {
		padding: 10px;
	}
	.Grid {
		max-width: 500px;
	}

</style>
