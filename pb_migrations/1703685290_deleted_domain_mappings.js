/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ia1u941iyef561s");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ia1u941iyef561s",
    "created": "2023-12-14 14:45:05.817Z",
    "updated": "2023-12-14 14:47:37.882Z",
    "name": "domain_mappings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "7oippkx6",
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
      },
      {
        "system": false,
        "id": "edagxwz5",
        "name": "domain",
        "type": "text",
        "required": true,
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
        "id": "tznz1uga",
        "name": "port",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tVEQ5cS` ON `domain_mappings` (\n  `site_id`,\n  `port`\n)",
      "CREATE UNIQUE INDEX `idx_C7sMiy0` ON `domain_mappings` (\n  `site_id`,\n  `domain`\n)"
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
