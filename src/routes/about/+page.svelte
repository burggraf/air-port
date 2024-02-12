<script lang="ts">
	import IonPage from "$ionpage";
    import { pb } from '$services/backend.service'
    const ionViewWillEnter = async () => {
        console.log("ionViewWillEnter")
        const { data, error } = await pb.send('/get-environment',{"method":"GET"})
        console.log('enviroment:', data)
    }
</script>
<IonPage {ionViewWillEnter}>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-menu-button />
            </ion-buttons>
            <ion-title>About</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <h1>
            About
        </h1>
    </ion-content>
</IonPage>