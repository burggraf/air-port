/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "untsrrot",
    "name": "metadata",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  // remove
  collection.schema.removeField("untsrrot")

  return dao.saveCollection(collection)
})
