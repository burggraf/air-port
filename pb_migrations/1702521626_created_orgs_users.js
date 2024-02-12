/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "r9sji0cb5iyh334",
    "created": "2023-12-14 02:40:26.809Z",
    "updated": "2023-12-14 02:40:26.809Z",
    "name": "orgs_users",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vfktftau",
        "name": "org_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "ezboa58cueucwvv",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "l3ltnzqw",
        "name": "user_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_2g8wLHg` ON `orgs_users` (`org_id`)",
      "CREATE INDEX `idx_tmTa5W4` ON `orgs_users` (`user_id`)"
    ],
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
  const collection = dao.findCollectionByNameOrId("r9sji0cb5iyh334");

  return dao.deleteCollection(collection);
})
