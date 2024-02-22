/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hi0oqd3l",
    "name": "data",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fannfy8k64z7x18")

  // remove
  collection.schema.removeField("hi0oqd3l")

  return dao.saveCollection(collection)
})
