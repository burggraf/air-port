/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pki5d3q1odtd6ob",
    "created": "2023-12-14 23:41:49.787Z",
    "updated": "2023-12-14 23:41:49.787Z",
    "name": "instance_view",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "smgv9lhf",
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
    "options": {
      "query": "SELECT project_instance.id, projects.name from project_instance join projects on project_instance.project_id = project_id join sites on sites.id = project_instance.site_id"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob");

  return dao.deleteCollection(collection);
})
