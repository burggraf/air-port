/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("huwpuflx1l1p7fj")

  collection.listRule = "@request.auth.id = user"
  collection.viewRule = "@request.auth.id = user"
  collection.createRule = "@request.auth.id = user"
  collection.updateRule = "@request.auth.id = user"
  collection.deleteRule = "@request.auth.id = user"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bzrfg1kv",
    "name": "user",
    "type": "relation",
    "required": false,
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
  const collection = dao.findCollectionByNameOrId("huwpuflx1l1p7fj")

  collection.listRule = "@request.auth.id = user_id"
  collection.viewRule = "@request.auth.id = user_id"
  collection.createRule = "@request.auth.id = user_id"
  collection.updateRule = "@request.auth.id = user_id"
  collection.deleteRule = "@request.auth.id = user_id"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bzrfg1kv",
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
})
