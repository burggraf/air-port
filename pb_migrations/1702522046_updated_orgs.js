/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ezboa58cueucwvv")

  // remove
  collection.schema.removeField("a3pdq5qk")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ezboa58cueucwvv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a3pdq5qk",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "personal",
        "standard"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
