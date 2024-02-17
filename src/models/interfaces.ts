export interface IObjectKeys {
    [key: string]: string | number | object | undefined
}

export interface App extends IObjectKeys {
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
export interface ProjectInstance extends IObjectKeys {
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



export interface Site {
    id: string
    name: string
    code: string
    domain: string
    active: boolean
}

export interface Key {
    id: string
    title: string
    sort_key: number
}
export interface ProjectInstanceKey {
    id: string
    project_instance_id: string
    user_keys_id: string
    project_id: string
}
export interface StreamingBackupSite {
    id: string
    name: string
    location: string
}