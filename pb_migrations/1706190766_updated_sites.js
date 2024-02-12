/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "irp5hiic",
    "name": "provider",
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
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // remove
  collection.schema.removeField("irp5hiic")

  return dao.saveCollection(collection)
})
