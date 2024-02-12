<script lang="ts">
    import { currentUser } from "$services/backend.service";
    import IonPage from "$ionpage";
    console.log('$currentUser', $currentUser);
  </script>
<IonPage>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-menu-button />
            </ion-buttons>
            <ion-title>Welcome</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <h1>
            Welcome! 
        </h1>
    </ion-content>
</IonPage>