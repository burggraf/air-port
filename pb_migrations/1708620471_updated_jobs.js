/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  collection.listRule = "userid = @request.auth.id"
  collection.viewRule = "userid = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  collection.listRule = null
  collection.viewRule = null

  return dao.saveCollection(collection)
})
