/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pobab05iexcq8w5",
    "created": "2024-03-11 17:56:23.010Z",
    "updated": "2024-03-11 17:56:23.010Z",
    "name": "machine_key",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8c8uicyd",
        "name": "machine",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "4ddl9gtz6psb9ob",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pobab05iexcq8w5");

  return dao.deleteCollection(collection);
})
