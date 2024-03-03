/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Apps = "apps",
	Machines = "machines",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AppsRecord = {
	AppURL?: string
	Deployed?: boolean
	Domain?: string
	Hostname?: string
	Name?: string
	PlatformVersion?: string
	Status?: string
	Version?: number
	primary_region?: string
	title?: string
	type?: string
	userid?: RecordIdString
}

export type MachinesRecord<Tconfig = unknown, Tevents = unknown, Timage_ref = unknown, Tmetadata = unknown> = {
	Domain?: string
	config?: null | Tconfig
	created_at?: IsoDateString
	events?: null | Tevents
	image_ref?: null | Timage_ref
	instance_id?: string
	is_primary?: boolean
	machine_id?: string
	metadata?: null | Tmetadata
	name?: string
	private_ip?: string
	region?: string
	state?: string
	updated_at?: IsoDateString
	userid?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	name?: string
}

// Response types include system fields and match responses from the PocketBase API
export type AppsResponse<Texpand = unknown> = Required<AppsRecord> & BaseSystemFields<Texpand>
export type MachinesResponse<Tconfig = unknown, Tevents = unknown, Timage_ref = unknown, Tmetadata = unknown, Texpand = unknown> = Required<MachinesRecord<Tconfig, Tevents, Timage_ref, Tmetadata>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	apps: AppsRecord
	machines: MachinesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	apps: AppsResponse
	machines: MachinesResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'apps'): RecordService<AppsResponse>
	collection(idOrName: 'machines'): RecordService<MachinesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
