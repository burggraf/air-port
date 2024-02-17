/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // remove
  collection.schema.removeField("4fmybycy")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a3to2gh9",
    "name": "Version",
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
  const collection = dao.findCollectionByNameOrId("y5ltgs26avr1a34")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4fmybycy",
    "name": "Version",
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

  // remove
  collection.schema.removeField("a3to2gh9")

  return dao.saveCollection(collection)
})
