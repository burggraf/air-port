<script lang="ts">
    import IonPage from "$ionpage";
	import { goto } from '$app/navigation';
</script>
<IonPage>
<ion-header>
	<ion-toolbar color="primary">
		<ion-buttons slot="start">
			<ion-menu-button />
		</ion-buttons>
		<ion-title>What's New?</ion-title>
	</ion-toolbar>
</ion-header>
<ion-content class="ion-padding">
    <div class="inner-div">
    <h1>Azabab</h1>
    <h2>0.0.1</h2>
    <ul>
        <li>initial release</li>
    </ul>
</div>
</ion-content>
</IonPage>
<style>
    .inner-div {
        margin:40px;
    }
    ion-content {
        font-size: 1.2em;
    }
    p {
        font-size: 1em;
        /* margin-bottom: 1em; */
    }
    li {
        font-size: 1em;
        margin-bottom: 1em;
    }
</style>












