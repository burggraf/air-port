<script lang="ts">
	import { onMount, afterUpdate } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	export let appPages: any
	export let badges: any
	import * as allIonicIcons from 'ionicons/icons'
	import { menuController } from '@ionic/core'
	import { currentState } from '$services/state.service'

	let selectedAccordionItem = localStorage.getItem('selectedAccordionItem') || ''
	let selectedAccordion = localStorage.getItem('selectedAccordion') || ''
	let menuContent: any = []

	function clickHandler(e: any, url: string) {
		localStorage.setItem('selectedPage', url)
		document.getElementById(selectedAccordionItem)?.classList.remove('selected')
		if (e.target.id) {
			e.target.classList.add('selected')
		} else {
			e.target.parentElement.classList.add('selected')
		}
		localStorage.setItem('selectedAccordionItem', e.target.id || e.target.parentElement.id)
		localStorage.setItem(
			'selectedAccordion',
			e.target.parentElement.parentElement.parentElement.value
		)
		selectedAccordionItem = e.target.id || e.target.parentElement.id
		if ((url + '//').split('/')[1] === (window.location.pathname + '//').split('/')[1])
			window.location.href = url
		else goto(url)
		// window.location.href = url;
	}

	function renderMenuChildren(list: any) {
		const retval = list.map((appChild: any, index: number) => {
			return {
				...appChild,
				index,
			}
		})
		return retval
	}

	function renderMenuItems(list: any) {
		return list.map((appPage: any, index: number) => {
			if (appPage.children) {
				return {
					...appPage,
					index,
					children: renderMenuChildren(appPage.children),
				}
			} else {
				return {
					...appPage,
					index,
					children: renderMenuChildren([]),
				}
				// const c = [];
				// c.push(appPage);
				// return {
				//   c,
				//   index,
				//   children: [],
				// }
			}
		})
	}

	afterUpdate(() => {
		menuContent = renderMenuItems(appPages)
	})
	const setSelectedItem = (targetItem: string) => {
		let oldItem = ''
		let newItem = ''
		if ($currentState.selectedMenuItem) {
			oldItem = $currentState.selectedMenuItem
		}
		currentState.set({ selectedMenuItem: targetItem })
		newItem = targetItem
		appPages.map((appPage: any, index: number) => {
			if (appPage.children) {
				appPage.children.map((appChild: any, index: number) => {
					// looping all children here
					if (appChild.url === oldItem) {
						const el = document.getElementById(appChild.url)!
						if (el) {
							el.classList.remove('selected')
							el.style.color = 'var(--ion-color-dark)'
						}
						document
							.getElementById(appChild.url)
							?.parentElement?.parentElement?.classList.add('accordion-collapsed')
						document
							.getElementById(appChild.url)
							?.parentElement?.parentElement?.classList.remove('accordion-expanded')
					}
				})
			}
		})
		appPages.map((appPage: any, index: number) => {
			if (appPage.children) {
				appPage.children.map((appChild: any, index: number) => {
					// looping all children here
					if (appChild.url === newItem) {
						const el = document.getElementById(appChild.url)!
						if (el) {
							el.classList.remove('selected')
							el.classList.add('selected')
							el.style.color = 'var(--ion-color-primary)'
						}
						document
							.getElementById(newItem)
							?.parentElement?.parentElement?.parentElement?.classList.add('accordion-expanded')
						document
							.getElementById(newItem)
							?.parentElement?.parentElement?.parentElement?.classList.remove('accordion-collapsed')
					}
				})
			}
		})
	}
	onMount(() => {
		page.subscribe((value: any) => {
			if (value) {
				const route = value.route.id
				setTimeout(() => {
					if (route) setSelectedItem(route.substring(1))
				}, 500)
			}
		})
		menuContent = renderMenuItems(appPages)
		setTimeout(() => {
			let targetItem = $currentState.selectedMenuItem || 'welcome' // need to get startup route here
			setSelectedItem(targetItem)
		}, 500)
	})
</script>

