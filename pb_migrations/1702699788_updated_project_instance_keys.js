/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ctjcd1k36atyd7a")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vwjoa0sa",
    "name": "project_id",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "6rcmt3rl2qq67qi",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ctjcd1k36atyd7a")

  // remove
  collection.schema.removeField("vwjoa0sa")

  return dao.saveCollection(collection)
})
