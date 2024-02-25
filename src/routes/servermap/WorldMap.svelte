<script lang="ts">
	import { Map, View } from 'ol'
	// import { Text, Fill } from 'ol/style'; // Import the Text class from ol/style
	import TileLayer from 'ol/layer/Tile'
	import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style'
	import { Overlay } from 'ol'
	import Feature from 'ol/Feature'
	import Point from 'ol/geom/Point'
	import { fromLonLat } from 'ol/proj'
	import OSM from 'ol/source/OSM'
	import { Vector as VectorLayer } from 'ol/layer'
	import { Vector as VectorSource } from 'ol/source'
	import { regions as cities } from '$services/region.service'

	import IonPage from '$ionpage'
	// import { add } from 'ol/coordinate'
	import { pb, currentUser } from '$services/backend.service'
	let map: any
	let vectorSource: any // Declare vectorSource in the outer scope
	// Function to initialize the map
	async function initializeMap() {
		// await loadCities()
		console.log('cities', cities)
		const mapElement = document.getElementById('map')
		if (!mapElement) {
			return
		}
		const osmLayer = new TileLayer({
			source: new OSM(),
		})

		vectorSource = new VectorSource() // Initialize vectorSource

		// Create a vector layer to include the vector source
		const vectorLayer = new VectorLayer({
			source: vectorSource,
		})
		map = new Map({
			target: mapElement,
			layers: [osmLayer, vectorLayer],
			view: new View({
				center: [0, 0], // Center of the map
				zoom: 1, // Initial zoom level
			}),
		})
		map.addOverlay(tooltipOverlay)

		// Update the tooltip on pointer move
		map.on('pointermove', (evt: any) => {
			if (map.hasFeatureAtPixel(evt.pixel)) {
				const feature = map.getFeaturesAtPixel(evt.pixel)[0]
				tooltipOverlay.setPosition(evt.coordinate)
				tooltipElement.innerHTML = feature.get('name')
				tooltipElement.style.display = ''
			} else {
				tooltipElement.style.display = 'none'
			}
		})
		map.on('pointermove', function (evt: any) {
			if (map.hasFeatureAtPixel(evt.pixel)) {
				const feature = map.getFeaturesAtPixel(evt.pixel)[0]
				const cityName = feature.get('name')
				// Now you can use cityName to display a tooltip
				// For example, you could display cityName in a DOM element that serves as a tooltip
			}
		})
		map.on('click', async function (evt: any) {
			const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature: any) {
				return feature
			})
			if (feature) {
				// A feature was clicked, you can now do something with it
				const cityName = feature.get('name')
				const cityCode = feature.get('cityCode').substring(0,3)
				console.log('City clicked:', cityName, cityCode)
				const servers = await pb.collection('sites').getFullList({
					filter: `code~"${cityCode}"`,
					//fields: 'metadata, code',
					sort: 'name',
				})
				console.log('servers', servers)
				const detailElement = document.getElementById('detail')
				if (detailElement) {
					detailElement.innerHTML = ''
					for (const server of servers) {
						const serverElement = document.createElement('div')
						serverElement.innerHTML = `
							<h3>${server.name}</h3>
							Code: ${server.code}<br/>
							Domain: ${server.domain}<br/>
							Active: ${server.active}<br/>
							Region: ${server.region}<br/>
							City: ${JSON.stringify(server.metadata?.city)}<br/>
							Type: ${server.server_type}<br/>
						`						
						detailElement.appendChild(serverElement)
					}
				}
			}
		})
		// Transform your coordinates from EPSG:4326 to EPSG:3857
		// Gibraltar: 36.14474 and -5.35257 
		const coordinates = fromLonLat([-5.35257, 36.14474]);

		// Set the center of the map view
		map.getView().setCenter(coordinates);
	}
	// Add cities as dots on the map
	function addCity(latitude: number, longitude: number, cityName: string, cityCode: string) {
		console.log('addCity', latitude, longitude, cityName)
		const cityFeature = new Feature({
			geometry: new Point(fromLonLat([longitude, latitude])),
		})

		cityFeature.setStyle(
			new Style({
				image: new CircleStyle({
					radius: 8, // Adjust the radius as needed
					fill: new Fill({
						color: '#00ff00', // green fill color
					}),
					stroke: new Stroke({
						color: '#000000', // black stroke color
						width: 1, // Adjust stroke width as needed
					}),
				}),
			})
		)
		cityFeature.set('name', cityName)
		cityFeature.set('cityCode', cityCode)

		vectorSource.addFeature(cityFeature)
	}
	// Create a tooltip element
	const tooltipElement = document.createElement('div')
	tooltipElement.className = 'tooltip' // Make sure to define this class in your CSS

	// Create an overlay for the tooltip
	const tooltipOverlay = new Overlay({
		element: tooltipElement,
		positioning: 'bottom-center',
		offset: [0, -10],
		stopEvent: false,
	})

	const ionViewDidEnter = async () => {
		console.log('ionViewDidEnter')
		await initializeMap()
		for (const city of cities) {
			if (city?.latitude && city?.longitude) {
				addCity(
					city.latitude,
					city.longitude,
					city?.name || '',
					city.code || ''
				)
			}
		}
		// const { data, error } = await pb.send('/get-environment',{"method":"GET"})
		// console.log('enviroment:', data)
	}
	// Call this function for each city you want to add
	// Example: addCity(12.4964, 41.9028); // Coordinates for Rome, Italy
</script>

<!-- <svelte:window on:load={initializeMap} /> -->

<IonPage {ionViewDidEnter}>

	<ion-content>
		<div id="map" class="map" />
		<div id="detail" class="ion-padding"></div>	
	</ion-content>
</IonPage>

<style>
	.map {
		width: 100%;
		height: 80%;/*600px;*/
	}
	/* ol-attribution ol-unselectable ol-control ol-uncollapsible */
</style>
