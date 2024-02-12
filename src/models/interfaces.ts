export interface IObjectKeys {
    [key: string]: string | number | object | undefined
}

export interface Project extends IObjectKeys {
    id: string
    domain: string
    name: string
    owner: string
    ownertype: string
    port: number
    metadata?: any
    type?: string
}
export interface ProjectInstance extends IObjectKeys {
    name: string
    project_id: string
    owner: string
    ownertype: string
    code: string
    domain: string
    id: string
    port: number
    site_domain: string
    site_name: string
    site_id: string
    type: string
	db_streaming_backup_location: string
	logs_streaming_backup_location: string    
    db_streaming_backup_retention: number
    logs_streaming_backup_retention: number
    instance_status: string
    metadata?: any
    project_type?: string
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