/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "kvqigirutuwa1tf",
    "created": "2023-12-18 14:01:13.692Z",
    "updated": "2023-12-18 14:01:13.692Z",
    "name": "stats",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dtzetfxt",
        "name": "site_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "souws1inx11patr",
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
  const collection = dao.findCollectionByNameOrId("kvqigirutuwa1tf");

  return dao.deleteCollection(collection);
})
