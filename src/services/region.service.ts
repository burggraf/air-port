import * as allIonicIcons from 'ionicons/icons'
import { dropdownmenu } from '$components/DropdownMenu'

export const regions = [
    {"code": "ams", "name": "Amsterdam, Netherlands", "latitude": 52.3676, "longitude": 4.9041},
    {"code": "iad", "name": "Ashburn, Virginia (US)", "latitude": 39.0437, "longitude": -77.4875},
    {"code": "atl", "name": "Atlanta, Georgia (US)", "latitude": 33.7490, "longitude": -84.3880},
    {"code": "bog", "name": "Bogotá, Colombia", "latitude": 4.7110, "longitude": -74.0721},
    {"code": "bos", "name": "Boston, Massachusetts (US)", "latitude": 42.3601, "longitude": -71.0589},
    {"code": "otp", "name": "Bucharest, Romania", "latitude": 44.4268, "longitude": 26.1025},
    {"code": "ord", "name": "Chicago, Illinois (US)", "latitude": 41.8781, "longitude": -87.6298},
    {"code": "dfw", "name": "Dallas, Texas (US)", "latitude": 32.7767, "longitude": -96.7970},
    {"code": "den", "name": "Denver, Colorado (US)", "latitude": 39.7392, "longitude": -104.9903},
    {"code": "eze", "name": "Ezeiza, Argentina", "latitude": -34.8222, "longitude": -58.5358},
    {"code": "fra", "name": "Frankfurt, Germany", "latitude": 50.1109, "longitude": 8.6821},
    {"code": "gdl", "name": "Guadalajara, Mexico", "latitude": 20.6597, "longitude": -103.3496},
    {"code": "hkg", "name": "Hong Kong, Hong Kong", "latitude": 22.3193, "longitude": 114.1694},
    {"code": "jnb", "name": "Johannesburg, South Africa", "latitude": -26.2041, "longitude": 28.0473},
    {"code": "lhr", "name": "London, United Kingdom", "latitude": 51.5074, "longitude": -0.1278},
    {"code": "lax", "name": "Los Angeles, California (US)", "latitude": 34.0522, "longitude": -118.2437},
    {"code": "mad", "name": "Madrid, Spain", "latitude": 40.4168, "longitude": -3.7038},
    {"code": "mia", "name": "Miami, Florida (US)", "latitude": 25.7617, "longitude": -80.1918},
    {"code": "yul", "name": "Montreal, Canada", "latitude": 45.5017, "longitude": -73.5673},
    {"code": "bom", "name": "Mumbai, India", "latitude": 19.0760, "longitude": 72.8777},
    {"code": "cdg", "name": "Paris, France", "latitude": 48.8566, "longitude": 2.3522},
    {"code": "phx", "name": "Phoenix, Arizona (US)", "latitude": 33.4484, "longitude": -112.0740},
    {"code": "qro", "name": "Querétaro, Mexico", "latitude": 20.5888, "longitude": -100.3899},
    {"code": "gig", "name": "Rio de Janeiro, Brazil", "latitude": -22.9068, "longitude": -43.1729},
    {"code": "sjc", "name": "San Jose, California (US)", "latitude": 37.3382, "longitude": -121.8863},
    {"code": "scl", "name": "Santiago, Chile", "latitude": -33.4489, "longitude": -70.6693},
    {"code": "gru", "name": "Sao Paulo, Brazil", "latitude": -23.5505, "longitude": -46.6333},
    {"code": "sea", "name": "Seattle, Washington (US)", "latitude": 47.6062, "longitude": -122.3321},
    {"code": "ewr", "name": "Secaucus, NJ (US)", "latitude": 40.7895, "longitude": -74.0565},
    {"code": "sin", "name": "Singapore, Singapore", "latitude": 1.3521, "longitude": 103.8198},
    {"code": "arn", "name": "Stockholm, Sweden", "latitude": 59.3293, "longitude": 18.0686},
    {"code": "syd", "name": "Sydney, Australia", "latitude": -33.8688, "longitude": 151.2093},
    {"code": "nrt", "name": "Tokyo, Japan", "latitude": 35.6895, "longitude": 139.6917},
    {"code": "yyz", "name": "Toronto, Canada", "latitude": 43.6532, "longitude": -79.3832},
    {"code": "waw", "name": "Warsaw, Poland", "latitude": 52.2297, "longitude": 21.0122}
  ];export const getRegionName = (code: string) => {
    const region = regions.find(r => r.code === code);
    return region ? region.name : code;
}

export const chooseRegion = async (e: any) => {
    let items = []
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i]
        items.push({
            text: region.name,
            code: region.code,
            icon: allIonicIcons.globeOutline,
            color: 'primary',
            textcolor: 'primary',
            handler: async () => {
                return region
            },
        })
    }
    const result = await dropdownmenu(e, items)
    console.log('**** result', result)
    return result.code;
}
