/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rr2oyxgx",
    "name": "ID_Domain",
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
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rr2oyxgx",
    "name": "ID_",
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
})
