/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ia1u941iyef561s")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_tVEQ5cS` ON `domain_mappings` (\n  `site_id`,\n  `port`\n)",
    "CREATE UNIQUE INDEX `idx_C7sMiy0` ON `domain_mappings` (\n  `site_id`,\n  `domain`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ia1u941iyef561s")

  collection.indexes = []

  return dao.saveCollection(collection)
})
