import * as allIonicIcons from 'ionicons/icons'
import { dropdownmenu } from '$components/DropdownMenu'

export const regions = [{"code": "ams", "name": "Amsterdam, Netherlands"},
{"code": "iad", "name": "Ashburn, Virginia (US)"},
{"code": "atl", "name": "Atlanta, Georgia (US)"},
{"code": "bog", "name": "Bogotá, Colombia"},
{"code": "bos", "name": "Boston, Massachusetts (US)"},
{"code": "otp", "name": "Bucharest, Romania"},
{"code": "ord", "name": "Chicago, Illinois (US)"},
{"code": "dfw", "name": "Dallas, Texas (US)"},
{"code": "den", "name": "Denver, Colorado (US)"},
{"code": "eze", "name": "Ezeiza, Argentina"},
{"code": "fra", "name": "Frankfurt, Germany"},
{"code": "gdl", "name": "Guadalajara, Mexico"},
{"code": "hkg", "name": "Hong Kong, Hong Kong"},
{"code": "jnb", "name": "Johannesburg, South Africa"},
{"code": "lhr", "name": "London, United Kingdom"},
{"code": "lax", "name": "Los Angeles, California (US)"},
{"code": "mad", "name": "Madrid, Spain"},
{"code": "mia", "name": "Miami, Florida (US)"},
{"code": "yul", "name": "Montreal, Canada"},
{"code": "bom", "name": "Mumbai, India"},
{"code": "cdg", "name": "Paris, France"},
{"code": "phx", "name": "Phoenix, Arizona (US)"},
{"code": "qro", "name": "Querétaro, Mexico"},
{"code": "gig", "name": "Rio de Janeiro, Brazil"},
{"code": "sjc", "name": "San Jose, California (US)"},
{"code": "scl", "name": "Santiago, Chile"},
{"code": "gru", "name": "Sao Paulo, Brazil"},
{"code": "sea", "name": "Seattle, Washington (US)"},
{"code": "ewr", "name": "Secaucus, NJ (US)"},
{"code": "sin", "name": "Singapore, Singapore"},
{"code": "arn", "name": "Stockholm, Sweden"},
{"code": "syd", "name": "Sydney, Australia"},
{"code": "nrt", "name": "Tokyo, Japan"},
{"code": "yyz", "name": "Toronto, Canada"},
{"code": "waw", "name": "Warsaw, Poland"}
]
export const getRegionName = (code: string) => {
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
