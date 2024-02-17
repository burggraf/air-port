/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vxaw8ea1",
    "name": "primary_region",
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

  // remove
  collection.schema.removeField("vxaw8ea1")

  return dao.saveCollection(collection)
})
