<script lang="ts">
	import IonPage from '$ionpage'
	import { modalController } from '$ionic/svelte'
	import { checkmarkOutline, closeOutline, trashOutline } from 'ionicons/icons'
	import { currentUser, pb } from '$services/backend.service'
	import { toast } from '$services/toast'
	import { onMount } from 'svelte'
	import { showConfirm } from '$services/alert.service'
    interface IObjectKeys {
        [key: string]: string | number;
    }

	interface Data extends IObjectKeys {
		key: string
		title: string
		user_id: string
		sort_key: number
		id: string
	}
	export let data: Data = {
		key: '', // Example variable
		title: '', // Another variable
		user_id: '',
		sort_key: 0,
		id: '',
	}
	onMount(async () => {
		if (!$currentUser) {
			toast('You must be logged in to add a key', 'danger')
			closeModal()
		}
		console.log('we got data', data)
	})
	const closeModal = async () => {
		modalController.dismiss()
	}
	const handleChange = async (event: any) => {
		const { id, value } = event.target
		data[id] = value
	}
	const save = async () => {
        if (data.key.substring(0,7) !== 'ssh-rsa') {
			await showConfirm({
				header: 'Public key does not appear to be valid',
				message: `This doesn't look right.  Usually, a public key starts with 'ssh-rsa'.  Are you sure you want to save this?`,
				okHandler: async () => {
                    saveKey()
				},
			})
        } else { 
            saveKey()
        }
	}
    const saveKey = async () => {
        console.log('continue saving');
		if (data?.id) {
			const record = await pb.collection('user_keys').update(data.id, data)
			if (!record?.id) {
				toast('Error saving key', 'danger')
			} else {
				closeModal()
			}
		} else {
			data.user_id = $currentUser.id
			data.sort_key = 0
			const record = await pb.collection('user_keys').create(data)
			if (!record?.id) {
				toast('Error saving key', 'danger')
			} else {
				closeModal()
			}
		}
    }
    const deleteKey = async () => {
		if (data?.id) {
			await showConfirm({
				header: 'Delete this key?',
				message: `This cannot be undone.`,
				okHandler: async () => {
                    console.log('ok handler was pushed');
                    const result = await pb.collection('user_keys').delete(data.id)
                    if (result) {
                        closeModal()
                    } else {
                        toast('Error deleting key', 'danger')
                    }
				},
			})
		}
	}
</script>

<IonPage>
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-button on:click={closeModal}>
					<ion-icon slot="icon-only" icon={closeOutline} />
				</ion-button>
			</ion-buttons>
			<ion-title>Public SSH Key</ion-title>
			<ion-buttons slot="end">
				<ion-button on:click={save}>
					<ion-icon slot="icon-only" icon={checkmarkOutline} />
				</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content>
		<!-- <ion-label position="stacked"><h1>API Key</h1></ion-label>
        <ion-text>(paste contents of your ~/.ssh/id_rsa.pub file)</ion-text> -->
		<div class="ion-padding">
			<div>
				Paste contents of the following file from your local computer: <pre>~/.ssh/id_rsa.pub</pre>
			</div>
			<ion-textarea
				style="padding: 10px; width: 100%; background-color: var(--ion-color-light);border: 1px solid;"
				rows={15}
				value={data.key}
				id="key"
				placeholder="paste key here"
				on:ionInput={handleChange}
				debounce={500}
			/>

			<!-- <ion-grid>
                <ion-row>
                    <ion-col size="auto"> -->

			<ion-label class="ion-padding"><h2 style="padding-left: 20px;">Key Name</h2></ion-label>
			<ion-item>
				<ion-input
					on:ionInput={handleChange}
					type="text"
					id="title"
					style="--padding-start: 10px; border: 1px solid;"
					placeholder="key name, for example 'my work laptop'"
					value={data.title}
					debounce={500}
				/>{#if data?.id}
                    <ion-button
					style="padding-left: 20px"
					slot="end"
					fill="clear"
					on:click={deleteKey}
					color="danger"><ion-icon slot="icon-only" icon={trashOutline} /></ion-button>
                    {/if}
			</ion-item>

			<!-- </ion-col>
                </ion-row>

            </ion-grid> -->
		</div>
	</ion-content>
</IonPage>
