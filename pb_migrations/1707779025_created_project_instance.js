/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "q2umkl5ed1ts0m2",
    "created": "2024-02-12 23:03:45.482Z",
    "updated": "2024-02-12 23:03:45.482Z",
    "name": "project_instance",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ujds6n7x",
        "name": "project_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "by8pu6i5rte0xel",
          "cascadeDelete": false,
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
  const collection = dao.findCollectionByNameOrId("q2umkl5ed1ts0m2");

  return dao.deleteCollection(collection);
})
