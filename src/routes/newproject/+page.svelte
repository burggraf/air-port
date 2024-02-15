<script lang="ts">
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
	import { checkDomainAvailability } from '$services/project-utils.service'
	import { dropdownmenu } from '$components/DropdownMenu'
	import { loadingBox } from '$services/loadingMessage'
	import { getRegionName, regions } from '$services/region.service'
	import { showConfirm } from '$services/alert.service'
	// import type { Project, ProjectInstance, Site, Key, ProjectInstanceKey } from '$models/interfaces'
	interface IObjectKeys {
		[key: string]: any // Adjust the type according to your needs
	}
	interface Project extends IObjectKeys {
		id: string
		name: string
		domain: string
		fqd: string
		owner: string
		metadata?: any
		type?: string
		created?: string
		updated?: string
	}
	interface ProjectInstance extends IObjectKeys {
		project_id: string
		type: string
		status: string
		metadata?: any
		region: string
		machine_id?: string
		ipv6?: string
		owner: string
		created?: string
		updated?: string
	}

	const project: Project = {
		id: '',
		domain: wordSlug(3),
		fqd: '',
		name: '',
		owner: $currentUser?.id,
		type: 'production',
		metadata: {},
	}
	let project_instance: ProjectInstance = {
		project_id: '',
		type: 'primary',
		status: '',
		metadata: {},
		region: '',
		machine_id: '',
		ipv6: '',
		owner: $currentUser?.id,
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
	}
	const save = async () => {
		const domainAvailable = await checkDomainAvailability(project.domain)
		if (project.name.trim().length === 0) {
			toast('Project name is required', 'danger')
			return
		}
		if (!project.domain) {
			toast('Project domain is required', 'danger')
			return
		}
		if (!domainAvailable) {
			toast('Domain is not available', 'danger')
			return
		}
		if (!project_instance.region) {
			toast('Select a region', 'danger')
		}
		const loader = await loadingBox('Creating new project...')
		const { data, error } = await pb.send('/createproject', {
			method: 'POST',
			body: {
				project,
				project_instance,
			},
		})
		loader.dismiss()
		if (error) {
			toast(error, 'danger')
		} else {
			await showConfirm({
			header: `Project successfully launched!  See: https://${project.domain}.fly.dev/_/`,
			message: `View  admin page?`,
			okHandler: async () => {
				window.open(`https://${project.domain}.fly.dev/_/`, '_blank')
			},
		})
			// open the project in a new windows
			// goto(`/instance/${data}`)
		}
	}
	const back = async () => {
		goto('/projects')
	}
	$: domainAvailable = true
	const refreshSlug = () => {
		project.domain = wordSlug(3)
	}

	const handleChange = async (event: any) => {
		const field = event.target.id
		const value = event.target.value || ''
		// if field is domain, strip out anything other than a-z 0-9 and -
		if (field === 'domain') {
			project[field] = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
			domainAvailable = await checkDomainAvailability(project.domain)
			project_instance.domain = value
			if (!project_instance.metadata) project_instance.metadata = {}
			project_instance.metadata.fqd = `${project.domain}.azabab.com`
		} else if (field === 'name' && project?.id !== '') {
			project[field] = value
			try {
				const result = await pb.collection('projects').update(project?.id, { name: value })
			} catch (err) {
				console.error('error updating project name', err)
			}
		} else {
			project[field] = value
		}
	}
	const chooseRegion = async (e: any) => {
		let items = []
		for (let i = 0; i < regions.length; i++) {
			const region = regions[i]
			items.push({
				text: region.name,
				icon: allIonicIcons.globeOutline,
				color: 'primary',
				textcolor: 'primary',
				handler: async () => {
					project_instance.region = region.code
				},
			})
		}
		const result = await dropdownmenu(e, items)
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
			<ion-title>New Project</ion-title>
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
					<ion-label>Project Name</ion-label>
				</ion-col>
			</ion-row>
			<ion-row>
				<ion-col>
					<ion-item class="GridItem" lines="none">
						<ion-input
							on:ionInput={handleChange}
							class="loginInputBoxWithIcon"
							type="text"
							id="name"
							placeholder="Project Name"
							style="--padding-start: 10px;"
							value={project.name}
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
							id="domain"
							placeholder="domain"
							style="--padding-start: 10px;"
							value={project.domain}
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
							value={project_instance.metadata?.fqd}
							debounce={500}
						/>
					</ion-item>
				</ion-col>
			</ion-row>

			{#if project?.id === '' && project?.domain.trim().length > 0}
				<ion-row>
					<ion-col>
						<ion-label color={domainAvailable ? 'success' : 'danger'} style="padding-left: 20px;">
							{domainAvailable ? `${project.domain} is available` : `Domain is not available`}
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
					<ion-button size="small" color="secondary" expand="block" on:click={chooseRegion}
						>{getRegionName(project_instance.region) || 'Select region'}</ion-button
					>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-label>Project Type</ion-label>
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
							value={project.type}
							debounce={500}
						/>
					</ion-item>
				</ion-col>
			</ion-row>

			<ion-row>
				<ion-col>
					<ion-button
						size="default"
						disabled={project.name.trim().length === 0 ||
							!project.domain ||
							!project_instance.region}
						expand="block"
						on:click={save}>Save New Project</ion-button
					>
				</ion-col>
			</ion-row>
		</ion-grid>
	</ion-content>
</IonPage>
