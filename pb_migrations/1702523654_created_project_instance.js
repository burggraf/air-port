/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "rvjcd1k1nl16re7",
    "created": "2023-12-14 03:14:14.767Z",
    "updated": "2023-12-14 03:14:14.767Z",
    "name": "project_instance",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "btbthjuv",
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
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7");

  return dao.deleteCollection(collection);
})
