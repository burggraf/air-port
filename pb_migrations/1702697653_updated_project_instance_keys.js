/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ctjcd1k36atyd7a")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uwxzrnac",
    "name": "user_id",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
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
  collection.schema.removeField("uwxzrnac")

  return dao.saveCollection(collection)
})
