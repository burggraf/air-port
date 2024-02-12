/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("tzua1e04mbyxi43")

  collection.options = {
    "query": "select\n    stats.id,\n    stats.instance_id,\n    stats.ts,\n    stats.event,\n    stats.port,\n    stats.cpu_usage,\n    stats.cpu_max,\n    stats.disk_read,\n    stats.disk_write,\n    stats.mem_usage,\n    stats.mem_max,\n    stats.net_in,\n    stats.net_out,\n    owner,\n    ownertype,\n    project_instance.domain as domain,\n    sites.name as site_name,\n    projects.name as project_name\nfrom\n    stats\n    join project_instance on project_instance.id = stats.instance_id\n    join sites on sites.id = stats.site_id\n    join projects on projects.id = project_instance.project_id"
  }

  // remove
  collection.schema.removeField("0rjppoe7")

  // remove
  collection.schema.removeField("rqtj9hkd")

  // remove
  collection.schema.removeField("ncaebyvh")

  // remove
  collection.schema.removeField("pe4ryjow")

  // remove
  collection.schema.removeField("qqk5zh1q")

  // remove
  collection.schema.removeField("bhonglx8")

  // remove
  collection.schema.removeField("2raustkc")

  // remove
  collection.schema.removeField("oigdwyfy")

  // remove
  collection.schema.removeField("teuubxwy")

  // remove
  collection.schema.removeField("rbsrge0s")

  // remove
  collection.schema.removeField("pua8ppvi")

  // remove
  collection.schema.removeField("idos04zp")

  // remove
  collection.schema.removeField("mbopnzsl")

  // remove
  collection.schema.removeField("vdqfvpnh")

  // remove
  collection.schema.removeField("sxaizptr")

  // remove
  collection.schema.removeField("l6llcqvq")

  // remove
  collection.schema.removeField("m45zvilq")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rogrryec",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vbpjpjsd",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rbukgwtx",
    "name": "event",
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
    "id": "udkaafgj",
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
    "id": "vilcgw5y",
    "name": "cpu_usage",
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
    "id": "rnq8o6h2",
    "name": "cpu_max",
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
    "id": "acytajlp",
    "name": "disk_read",
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
    "id": "y6f6lmtu",
    "name": "disk_write",
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
    "id": "9pphd3ny",
    "name": "mem_usage",
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
    "id": "p9dmc0vu",
    "name": "mem_max",
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
    "id": "zik9xxm8",
    "name": "net_in",
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
    "id": "ucrcxuiu",
    "name": "net_out",
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
    "id": "hccjc2qg",
    "name": "owner",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "l6bhxa0a",
    "name": "ownertype",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v2sbrxfl",
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
    "id": "rtv91ifq",
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
    "id": "ydf6mape",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("tzua1e04mbyxi43")

  collection.options = {
    "query": "select stats.id, stats.instance_id,stats.ts, stats.event,stats.port,stats.cpu_usage,stats.cpu_max,stats.disk_read,stats.disk_write,stats.mem_usage,stats.mem_max,stats.net_in,stats.net_out, owner, ownertype,project_instance.domain as domain, sites.name as site_name, projects.name as project_name from stats join project_instance on project_instance.id = stats.instance_id join sites on sites.id = stats.site_id join projects on projects.id = project_instance.project_id"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0rjppoe7",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rqtj9hkd",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ncaebyvh",
    "name": "event",
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
    "id": "pe4ryjow",
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
    "id": "qqk5zh1q",
    "name": "cpu_usage",
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
    "id": "bhonglx8",
    "name": "cpu_max",
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
    "id": "2raustkc",
    "name": "disk_read",
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
    "id": "oigdwyfy",
    "name": "disk_write",
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
    "id": "teuubxwy",
    "name": "mem_usage",
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
    "id": "rbsrge0s",
    "name": "mem_max",
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
    "id": "pua8ppvi",
    "name": "net_in",
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
    "id": "idos04zp",
    "name": "net_out",
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
    "id": "mbopnzsl",
    "name": "owner",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vdqfvpnh",
    "name": "ownertype",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sxaizptr",
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
    "id": "l6llcqvq",
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
    "id": "m45zvilq",
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
  }))

  // remove
  collection.schema.removeField("rogrryec")

  // remove
  collection.schema.removeField("vbpjpjsd")

  // remove
  collection.schema.removeField("rbukgwtx")

  // remove
  collection.schema.removeField("udkaafgj")

  // remove
  collection.schema.removeField("vilcgw5y")

  // remove
  collection.schema.removeField("rnq8o6h2")

  // remove
  collection.schema.removeField("acytajlp")

  // remove
  collection.schema.removeField("y6f6lmtu")

  // remove
  collection.schema.removeField("9pphd3ny")

  // remove
  collection.schema.removeField("p9dmc0vu")

  // remove
  collection.schema.removeField("zik9xxm8")

  // remove
  collection.schema.removeField("ucrcxuiu")

  // remove
  collection.schema.removeField("hccjc2qg")

  // remove
  collection.schema.removeField("l6bhxa0a")

  // remove
  collection.schema.removeField("v2sbrxfl")

  // remove
  collection.schema.removeField("rtv91ifq")

  // remove
  collection.schema.removeField("ydf6mape")

  return dao.saveCollection(collection)
})
