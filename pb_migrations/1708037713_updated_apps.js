/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yj6svymj",
    "name": "field",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // remove
  collection.schema.removeField("yj6svymj")

  return dao.saveCollection(collection)
})
