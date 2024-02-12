/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT\n    project_instance.id,\n    project_instance.domain,\n    project_instance.type,\n    projects.id as project_id,\n    projects.name,\n    projects.owner,\n    projects.ownertype,\n    projects.port,\n    sites.id as site_id,\n    sites.code,\n    sites.name as site_name,\n    sites.domain as site_domain,\n    sites.node as node,\n    project_instance.db_streaming_backup_location,\n    project_instance.logs_streaming_backup_location,\n    project_instance.db_streaming_backup_retention,\n    project_instance.logs_streaming_backup_retention\nFROM\n    project_instance\n    JOIN projects ON project_instance.project_id = projects.id\n    JOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // remove
  collection.schema.removeField("hnlitp8o")

  // remove
  collection.schema.removeField("ds658rvv")

  // remove
  collection.schema.removeField("yhxy4qpd")

  // remove
  collection.schema.removeField("uuymnjqw")

  // remove
  collection.schema.removeField("2jnbtq2r")

  // remove
  collection.schema.removeField("gnxygvlo")

  // remove
  collection.schema.removeField("it9bqzeb")

  // remove
  collection.schema.removeField("0mkjl6qo")

  // remove
  collection.schema.removeField("ltfb2vue")

  // remove
  collection.schema.removeField("4zswndjw")

  // remove
  collection.schema.removeField("rzptwvdx")

  // remove
  collection.schema.removeField("pmhiswbs")

  // remove
  collection.schema.removeField("i5jfqsam")

  // remove
  collection.schema.removeField("zxv3sew8")

  // remove
  collection.schema.removeField("y0xx3gli")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bbdwfltc",
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
    "id": "swq7xaio",
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
    "id": "kosum2ou",
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
    "id": "f6irxaku",
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
    "id": "w5ezdmli",
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
    "id": "xnzao7r2",
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
    "id": "pgptpsjh",
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
    "id": "trh4plfc",
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
    "id": "qrweuanu",
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
    "id": "cszl9ccf",
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
    "id": "7h3rjq2o",
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
    "id": "egavatmh",
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
    "id": "wedclvce",
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
    "id": "8zqhrd21",
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
    "id": "scthnln4",
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
    "id": "m8ccuikj",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT\n    project_instance.id,\n    project_instance.domain,\n    project_instance.type,\n    projects.id as project_id,\n    projects.name,\n    projects.owner,\n    projects.ownertype,\n    projects.port,\n    sites.id as site_id,\n    sites.code,\n    sites.name as site_name,\n    sites.domain as site_domain,\n    project_instance.db_streaming_backup_location,\n    project_instance.logs_streaming_backup_location,\n    project_instance.db_streaming_backup_retention,\n    project_instance.logs_streaming_backup_retention\nFROM\n    project_instance\n    JOIN projects ON project_instance.project_id = projects.id\n    JOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hnlitp8o",
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
    "id": "ds658rvv",
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
    "id": "yhxy4qpd",
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
    "id": "uuymnjqw",
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
    "id": "2jnbtq2r",
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
    "id": "gnxygvlo",
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
    "id": "it9bqzeb",
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
    "id": "0mkjl6qo",
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
    "id": "ltfb2vue",
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
    "id": "4zswndjw",
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
    "id": "rzptwvdx",
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
    "id": "pmhiswbs",
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
    "id": "i5jfqsam",
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
    "id": "zxv3sew8",
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
    "id": "y0xx3gli",
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

  // remove
  collection.schema.removeField("bbdwfltc")

  // remove
  collection.schema.removeField("swq7xaio")

  // remove
  collection.schema.removeField("kosum2ou")

  // remove
  collection.schema.removeField("f6irxaku")

  // remove
  collection.schema.removeField("w5ezdmli")

  // remove
  collection.schema.removeField("xnzao7r2")

  // remove
  collection.schema.removeField("pgptpsjh")

  // remove
  collection.schema.removeField("trh4plfc")

  // remove
  collection.schema.removeField("qrweuanu")

  // remove
  collection.schema.removeField("cszl9ccf")

  // remove
  collection.schema.removeField("7h3rjq2o")

  // remove
  collection.schema.removeField("egavatmh")

  // remove
  collection.schema.removeField("wedclvce")

  // remove
  collection.schema.removeField("8zqhrd21")

  // remove
  collection.schema.removeField("scthnln4")

  // remove
  collection.schema.removeField("m8ccuikj")

  return dao.saveCollection(collection)
})
