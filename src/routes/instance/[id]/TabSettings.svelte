<script lang="ts">
	import type { Project, ProjectInstance, Site, StreamingBackupSite } from '$models/interfaces'
	import { currentUser, pb } from '$services/backend.service'
	// import TabSettingsStreamingBackup from './TabSettingsStreamingBackup.svelte';
	import * as allIonicIcons from 'ionicons/icons'

	// import { showConfirm } from '$services/alert.service'
	// import { toast } from '$services/toast'
	import { goto } from '$app/navigation'
	// import { cloudDownloadOutline, cloudUploadOutline, trashOutline } from 'ionicons/icons'
	import { instanceTab } from './instanceTabStore'
	import { dropdownmenu } from '$components/DropdownMenu'

	export let project_instance: ProjectInstance = {
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
	}
	export let sites: Site[] = []
	export let projectInstances: any[] = []
	export let streaming_backup_sites: StreamingBackupSite[] = []
	instanceTab.subscribe((value: string) => {
		if (value === 'settings') {
		}
	})

	const changeStatus = async (e: any) => {
		let items = [
			{
				text: 'Online',
				icon: allIonicIcons.cloudOutline,
				color: 'success',
				disabled: (project_instance.instance_status === 'online'),
				// textcolor: 'dark',
				handler: async () => {
					await toggleinstance('online')
				},
			},
			{
				text: 'Offline',
				icon: allIonicIcons.cloudOfflineOutline,
				color: 'danger',
				disabled: (project_instance.instance_status === 'offline'),
				// textcolor: 'dark',
				handler: async () => {
					await toggleinstance('offline')
				},
			},
			{
				text: 'Maintenance Mode',
				icon: allIonicIcons.cloudOfflineOutline,
				color: 'warning',
				disabled: (project_instance.instance_status === 'maintenance'),
				// textcolor: 'dark',
				handler: async () => {
					await toggleinstance('maintenance')
				},
			}

		]
		const result = await dropdownmenu(e, items)
	}
	const toggleinstance = async (status: string) => {
		const { data, error } = await pb.send(`/toggleinstance`, {
			method: 'POST',
			body: {
				instance_id: project_instance.id,
				status: status,
			},
		})
		if (data === 'OK') {
			project_instance.instance_status = status
		}
	}

</script>

<ion-grid class="ion-padding Grid" style="height: 100%;overflow-x: scroll;">
	<ion-row>
		<ion-col class="ion-text-right bold">
			<ion-label>Project Name</ion-label>
		</ion-col>
		<ion-col>
			<ion-label>{project_instance.name}</ion-label>
		</ion-col>
	</ion-row>

	<ion-row>
		<ion-col class="ion-text-right bold">
			<ion-label>Domain</ion-label>
		</ion-col>
		<ion-col>
			<ion-label>{project_instance.domain}.{project_instance.site_domain}</ion-label>
		</ion-col>
	</ion-row>

	<ion-row>
		<ion-col class="ion-text-right bold">
			<ion-label>Site</ion-label>
		</ion-col>
		<ion-col>
			<ion-label>{project_instance.site_name}</ion-label>
		</ion-col>
	</ion-row>
	<ion-row>
		<ion-col class="ion-text-right bold">
			<ion-label>Instance Type</ion-label>
		</ion-col>
		<ion-col>
			<ion-label>{project_instance.type}</ion-label>
		</ion-col>
	</ion-row>

	<ion-row>
		<ion-col class="ion-text-right bold" style="padding-top: 12px;">
			<ion-label>Instance Status</ion-label>
		</ion-col>
		<ion-col>
			<ion-button size="small" color={
				project_instance.instance_status === 'online' ? 'success' : 
				project_instance.instance_status === 'offline' ? 'danger' : 'warning'
			} expand="block" on:click={changeStatus}
				>{project_instance.instance_status || 'unknown'}</ion-button
			>
		</ion-col>
	</ion-row>

	<ion-row><ion-col>&nbsp;</ion-col></ion-row>

	<ion-button
		size="small"
		expand="block"
		on:click={() => {
			goto(`/streamingbackups/${project_instance.id}`)
		}}>Streaming Backups</ion-button
	>
</ion-grid>

<style>
	.bold {
		font-weight: bold;
	}
</style>
