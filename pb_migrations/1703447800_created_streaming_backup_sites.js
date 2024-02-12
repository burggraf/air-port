/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "rknxwh9kxxznlcc",
    "created": "2023-12-24 19:56:40.113Z",
    "updated": "2023-12-24 19:56:40.113Z",
    "name": "streaming_backup_sites",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "994ig1bx",
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
      },
      {
        "system": false,
        "id": "0zlflqdq",
        "name": "location",
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
    "options": {
      "query": "select id, name, location from s3"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("rknxwh9kxxznlcc");

  return dao.deleteCollection(collection);
})
