/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("f5a10ohikva6ss5")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "owzauqfz",
    "name": "port",
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
  const collection = dao.findCollectionByNameOrId("f5a10ohikva6ss5")

  // remove
  collection.schema.removeField("owzauqfz")

  return dao.saveCollection(collection)
})
