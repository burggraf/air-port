/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1bhznhqa",
    "name": "logs_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "iz8ssqqv",
    "name": "db_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // remove
  collection.schema.removeField("1bhznhqa")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "iz8ssqqv",
    "name": "streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
