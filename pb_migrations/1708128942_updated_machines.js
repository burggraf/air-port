/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // remove
  collection.schema.removeField("nzl8iuz0")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4a3ijivh",
    "name": "Domain",
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
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nzl8iuz0",
    "name": "appid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "y5ltgs26avr1a34",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // remove
  collection.schema.removeField("4a3ijivh")

  return dao.saveCollection(collection)
})
