<script lang="ts">
	import LoginModal from './LoginModal.svelte'
	import { modalController } from '$ionic/svelte'
	import { currentUser } from '$services/backend.service'
	import { signOut } from './Login';
	export let profileFunction: Function = () => {}
	export let providers: string[] = []
	export let onSignIn: Function = () => {}
	export let onSignOut: Function = () => {}
	const defaultButtonProps: any = {
			fill:"outline",
			color:"dark",
			size:"small",
			expand:"block"
	}
	export let signInButtonProps: any = defaultButtonProps
	export let signedInButtonProps: any = {}
	export let signOutButtonProps: any = defaultButtonProps
	// export let profileTable: string = ''
	// export let profileKey: string = ''
	let token = ''


  const openProfile = async () => {
		if (profileFunction) {
			profileFunction()
		}
	}
	const doSignOut = async () => {
		const { error } = await signOut()
		if (error) {
			console.error('Error signing out', error)
		} else {			
			if (onSignOut) {
				onSignOut()
			} else {
				window.location.reload()
			}
		}
	}
	const openLoginBox = async () => {
		const openLoginModalController = await modalController.create({
			component: LoginModal,
			componentProps: {
				providers: providers,
				onSignIn: onSignIn,
			},
			showBackdrop: true,
			backdropDismiss: true,
		})

		await openLoginModalController.present()
	}
</script>

{#if $currentUser}
	<div class="fullWidth">
		<ion-button
			fill={signedInButtonProps.fill || signInButtonProps.fill}
			color={signedInButtonProps.color || signInButtonProps.color}
			on:click={openProfile}
			size={signedInButtonProps.size || signInButtonProps.size}
			expand={signedInButtonProps.expand || signInButtonProps.expand}
			strong
		>
			{$currentUser?.email}
		</ion-button>
		<ion-button 
			fill={signOutButtonProps.fill}
			color={signOutButtonProps.color}
			on:click={doSignOut} 
			size={signOutButtonProps.size}
			expand={signOutButtonProps.expand}
			strong>
			{signOutButtonProps.text || "Sign Out"}
		</ion-button>
	</div>
{:else}
	<div class="fullWidth">
		<ion-button
			fill={signInButtonProps.fill}
			color={signInButtonProps.color}
			on:click={openLoginBox}
			size={signInButtonProps.size}
			expand={signInButtonProps.expand}
			strong>
			{signInButtonProps.text || "Sign In"}
		</ion-button>
	</div>
{/if}

<style>
	.fullWidth {
		width: 100%;
	}
</style>
