<script lang="ts">
	import TabCLI from './TabCLI.svelte';
	import TabGUI from './TabGUI.svelte'
	import TabLogs from './TabLogs.svelte'
	import TabMetrics from './TabMetrics.svelte'
	import TabSettings from './TabSettings.svelte'
	import '$styles/grid-styles.css'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import { dropdownmenu } from '$components/DropdownMenu'
	import * as allIonicIcons from 'ionicons/icons'
	import {
		arrowBackOutline,
	} from 'ionicons/icons'
	import { currentUser, pb } from '$services/backend.service'
	import { goto } from '$app/navigation'
	import { toast } from '$services/toast'
	import { instanceTab } from './instanceTabStore'
	export let id = $page.params.id
	// const instance_id = $page.params.id
	import type { Project, ProjectInstance, Site, Key, ProjectInstanceKey, StreamingBackupSite } from '$models/interfaces'
	import { onMount } from 'svelte'
	import { showConfirm } from '$services/alert.service'
	import { loadingBox } from '$services/loadingMessage'
	import { modalController } from '$ionic/svelte'
	import cloneModal from './cloneModal.svelte'
	import { currentState } from '$services/state.service'

	let tabMetricsProxy: any;
	let keys: Key[] = []
	let project_instance_keys: ProjectInstanceKey[] = []

	let sites: Site[] = []
	let streaming_backup_sites: StreamingBackupSite[] = []
	let projectInstances: any[] = []
	let project_instance: ProjectInstance = 
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
		logs_streaming_backup_retention: 0,
		instance_status: ''
	};	
	let initTab: string;
	onMount(async () => {
		initTab = localStorage.getItem('instance.tab') || 'settings'
		// console.log('localStorage got ====> initTab', initTab)
		setTimeout(() => {
			const tb: any = document.getElementById('ion-tabs')
			// console.log('setTimeout changing tab to:', initTab)
			// console.log('tb is ', tb)
			if (tb) tb.select(initTab || 'settings')
		}, 100)
		localStorage.setItem('page', window.location.pathname)
		
	})
	const ionViewWillEnter = async () => {
		// console.log('*** ionViewWillEnter, id', id)
		if (!$currentUser) {
			goto('/');
		}
		
		// console.log('*** looking for instances with id', id)
		project_instance = await pb.collection('instance_view').getFirstListItem(
			`id = "${id}"`,{
			fields: 'name, project_id, owner, ownertype, code, domain, id, port, site_domain, site_name, site_id, type, db_streaming_backup_location, logs_streaming_backup_location, db_streaming_backup_retention, logs_streaming_backup_retention, instance_status',
		})

		// console.log('*****  project_instance', project_instance)
		sites = await pb.collection('sites').getFullList({
			fields: 'id, name, code, domain, active',
		})
		keys = await pb.collection('user_keys').getFullList({
			fields: 'id,title,key,sort_key',
			sort: 'sort_key',
		})
		streaming_backup_sites = await pb.collection('streaming_backup_sites').getFullList({
			fields: 'id, name, location',
		})
		projectInstances = await pb.collection('instance_view').getFullList({
			fields: 'id, site_id, site_name, site_domain, type',
			filter: `project_id = "${project_instance.project_id}"`,
		})
		const tb: any = document.getElementById('ion-tabs')
		

	}
	const back = async () => {
		//goto('/projects')
		// window.history.back();
		goto('/project/' + project_instance.project_id)
	}
	const gotoAdminPage = async () => {
		window.open(`https://${project_instance.domain}.${project_instance.site_domain}/_/`, '_blank')
	}
	const gotoSite = async () => {
		window.open(`https://${project_instance.domain}.${project_instance.site_domain}/`, '_blank')
	}
	const removeinstance = async () => {
		// console.log('removeinstance')
		// console.log('project_instance', project_instance)
		// console.log('sites', sites)
		if (projectInstances.length > 1 && project_instance.type === 'primary') {
			toast('You cannot remove the primary instance if there are existing replicas', 'danger')
			return
		}
		if (project_instance.db_streaming_backup_location || 
			project_instance.logs_streaming_backup_location) {
			toast('You cannot remove an instance with streaming backups enabled', 'danger')
			return
		}
		await showConfirm({
			header: 'Remove Project Instance',
			message: `Are you SURE?  This cannot be undone.  If this is the last instance, the project will also be removed.`,
			okHandler: async () => {
				// console.log('calling /removeproject')
				const { data, error } = await pb.send('/removeproject', {
					method: 'POST',
					body: {
						project_instance: project_instance,
					},
				})

				// we need to call setup-marmot to reconfigure marmot
				// this will delete marmot if there is only one instance left
				// it will also remove sync files if there is only one instance left
				// console.log('********************');
				// console.log(`/setup-marmot/${project_instance.project_id}`)
				// console.log('********************');
				const { data:setupMarmotData, error:setupMarmotError } = 
					await pb.send(`/setup-marmot/${project_instance.project_id}`, {
					method: 'GET',
				})
				if (setupMarmotError) {
					console.error('/setup-marmot error', setupMarmotError)
					toast(JSON.stringify(setupMarmotError), 'danger')
				}

				// console.log('data', data)
				// console.log('typeof data', typeof data)
				// console.log('error', error)
				if (error) {
					toast('Error: ' + JSON.stringify(error), 'danger')
				} else {
					if (data === '0') {
						toast(`Project ${project_instance.name} removed`, 'success')
						goto('/projects')
					} else {
						toast(`Project instance removed, ${data} instances remain`, 'success')
						goto('/project/' + project_instance.project_id)
					}
				}
			},
		})
	}
    const sync = async (direction: string) => {
		await showConfirm({
			header: 'Sync Project ' + direction.toLocaleUpperCase(),
			message: `This will sync the entire project ${direction.toUpperCase()}.  Are you SURE?`,
			okHandler: async () => {
                const loader = await loadingBox(`Syncing project ${direction.toUpperCase()}...`)
                loader.present()
				const { data, error } = await pb.send(`/sync/${project_instance.id}/${direction}`, {
					method: 'GET',
				})
                loader.dismiss()
                if (error) {
                    toast('Error: ' + JSON.stringify(error), 'danger')
                } else {
                    toast('Sync complete', 'success')
                }
			},
		})
        
    }
	const clone = async (key?: any) => {
		const modal = await modalController.create({
			component: cloneModal,
			componentProps: {instance: project_instance},
			showBackdrop: true,
			backdropDismiss: false,
		})

		modal.onDidDismiss().then((value) => {
			//if (value.role === 'backdrop') console.log('Backdrop clicked');
			// loadKeys()
		})

		await modal.present()
	}
	const actionMenu = async (e: any) => {
		let syncItem: any;
		if (project_instance.type === 'primary') {
			syncItem = {
				text: 'Sync Up',
				icon: allIonicIcons.cloudUploadOutline,
				handler: () => {
                    sync('up')
                },
			};
		} else {
			syncItem = 
			{
				text: 'Sync Down',
				icon: allIonicIcons.cloudDownloadOutline,
				handler: () => {
                    sync('down')
                },
			}
		}
		const items = [
			{
				text: 'Launch Site',
				iconSrc: '/launch.svg',
				handler: () => {
                    gotoSite();
                },
			},
			{
				text: 'PB Admin',
				iconSrc: '/pb.svg',
				handler: () => {
                    gotoAdminPage();
                },
			},
			{
				text: 'Clone',
				icon: allIonicIcons.copyOutline,
				handler: () => {
                    clone();
                },
			},
			{
				text: 'Delete',
				icon: allIonicIcons.trashOutline,
				color: 'danger',
				textcolor: 'danger',
				handler: () => {
                    removeinstance();
                },
			},
			{
				text: 'Cancel',
				icon: allIonicIcons.closeOutline,
				handler: () => {
					// console.log('Cancel clicked')
				},
			},
		]
		if (projectInstances.length > 1 && syncItem) {
			// insert into third from last position
			items.splice(items.length - 2, 0, syncItem)
		}
		const result = await dropdownmenu(e, items)
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
			<ion-title>{project_instance?.name || '<untitled project>'}: {project_instance?.site_name}</ion-title>
			<ion-buttons slot="end">
					<!-- <ion-button on:click={gotoSite}>
						<ion-icon slot="icon-only" src="/launch.svg" />
					</ion-button>
					<ion-button on:click={gotoAdminPage}>
							<ion-icon slot="icon-only" src="/pb.svg" />
					</ion-button> -->
					{#if $instanceTab === 'metrics'}
						<ion-button on:click={tabMetricsProxy.refresh}>
							<ion-icon slot="icon-only" icon={allIonicIcons.refreshOutline} />
						</ion-button>
					{/if}
					<ion-button on:click={actionMenu}>
						<ion-icon slot="icon-only" icon={allIonicIcons.ellipsisVerticalOutline} />
					</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>	
	<ion-content class="ion-padding">
		<ion-tabs id="ion-tabs"
			on:ionTabsDidChange={(e) => {
				// console.log('*********************************************')
				// console.log('***** ionTabsDidChange               ********')
				// console.log('*********************************************')
				// console.log('e', e)
				// console.log(e.detail.tab);
				// console.log('loccalStorage setting instance.tab', e.detail.tab)
				localStorage.setItem('instance.tab', e.detail.tab)
				instanceTab.set(e.detail.tab)
				// console.log('*********************************************')
			}}
		>
			<ion-tab tab="settings">
					<TabSettings {project_instance} {sites} {streaming_backup_sites} {projectInstances} />
			</ion-tab>
			<ion-tab tab="gui">
					<TabGUI {project_instance} />
					<!-- <div class="ion-padding ion-text-center">
						<ion-spinner name="crescent" /><br/>
						<ion-label>Loading...</ion-label>
					</div> -->
			</ion-tab>
			<ion-tab tab="cli">
					<TabCLI {keys} {project_instance_keys} {project_instance} />
			</ion-tab>
			<ion-tab tab="logs">
					<TabLogs {project_instance} />
			</ion-tab>
			<ion-tab tab="metrics">
					<TabMetrics {project_instance} bind:this={tabMetricsProxy} />
			</ion-tab>
			<ion-tab-bar id="tab-bar" slot="top">
				<ion-tab-button tab="settings">
					<ion-icon src="settings.svg" />Settings
				</ion-tab-button>
				<ion-tab-button tab="gui">
					<ion-icon src="gui.svg" />GUI
				</ion-tab-button>
				<ion-tab-button tab="cli">
					<ion-icon src="cli.svg" />CLI
				</ion-tab-button>
				<ion-tab-button tab="logs">
					<ion-icon src="logs.svg" />Logs
				</ion-tab-button>
				<ion-tab-button tab="metrics">
					<ion-icon src="metrics.svg" />Metrics
				</ion-tab-button>
			</ion-tab-bar>
		</ion-tabs>
	</ion-content>
</IonPage>
