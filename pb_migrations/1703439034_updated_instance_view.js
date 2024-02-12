/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT project_instance.id, project_instance.domain, project_instance.port, project_instance.type,\nprojects.id as project_id,\nprojects.name, projects.owner, projects.ownertype,\nsites.id as site_id,\nsites.code, sites.name as site_name, sites.domain as site_domain,\n  project_instance.db_streaming_backup_location,\n  project_instance.logs_streaming_backup_location\nFROM project_instance \nJOIN projects ON project_instance.project_id = projects.id \nJOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // remove
  collection.schema.removeField("dotonc7w")

  // remove
  collection.schema.removeField("irfp1jdp")

  // remove
  collection.schema.removeField("llhtevvl")

  // remove
  collection.schema.removeField("glv6lmxz")

  // remove
  collection.schema.removeField("1gghwc0q")

  // remove
  collection.schema.removeField("ufkdzas8")

  // remove
  collection.schema.removeField("p9nf1uik")

  // remove
  collection.schema.removeField("xk2uplhb")

  // remove
  collection.schema.removeField("zpx5asfh")

  // remove
  collection.schema.removeField("w4butawg")

  // remove
  collection.schema.removeField("yggbuhxm")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wxlsaxn5",
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
    "id": "zob2rfbv",
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
    "id": "enc0lj4x",
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
    "id": "fhqgfidd",
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
    "id": "e82bxgms",
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
    "id": "prwoivkr",
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
    "id": "b3nlhvvq",
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
    "id": "cqvr35ea",
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
    "id": "7zoodvfm",
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
    "id": "5zjsbp7x",
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
    "id": "6xo1adoq",
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
    "id": "jm9u3gfn",
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
    "id": "dhbhcooj",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pki5d3q1odtd6ob")

  collection.options = {
    "query": "SELECT project_instance.id, project_instance.domain, project_instance.port, project_instance.type,\nprojects.id as project_id,\nprojects.name, projects.owner, projects.ownertype,\nsites.id as site_id,\nsites.code, sites.name as site_name, sites.domain as site_domain\nFROM project_instance \nJOIN projects ON project_instance.project_id = projects.id \nJOIN sites ON project_instance.site_id = sites.id;\n"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dotonc7w",
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
    "id": "irfp1jdp",
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
    "id": "llhtevvl",
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
    "id": "glv6lmxz",
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
    "id": "1gghwc0q",
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
    "id": "ufkdzas8",
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
    "id": "p9nf1uik",
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
    "id": "xk2uplhb",
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
    "id": "zpx5asfh",
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
    "id": "w4butawg",
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
    "id": "yggbuhxm",
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

  // remove
  collection.schema.removeField("wxlsaxn5")

  // remove
  collection.schema.removeField("zob2rfbv")

  // remove
  collection.schema.removeField("enc0lj4x")

  // remove
  collection.schema.removeField("fhqgfidd")

  // remove
  collection.schema.removeField("e82bxgms")

  // remove
  collection.schema.removeField("prwoivkr")

  // remove
  collection.schema.removeField("b3nlhvvq")

  // remove
  collection.schema.removeField("cqvr35ea")

  // remove
  collection.schema.removeField("7zoodvfm")

  // remove
  collection.schema.removeField("5zjsbp7x")

  // remove
  collection.schema.removeField("6xo1adoq")

  // remove
  collection.schema.removeField("jm9u3gfn")

  // remove
  collection.schema.removeField("dhbhcooj")

  return dao.saveCollection(collection)
})
