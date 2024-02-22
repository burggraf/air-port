/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  collection.createRule = "userid = @request.auth.id"
  collection.updateRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  collection.createRule = null
  collection.updateRule = null

  return dao.saveCollection(collection)
})
