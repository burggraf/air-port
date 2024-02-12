/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yo3f6yf7qocw2mi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ore00bm0",
    "name": "code",
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
  const collection = dao.findCollectionByNameOrId("yo3f6yf7qocw2mi")

  // remove
  collection.schema.removeField("ore00bm0")

  return dao.saveCollection(collection)
})
