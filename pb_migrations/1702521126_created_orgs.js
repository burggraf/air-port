/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ezboa58cueucwvv",
    "created": "2023-12-14 02:32:06.507Z",
    "updated": "2023-12-14 02:32:06.507Z",
    "name": "orgs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "rrpwogig",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
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
  const collection = dao.findCollectionByNameOrId("ezboa58cueucwvv");

  return dao.deleteCollection(collection);
})
