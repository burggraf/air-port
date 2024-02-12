/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "4yqukm1q7bo3bic",
    "created": "2024-01-30 15:53:26.337Z",
    "updated": "2024-01-30 15:53:26.337Z",
    "name": "disk_usage_view",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "e5kvfo66",
        "name": "instance_id",
        "type": "relation",
        "required": false,
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
        "id": "f6prqwf3",
        "name": "ts",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "q2yvvmkn",
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
      },
      {
        "system": false,
        "id": "zjiirxwx",
        "name": "site_id",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "souws1inx11patr",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "361smqse",
        "name": "size",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "7vf5d20r",
        "name": "owner",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "lnxpet0i",
        "name": "ownertype",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "wnmw0sga",
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
        "id": "mge96scq",
        "name": "site_name",
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
        "id": "k50vyhbj",
        "name": "project_name",
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
      "query": "select\n    disk_usage.id,\n    disk_usage.instance_id,\n    disk_usage.ts,\n    disk_usage.port,\n    disk_usage.site_id,\n    disk_usage.size,\n    owner,\n    ownertype,\n    project_instance.domain as domain,\n    sites.name as site_name,\n    projects.name as project_name\nfrom\n    disk_usage\n    join project_instance on project_instance.id = disk_usage.instance_id\n    join sites on sites.id = disk_usage.site_id\n    join projects on projects.id = project_instance.project_id"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("4yqukm1q7bo3bic");

  return dao.deleteCollection(collection);
})
