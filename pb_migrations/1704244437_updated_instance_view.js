/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT\n    project_instance.id,\n    project_instance.domain,\n    project_instance.type,\n    projects.id as project_id,\n    projects.name,\n    projects.owner,\n    projects.ownertype,\n    projects.port,\n    sites.id as site_id,\n    sites.code,\n    sites.name as site_name,\n    sites.domain as site_domain,\n    sites.node as node,\n    project_instance.db_streaming_backup_location,\n    project_instance.logs_streaming_backup_location,\n    project_instance.db_streaming_backup_retention,\n    project_instance.logs_streaming_backup_retention,\n    project_instance.instance_status as instance_status\nFROM\n    project_instance\n    JOIN projects ON project_instance.project_id = projects.id\n    JOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // remove
  collection.schema.removeField("chw4as4r")

  // remove
  collection.schema.removeField("ikzwq2tn")

  // remove
  collection.schema.removeField("xgkodlfy")

  // remove
  collection.schema.removeField("ewiduh32")

  // remove
  collection.schema.removeField("i1ugueak")

  // remove
  collection.schema.removeField("mlsfmbs3")

  // remove
  collection.schema.removeField("w69xy3mw")

  // remove
  collection.schema.removeField("j6njvsqo")

  // remove
  collection.schema.removeField("xn26vkob")

  // remove
  collection.schema.removeField("d1sj3tuu")

  // remove
  collection.schema.removeField("vmsuav6p")

  // remove
  collection.schema.removeField("zmeyn6kg")

  // remove
  collection.schema.removeField("byxbabej")

  // remove
  collection.schema.removeField("i1iuucrn")

  // remove
  collection.schema.removeField("x4fkbiee")

  // remove
  collection.schema.removeField("fbayfgfg")

  // remove
  collection.schema.removeField("ohnw3vel")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yeqlyc0e",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "osku5mhx",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "primary",
        "replica"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fr6sdbel",
    "name": "project_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "6rcmt3rl2qq67qi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1knwdfww",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5ega1qm0",
    "name": "owner",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uzqhg7wi",
    "name": "ownertype",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "person",
        "org"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8qu6dnzh",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "q4xxniqo",
    "name": "site_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "souws1inx11patr",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nbumoeoi",
    "name": "code",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wua0wgik",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "omobx6xb",
    "name": "site_domain",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "s9bkqsyi",
    "name": "node",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "p7hlqfh4",
    "name": "db_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "l5crjzfu",
    "name": "logs_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "koiwreh5",
    "name": "db_streaming_backup_retention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "toa6lfoj",
    "name": "logs_streaming_backup_retention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "klybzkjs",
    "name": "instance_status",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT\n    project_instance.id,\n    project_instance.domain,\n    project_instance.type,\n    projects.id as project_id,\n    projects.name,\n    projects.owner,\n    projects.ownertype,\n    projects.port,\n    sites.id as site_id,\n    sites.code,\n    sites.name as site_name,\n    sites.domain as site_domain,\n    sites.node as node,\n    project_instance.db_streaming_backup_location,\n    project_instance.logs_streaming_backup_location,\n    project_instance.db_streaming_backup_retention,\n    project_instance.logs_streaming_backup_retention,\n    project_instance.instance_status\nFROM\n    project_instance\n    JOIN projects ON project_instance.project_id = projects.id\n    JOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "chw4as4r",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ikzwq2tn",
    "name": "type",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "primary",
        "replica"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xgkodlfy",
    "name": "project_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "6rcmt3rl2qq67qi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ewiduh32",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i1ugueak",
    "name": "owner",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mlsfmbs3",
    "name": "ownertype",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "person",
        "org"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w69xy3mw",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "j6njvsqo",
    "name": "site_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "souws1inx11patr",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xn26vkob",
    "name": "code",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "d1sj3tuu",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vmsuav6p",
    "name": "site_domain",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zmeyn6kg",
    "name": "node",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "byxbabej",
    "name": "db_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i1iuucrn",
    "name": "logs_streaming_backup_location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "yo3f6yf7qocw2mi",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "x4fkbiee",
    "name": "db_streaming_backup_retention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fbayfgfg",
    "name": "logs_streaming_backup_retention",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ohnw3vel",
    "name": "instance_status",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("yeqlyc0e")

  // remove
  collection.schema.removeField("osku5mhx")

  // remove
  collection.schema.removeField("fr6sdbel")

  // remove
  collection.schema.removeField("1knwdfww")

  // remove
  collection.schema.removeField("5ega1qm0")

  // remove
  collection.schema.removeField("uzqhg7wi")

  // remove
  collection.schema.removeField("8qu6dnzh")

  // remove
  collection.schema.removeField("q4xxniqo")

  // remove
  collection.schema.removeField("nbumoeoi")

  // remove
  collection.schema.removeField("wua0wgik")

  // remove
  collection.schema.removeField("omobx6xb")

  // remove
  collection.schema.removeField("s9bkqsyi")

  // remove
  collection.schema.removeField("p7hlqfh4")

  // remove
  collection.schema.removeField("l5crjzfu")

  // remove
  collection.schema.removeField("koiwreh5")

  // remove
  collection.schema.removeField("toa6lfoj")

  // remove
  collection.schema.removeField("klybzkjs")

  return dao.saveCollection(collection)
})
