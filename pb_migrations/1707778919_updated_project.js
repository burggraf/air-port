/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("by8pu6i5rte0xel")

  collection.listRule = "@request.auth.id = owner"
  collection.viewRule = "@request.auth.id = owner"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("by8pu6i5rte0xel")

  collection.listRule = null
  collection.viewRule = null

  return dao.saveCollection(collection)
})
