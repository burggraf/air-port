<script lang="ts">	
    import IonPage from "$ionpage";
	import { modalController } from '$ionic/svelte'
    import * as allIonicIcons from 'ionicons/icons';
	export let title: string = 'Sample Modal';
	const closeOverlay = () => {
		if (modal)
			modalController.dismiss({ data: new Date() });
		else
			window.history.back();
	};

	let modal = false;
	modalController.getTop().then((modalElement) => {
		if (modalElement) {
			console.log('*** WE ARE MODAL ***')
			modal = true;
		}
	})

</script>
<IonPage>
<ion-header translucent={true}>
	<ion-toolbar id="selectorToolbar">
		<ion-title>{title}</ion-title>
		<ion-buttons slot="start">
			<ion-button on:click={closeOverlay}>
				<ion-icon
					slot="icon-only"
					icon={modal ? allIonicIcons.closeOutline : allIonicIcons.arrowBackOutline}
				/>
			</ion-button>
		</ion-buttons>
	</ion-toolbar>
</ion-header>
<ion-content>
	<div id="selectorDiv" style="overflow-y: scroll;" class="ion-padding">
        This is a modal page that can be called using openModal in services/utils.service.ts
        or just as a regular page using the router.<br/>
        {#each Array(30) as item, i}
            Line {i + 1}<br/>
        {/each}
        This is the end of the line.<br/>
	</div>
</ion-content>
</IonPage>
<style>
</style>
