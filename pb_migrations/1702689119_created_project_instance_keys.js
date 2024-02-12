/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ctjcd1k36atyd7a",
    "created": "2023-12-16 01:11:59.510Z",
    "updated": "2023-12-16 01:11:59.510Z",
    "name": "project_instance_keys",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "9fniuda2",
        "name": "project_instance_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "rvjcd1k1nl16re7",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "ob8hxiel",
        "name": "user_keys_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "s4522k4slgltnuk",
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
  const collection = dao.findCollectionByNameOrId("ctjcd1k36atyd7a");

  return dao.deleteCollection(collection);
})
