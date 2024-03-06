<script lang="ts">
	const versions: string[] = ['0.22.2','0.22.1','0.22.0', '0.21.3', '0.21.2', '0.21.1', '0.21.0']
	import '$styles/grid-styles.css'
	//@ts-ignore
	import * as wordSlug from 'word-slug'
	import IonPage from '$ionpage'
	import { page } from '$app/stores'
	import * as allIonicIcons from 'ionicons/icons'
	import {
		arrowBackOutline,
		checkmarkCircleOutline,
		closeCircleOutline,
		globeOutline,
		refreshOutline,
	} from 'ionicons/icons'
	import { currentUser, pb } from '$services/backend.service'
	import { goto } from '$app/navigation'
	import { toast } from '$services/toast'
	import { onMount } from 'svelte'
	import { checkDomainAvailability } from '$services/app-utils.service'
	import { dropdownmenu } from '$components/DropdownMenu'
	import { loadingBox } from '$services/loadingMessage'
	import { getRegionName, regions } from '$services/region.service'
	import { showConfirm } from '$services/alert.service'
	import type { AppsRecord } from '$models/pocketbase-types'
	import { chooseRegion } from '$services/region.service'
	import { set } from 'ol/transform'

	let primary_region = "";
	let pb_version = versions[0]
	const app: AppsRecord = {
		AppURL: "",
		Deployed: false,
		Domain: "",
		Hostname: "",
		Name: "",
		PlatformVersion: "",
		Status: "",
		Version: "",
		title: "",
		type: "",
		userid: $currentUser.id,		
	}
	onMount(async () => {
		const tb: any = document.getElementById('ion-tabs')
		let initTab: string
		setTimeout(() => {
			if (tb) tb.select(initTab || 'settings')
		}, 100)
	})
	const ionViewWillEnter = async () => {
		if (!$currentUser) {
			goto('/')
		}
		refreshSlug();
	}
	const save = async () => {
		const domainAvailable = await checkDomainAvailability(app.Domain || "")
		console.log('domainAvailable', domainAvailable)
		if (!app.title || app?.title?.trim().length === 0) {
			toast('App title is required', 'danger')
			return
		}
		if (!app.Domain) {
			toast('App domain is required', 'danger')
			return
		}
		if (!domainAvailable) {
			toast('Domain is not available', 'danger')
			return
		}
		if (!primary_region) {
			toast('Select a region', 'danger')
		}
		const loader = await loadingBox('Creating new app...')
		console.log('app', app)
		console.log('primary_region', primary_region)
		const { data, error } = await pb.send(`/create-app/${pb_version}`, {
			method: 'POST',
			body: {
				app,
				primary_region
			},
		})
		loader.dismiss()
		if (error) {
			if (error === "Error creating app") {
				toast('Subdomain not available -- try another', 'danger')
			} else {
				toast(error, 'danger')
			}
		} else {
			await showConfirm({
				header: `App successfully launched!  See: https://${app.Domain}.fly.dev/_/`,
				message: `View admin page?`,
				okHandler: async () => {
					window.open(`https://${app.Domain}.fly.dev/_/`, '_blank')
				},
			})
			goto(`/app/${app.Domain}`)
		}
	}
	const back = async () => {
		goto('/apps')
	}
	$: domainAvailable = true
	const refreshSlug = async () => {
		app.Domain = wordSlug(3)
		domainAvailable = await checkDomainAvailability(app.Domain || "")
		console.log('***-> domainAvailable', domainAvailable)
	}

	const handleChange = async (event: any) => {
		const field = event.target.id
		const value = event.target.value || ''
		// if field is domain, strip out anything other than a-z 0-9 and -
		if (field === 'Domain') {
			app[field] = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
			domainAvailable = await checkDomainAvailability(app.Domain || "")
			console.log('*** domainAvailable', domainAvailable)
		} else {
			app[field] = value
		}
	}
	const selectRegion = async (e: any) => {
		const result: any = await chooseRegion(e)
		if (result) {
			primary_region = result
		}
	}
	const chooseVersion = async (e: any) => {
		let items = []
		for (let i = 0; i < versions.length; i++) {
			const version = versions[i]
			items.push({
				text: version,
				iconSrc: '/pb.svg', //allIonicIcons.ellipseOutline,
				color: 'primary',
				textcolor: 'dark',
				handler: async () => {},
			})
		}
		const result = await dropdownmenu(e, items)
		console.log('chooseVersion result', result)
		if (result?.text) {
			pb_version = result.text
		}
	}
