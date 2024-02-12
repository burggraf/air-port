/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_wAfp2Bb` ON `projects` (`domain`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  collection.indexes = []

  return dao.saveCollection(collection)
})
