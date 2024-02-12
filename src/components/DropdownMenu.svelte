<script lang="ts">
	import { popoverController } from '$ionic/svelte'
	// import { toast } from '$services/toast'
	// import { loadingBox } from '$services/loadingMessage'
	// import * as allIonicIcons from 'ionicons/icons'

	// export let applyDisplaySettings: Function = () => {};
    export let items: any = <any>[];
    
        //console.log('items', items)
	const closeOverlay = (x?: any) => {
		popoverController.dismiss(x)
	}
</script>
<ion-list>
{#each items as item}
    <ion-item
        lines="full"
        on:click={async () => {   
			if (!item.disabled) {
				if (item.handler) await item.handler();
	            closeOverlay(item)
			}
        }}
    >
		{#if item.icon}
        <ion-icon slot="start" icon={item.icon} color={item.color}></ion-icon>
		{/if}
		{#if item.iconSrc}
        <ion-icon slot="start" src={item.iconSrc} color={item.color}></ion-icon>
		{/if}
        <ion-label color={item.textcolor}>{item.text}</ion-label>
    </ion-item>
{/each}
</ion-list>


<style>
    ion-item {
        cursor: pointer;
    }
	ion-button {
		width: 60px;
	}
	/* div :global(.popover-viewport) {
    --width: 500px;
  } */
	.LoginGrid {
		max-width: 375px;
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

	.loginItem {
		--padding-start: 0px;
		--padding-end: 0px;
		--inner-padding-end: 0px;
	}
	.loginInputBoxWithIcon {
		height: 50px;
		border: 1px solid rgb(212, 212, 212);
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
