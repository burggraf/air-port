<script lang="ts">
	// import { onMount } from 'svelte'
	// import TableColumnSort from './TableColumnSort.svelte';
	// import './TableGrid.css';
	import * as allIonicIcons from 'ionicons/icons'

	export let rows: any = []
	export let setRows: any = null
	export let headers: any = []
	export let rowClick: any = null
	export let sort: any = null
	export let headerStyle = {}
	export let rowStyle = {}
	export let changeCheckboxesCallback: any = null
	export let maxColumnWidth = 400

	let currentSort = {
		orderBy: sort?.orderBy || '',
		ascending: sort?.ascending || true,
	}
	let initialized = false
	let checksObj: any = {}
	let checkedKeys: any = []

	onMount(() => {
		if (sort) {
			changeSortCallbackLocal(sort)
		}
	})

	if (!initialized) {
		initialized = true
		rows.forEach((row: any) => {
			Object.keys(row).forEach((key) => {
				if (row[key]?.TYPE === 'CHECKBOX' && (row[key].checked || row[key].value)) {
					checkedKeys.push(row[key].id)
					checksObj[row[key].id] = true
				}
			})
		})
	}

	function changeSortCallbackLocal(sort: any) {
		const newRows = [...rows]
		newRows.sort((a, b) => {
			const y =
				typeof a[sort.orderBy]?.sort !== 'undefined'
					? a[sort.orderBy]?.sort || ''
					: a[sort.orderBy] || ''
			const z =
				typeof b[sort.orderBy]?.sort !== 'undefined'
					? b[sort.orderBy]?.sort || ''
					: b[sort.orderBy] || ''
			if (y < z) {
				return sort.ascending ? -1 : 1
			}
			if (y > z) {
				return sort.ascending ? 1 : -1
			}
			return 0
		})
		if (setRows) {
			setRows(newRows)
		}
		currentSort = sort
	}


</script>

<div>
	<div class="scroll-y">
		<div class="scroll-x">
			<div class="content-container">
				<table>
					<tbody>
						{#if rows.length > 0}
							<tr>
								{#each Object.keys(rows[0]) as keyname, index}
									{#if !keyname.startsWith('$')}
										<td
											style="max-width: {maxColumnWidth}; vertical-align: bottom; {headerStyle}"
											class="breakItUp TableGrid-header"
										>
											{rows[0][keyname]?.TYPE === 'IMAGE' || rows[0][keyname]?.TYPE === 'CHECKBOX'
												? headers
													? headers[index] || ''
													: ''
												: ''}
											{rows[0][keyname]?.TYPE !== 'IMAGE' && rows[0][keyname]?.TYPE !== 'CHECKBOX'
												? headers
													? headers[index] || ''
													: keyname.replace(/\^$/, '')
												: ''}
											{#if keyname.endsWith('^') || (rows[0][keyname]?.TYPE === 'CUSTOM' && rows[0][keyname]?.sort)}
												<!--<TableColumnSort
							sort={currentSort}
							columnName={keyname}
							on:sortChanged={changeSortCallbackLocal}
						  />-->
											{/if}
										</td>
									{/if}
								{/each}
							</tr>
							{#each rows as row, rowIndex}
								<tr on:click={() => (rowClick ? rowClick(row, rowIndex) : {})}>
									{#each Object.keys(row) as key}
										{#if !key.startsWith('$')}
											{#if typeof row[key] !== 'object'}
												<td
													style="max-width: {maxColumnWidth}; {rowStyle}; {row[key]?.cellStyle}"
													class="breakItUp TableGrid-row {row[key]?.cellClass}"
												>
													{row[key]}
												</td>
											{:else if row[key] !== null && typeof row[key] === 'object' && row[key]?.TYPE}
												{#if row[key]?.TYPE === 'CUSTOM'}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}; {row[key]?.cellStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														{#if typeof row[key].html === 'string'}
															<div>{@html row[key].html}</div>
														{:else}
															<div>{row[key].html}</div>
														{/if}
													</td>
												{:else if row[key]?.TYPE === 'IMAGE'}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}; {row[key]?.cellStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														<img
															src={row[key].url}
															alt={row[key].alt || ''}
															style={row[key].itemStyle}
														/>
													</td>
												{:else if row[key]?.TYPE === 'ICON'}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}; {row[key]?.cellStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														<ion-icon
															icon={allIonicIcons[row[key].icon]}
															style={row[key].itemStyle}
															size={row[key].size || 'normal'}
														/>
													</td>
												{:else if row[key]?.TYPE === 'CHECKBOX'}
													<td
														style="max-width: {maxColumnWidth}; text-align: center; padding-left: 15px; padding-right: 15px; {rowStyle}; {row[
															key
														]?.cellStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
														on:click|stopPropagation={function () {}}
													>
														<ion-checkbox
															mode="ios"
															checked={checksObj[row[key].id]}
															on:ionChange={(e) => {
																if (e.detail.checked) {
																	checkedKeys.push(row[key].id)
																	checksObj[row[key].id] = true
																} else {
																	checkedKeys = checkedKeys.filter((ck) => ck !== row[key].id)
																	checksObj[row[key].id] = false
																}
																if (typeof changeCheckboxesCallback === 'function') {
																	changeCheckboxesCallback(checkedKeys)
																}
															}}
														/>
													</td>
												{:else if row[key]?.TYPE === 'LINK'}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														<a href={row[key].URL} target="_blank">
															{row[key].TEXT}
														</a>
													</td>
												{:else if row[key]?.TYPE === 'LINK_BUTTON'}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														<a
															href={row[key].URL}
															target="_blank"
															class="TableGrid-linkButton {row[key]?.cellClass}"
														>
															{row[key].TEXT}
														</a>
													</td>
												{:else}
													<td
														style="max-width: {maxColumnWidth}; {rowStyle}; {row[key]?.cellStyle}"
														class="breakItUp TableGrid-row {row[key]?.cellClass}"
													>
														{JSON.stringify(row[key])}
													</td>
												{/if}
											{/if}
										{/if}
									{/each}
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style>
	.breakItUp {
		/* These are technically the same, but use both */
		overflow-wrap: break-word;
		word-wrap: break-word;

		-ms-word-break: break-all;
		/* This is the dangerous one in WebKit, as it breaks things wherever */
		word-break: break-all;
		/* Instead use this non-standard one: */
		word-break: break-word;

		/* Adds a hyphen where the word breaks, if supported (No Blink) */
		-ms-hyphens: auto;
		-moz-hyphens: auto;
		-webkit-hyphens: auto;
		hyphens: auto;
	}
	.TableGrid-header {
		font-weight: bold;
		padding: 5px;
	}
	.TableGrid-row {
		border: 1px solid;
		padding: 5px;
	}
	.scroll-y {
		/* position: absolute; */
		overflow-x: hidden;
		overflow-y: auto;
		width: 100%;
		height: 100%;
		min-width: 100%;
		min-height: 100%;
	}

	.scroll-x {
		overflow-y: hidden;
		overflow-x: auto;
		width: auto;
		min-width: 100%;
		min-height: 100%;
	}

	.content-container {
		min-width: 100%;
		min-height: 100%;
		width: max-content;
		margin-right: 30px;
		display: inline-block;
	}
</style>
