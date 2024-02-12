/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ubjubnnc",
    "name": "nats",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // remove
  collection.schema.removeField("ubjubnnc")

  return dao.saveCollection(collection)
})
