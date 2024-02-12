/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9sji0cb5iyh334")

  collection.name = "org_user"
  collection.indexes = [
    "CREATE INDEX `idx_2g8wLHg` ON `org_user` (`org_id`)",
    "CREATE INDEX `idx_tmTa5W4` ON `org_user` (`user_id`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9sji0cb5iyh334")

  collection.name = "orgs_users"
  collection.indexes = [
    "CREATE INDEX `idx_2g8wLHg` ON `orgs_users` (`org_id`)",
    "CREATE INDEX `idx_tmTa5W4` ON `orgs_users` (`user_id`)"
  ]

  return dao.saveCollection(collection)
})
