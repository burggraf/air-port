/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bwltl7xo",
    "name": "address",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // remove
  collection.schema.removeField("bwltl7xo")

  return dao.saveCollection(collection)
})