</script>

<IonPage {ionViewWillEnter}>
	<ion-header>
		<ion-toolbar color="secondary">
			<ion-buttons slot="start">
				<ion-button on:click={back}>
					<ion-icon slot="icon-only" icon={arrowBackOutline} />
				</ion-button>
			</ion-buttons>
			<ion-title>New App</ion-title>
			<!-- <ion-buttons slot="end">
					<ion-button on:click={save}>
						<ion-icon slot="icon-only" icon={checkmarkOutline} />
					</ion-button>
			</ion-buttons> -->
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		<ion-grid class="ion-padding Grid">
			<ion-row>
				<ion-col>
					<ion-label>App Title</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="title"
							placeholder="App Title"
							style="--padding-start: 10px;"
							value={app.title}
							debounce={500}
						/>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>Subdomain</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="Domain"
							placeholder="domain"
							style="--padding-start: 10px;"
							value={app.Domain}
							debounce={500}
						><ion-button 
							style="margin-right: 10px;" 
							fill="clear"
							on:click={refreshSlug}
							slot="end">
							<ion-icon 
							size="large" 
							slot="icon-only" 
							icon={refreshOutline} 
						/>
						</ion-button>
					</ion-input>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>Full Domain</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							disabled={true}
							class="loginInputBoxWithIcon"
							type="text"
							id="fqd"
							placeholder="Full Domain"
							style="--padding-start: 10px;"
							value={""}
							debounce={500}
						/>
					</ion-item>
				</ion-col>
			</ion-row>

			{#if app.Domain && app.Domain.trim().length > 0}
				<ion-row>
					<ion-col>
						<ion-label color={domainAvailable ? 'success' : 'danger'} style="padding-left: 20px;">
							{domainAvailable ? `${app.Domain} is available` : `Domain is not available`}
							<ion-icon
								color={domainAvailable ? 'success' : 'danger'}
								icon={domainAvailable ? checkmarkCircleOutline : closeCircleOutline}
								style=""
							/>
						</ion-label>
					</ion-col>
				</ion-row>
			{/if}
			<!-- <ion-row style="padding-top: 20px;">
                <ion-col
                    class="ion-text-center"
                    style="width: 100%;border: 1px solid;background-color: var(--ion-color-dark);"
                >
                    <ion-label color="light"><b>Instances</b></ion-label>
                </ion-col>
            </ion-row> -->
			<ion-row>
				<ion-col>
					<ion-button size="small" color="secondary" expand="block" on:click={selectRegion}
						>{getRegionName(primary_region) || 'Select region'}</ion-button
					>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>App Type</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="type"
							placeholder="production"
							style="--padding-start: 10px;"
							value={app.type}
							debounce={500}
						/>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-item>
						<ion-label slot="start">Pocketbase Version</ion-label>
						<ion-button slot="end" size="small" expand="block" fill="solid" on:click={chooseVersion}
							>&nbsp;&nbsp;&nbsp;{pb_version}&nbsp;&nbsp;&nbsp;
						</ion-button>
					</ion-item>
				</ion-col>
			</ion-row>


			<ion-row>
				<ion-col>
					<ion-button
						size="default"
						disabled={app?.title?.trim().length === 0 ||
							!app.title ||
							!app.Domain ||
							!primary_region}
						expand="block"
						on:click={save}>Save New App</ion-button
					>
				</ion-col>
			</ion-row>
		</ion-grid>
	</ion-content>
</IonPage>
