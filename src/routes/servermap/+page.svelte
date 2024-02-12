<script lang="ts">
	import IonPage from '$ionpage'

	import WorldMap from './WorldMap.svelte'
	console.log('map')
</script>

<IonPage>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-menu-button />
			</ion-buttons>
			<ion-title>Map</ion-title>
		</ion-toolbar>
	</ion-header>
	<ion-content>
		<WorldMap />
	</ion-content>
</IonPage>
