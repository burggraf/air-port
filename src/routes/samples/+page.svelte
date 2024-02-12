<script lang="ts">
	import { IonPage } from 'ionic-svelte'
	import { dropdownmenu } from '$components/DropdownMenu'
	import sampleModal from './sample-modal/+page.svelte'
	import { openModal } from '$services/utils.service'
	import * as allIonicIcons from 'ionicons/icons'

	import { toast } from '$services/toast'
	import { alert } from '$services/alert.service'

	const actionMenu = async (e: any) => {
		const items = [
			{
				text: 'Item 1',
				icon: allIonicIcons.documentTextOutline,
				color: 'primary',
				textcolor: 'dark',
				handler: async () => {
					console.log('Item 1 clicked')
				},
			},
			{
				text: 'Item 2',
				icon: allIonicIcons.airplaneOutline,
				color: 'danger',
				textcolor: 'dark',
				handler: async () => {
					console.log('Item 2 clicked')
				},
			},
			{
				text: 'Cancel',
				icon: allIonicIcons.closeOutline,
			},
		]
		await dropdownmenu(e, items)
	}
</script>

<IonPage>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title>Samples Page</ion-title>
			<ion-buttons slot="end">
				<ion-button on:click={actionMenu}>
					<ion-icon slot="icon-only" icon={allIonicIcons.ellipsisVerticalOutline} />
				</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		<h1>Samples</h1>
		<ion-list lines="full">
			<ion-item
				on:click={() => {
					toast('This is a toast message', 'success')
				}}><ion-label>Toast</ion-label></ion-item
			>
			<ion-item
				on:click={() => {
					alert({
						header: 'Alert',
						message: 'This is an alert message',
						buttons: ['OK'],
					})
				}}
			>
				<ion-label>alert</ion-label></ion-item
			>
			<ion-item
				on:click={() => {
					alert({
						header: 'Confirm?',
						subHeader: 'confirm this operation',
						message: 'Are you sure?',
						buttons: [
							{
								text: 'Cancel',
								role: 'cancel',
								cssClass: 'secondary',
								handler: () => {
									console.log('Canceled!')
								},
							},
							{
								text: 'OK',
								handler: () => {
									console.log('Okie dokie!')
								},
							},
						],
					})
				}}><ion-label>alert / confirm</ion-label></ion-item
			>			
			<ion-item
				on:click={() => {
					alert({
						header: 'Choose one:',
						buttons: [
							{
								text: 'Item 1',
								handler: () => {
									console.log('Item 1!')
								},
							},
							{
								text: 'Item 2 (red)',
								handler: () => {
									console.log('Item 2!')
								},
								role: 'destructive',
							},
							{
								text: 'Item 3',
								handler: () => {
									console.log('Item 3!')
								},
							},
							{
								text: 'Cancel',
								role: 'cancel',
								cssClass: 'secondary',
								handler: () => {
									console.log('Canceled!')
								},
							},
						],
					})
				}}><ion-label>alert / choices</ion-label></ion-item
			>	
			<ion-item on:click={()=>{
				openModal(sampleModal, { title: 'I popped up!' })
			}}>Sample Modal</ion-item>		
		</ion-list>
	</ion-content>
</IonPage>
