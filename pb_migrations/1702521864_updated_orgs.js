/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ezboa58cueucwvv")

  collection.indexes = [
    "CREATE INDEX `idx_ASiMw95` ON `orgs` (`name`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ezboa58cueucwvv")

  collection.indexes = []

  return dao.saveCollection(collection)
})
