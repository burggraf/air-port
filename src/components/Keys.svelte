<script lang="ts">
	import {
		add,
		addOutline,
		closeCircleOutline,
		cloudUploadOutline,
		imageOutline,
		personOutline,
	} from 'ionicons/icons'
	import { pb, currentUser, apiURL } from '$services/backend.service'
	import { onMount } from 'svelte'
	import { modalController } from '$ionic/svelte'
	import keyModal from './keyModal.svelte'
    interface Key {
        id: string,
        title: string,
        sort_key: number,
        key: string
    }
	let keys: Key[] = []

	const loadKeys = async () => {
		keys = await pb.collection('user_keys').getFullList({
                fields: 'id,title,key,sort_key',
				sort: 'sort_key',
			});
	}

	onMount(async () => {
		// console.log('onMount loadKeys()')
        loadKeys()
		const reorderGroup = document.getElementById('keygroup')
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
	})
	const updateKeyOrder = async () => {
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i]
			key.sort_key = i
			await pb.collection('user_keys').update(key.id, key)
		}
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


</script>

<ion-grid class="ion-padding Grid">
    <ion-row>
        <ion-col>
            <ion-item-divider>Public SSH Keys</ion-item-divider>
            <ion-reorder-group id="keygroup" disabled={false}>
                {#each keys as key}
                    <ion-item on:click={()=>{editKey(key)}}>
                        <ion-label>{key.title || "Unnamed Public SSH Key"}</ion-label>
                        <ion-reorder slot="end" />
                    </ion-item>
                {/each}
            </ion-reorder-group>
            <ion-item lines="none">
                <ion-button style="width: 100%;" size="default" expand="block" on:click={addKey}>
                    <ion-icon slot="icon-only" icon={addOutline} />
                    <ion-label>Add New Public SSH Key</ion-label>
                </ion-button>
            </ion-item>
        </ion-col>
    </ion-row>
</ion-grid>

<style>
	.title {
		padding-left: 10px;
	}
	.container {
		width: 150px;
		height: 150px;
		border: 1px solid; /* Optional, just for visibility */
		border-color: var(--ion-color-medium);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.container ion-img {
		max-width: 100%;
		max-height: 100%;
	}
	.Grid {
		max-width: 500px;
	}
	.ProvidersGrid {
		max-width: 375px;
	}
	input:-webkit-autofill {
		-webkit-text-fill-color: var(--ion-color-FORCEDARK);
		font-weight: 500px;
	}

	input:-webkit-autofill:focus {
		-webkit-text-fill-color: var(--ion-color-FORCEDARK);
		font-weight: 500px;
	}

	.inputIcon {
		margin-left: 10px;
		margin-right: 10px;
	}

	.GridItem {
		--padding-start: 0px;
		--padding-end: 0px;
		--inner-padding-end: 0px;
	}
	.InputBoxWithIcon {
		height: 50px;
		border: 1px solid;
		border-color: var(--ion-color-medium);
		background-color: var(--ion-background-color) !important;
		border-radius: 5px;
	}
	.toast {
		font-weight: bold;
	}
	.flex-container {
		display: flex;
		display: -webkit-flex;
		display: -moz-flex;
		flex-flow: row wrap;
		-webkit-flex-flow: row wrap;
		-moz-flex-flow: row wrap;
		justify-content: center;
	}
</style>