<ion-accordion-group id="page-list" value={selectedAccordion}>
	{#each menuContent as menu (menu.index)}
		{#if menu.children && menu.children.length > 0}
			<ion-accordion value={menu.title}>
				<ion-item slot="header" id={menu.url}>
					<ion-label><strong>{menu.title}</strong></ion-label>
					{#if menu.icon.indexOf('/') > -1}
						<ion-icon slot="start" src={menu.icon} />
					{:else}
						<ion-icon slot="start" icon={allIonicIcons[menu.icon]} />
					{/if}
				</ion-item>
				<ion-list slot="content" class="appPageChildList">
					{#each menu.children as child (child.index)}
						<ion-menu-toggle>
							<ion-item
								id={child.url}
								on:click={(e) => {
									clickHandler(e, '/' + child.url)
								}}
								lines="none"
								detail={false}
								class="appPageChildItem"
								disabled={child.disabled}
							>
								<ion-icon slot="start" ios="" md="" />
								<ion-badge color="danger">
									{badges[child.url] && badges[child.url] > 0 ? badges[child.url] : ''}
								</ion-badge>
								&nbsp;&nbsp;
								<ion-label><strong>{child.title}</strong></ion-label>
							</ion-item>
						</ion-menu-toggle>
					{/each}
				</ion-list>
			</ion-accordion>
		{:else}
			<ion-menu-toggle>
          <ion-item
            id={menu.url}
            on:click={(e) => {
              clickHandler(e, '/' + menu.url)
            }}
            lines="none"
            detail={false}
            class="appPageChildItem"
            disabled={menu.disabled}
          >
          <ion-icon slot="start" icon={allIonicIcons[menu.icon]} />
            <ion-badge color="danger">
              {badges[menu.url] && badges[menu.url] > 0 ? badges[menu.url] : ''}
            </ion-badge>
            &nbsp;&nbsp;
            <ion-label><strong>{menu.title}</strong></ion-label>
          </ion-item>
        </ion-menu-toggle>
		{/if}
	{/each}
</ion-accordion-group>

<style>
	.main-menu .menu-logo {
		display: block;
		width: 100%;
		max-width: 300px;
		margin: 24px auto 44px auto;
	}

	.appPageChildItem {
		padding: 0 !important;
		cursor: pointer;
	}
	.appPageChildList {
		padding: 0 !important;
	}
	ion-menu ion-content {
		--background: var(--ion-item-background, var(--ion-background-color, #fff));
	}

	ion-menu.md ion-content {
		--padding-start: 8px;
		--padding-end: 8px;
		--padding-top: 20px;
		--padding-bottom: 20px;
	}

	ion-menu.md ion-list {
		padding: 20px 0;
	}

	ion-menu.md ion-note {
		margin-bottom: 30px;
	}

	ion-menu.md ion-list-header,
	ion-menu.md ion-note {
		padding-left: 10px;
	}

	ion-menu.md ion-list#inbox-list {
		border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
	}

	ion-menu.md ion-list#inbox-list ion-list-header {
		font-size: 22px;
		font-weight: 600;
		min-height: 20px;
	}

	ion-menu.md ion-list#labels-list ion-list-header {
		font-size: 16px;
		margin-bottom: 18px;
		color: #757575;
		min-height: 26px;
	}

	ion-menu.md ion-item {
		--padding-start: 10px;
		--padding-end: 10px;
		border-radius: 4px;
	}

	/* selected menu item here */
	ion-item.selected {
		/* --background: rgba(var(--ion-color-primary-rgb), 0.14); */
		--background: red !important;
		color: var(--ion-color-primary) !important;
		--color: var(--ion-color-primary) !important;

		--border-color: green;
		--border-style: dashed;
		--border-width: 2px;
	}

	ion-menu.md ion-item.selected {
		--background: rgba(var(--ion-color-primary-rgb), 0.14);
	}

	ion-menu.md ion-item.selected ion-icon {
		color: var(--ion-color-primary);
	}

	ion-menu.md ion-item ion-icon {
		color: #616e7e;
	}

	ion-menu.md ion-item ion-label {
		font-weight: 500;
	}

	ion-menu.ios ion-content {
		--padding-bottom: 20px;
	}

	ion-menu.ios ion-list {
		padding: 20px 0 0 0;
	}

	ion-menu.ios ion-note {
		line-height: 24px;
		margin-bottom: 20px;
	}

	ion-menu.ios ion-item {
		--padding-start: 16px;
		--padding-end: 16px;
		--min-height: 50px;
	}

	ion-menu.ios ion-item ion-icon {
		font-size: 24px;
		color: #73849a;
	}

	ion-menu.ios ion-item .selected ion-icon {
		color: var(--ion-color-primary);
	}

	ion-menu.ios ion-list#labels-list ion-list-header {
		margin-bottom: 8px;
	}

	ion-menu.ios ion-list-header,
	ion-menu.ios ion-note {
		padding-left: 16px;
		padding-right: 16px;
	}

	ion-menu.ios ion-note {
		margin-bottom: 8px;
	}

	ion-note {
		display: inline-block;
		font-size: 16px;
		color: var(--ion-color-medium-shade);
	}
</style>
