/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z8hej2kk",
    "name": "logs_streaming_backup_retention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z8hej2kk",
    "name": "logs_streaming_backup_rentention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
})
