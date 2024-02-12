/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vow1bz58zzjwl7r");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "vow1bz58zzjwl7r",
    "created": "2024-01-05 01:33:03.228Z",
    "updated": "2024-01-05 01:33:03.228Z",
    "name": "pb_versions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fftgse1i",
        "name": "version",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "debwfa5q",
        "name": "notes",
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
})
