/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rknxwh9kxxznlcc")

  collection.options = {
    "query": "select\n    id,\n    name,\n    location\nfrom\n    s3"
  }

  // remove
  collection.schema.removeField("kiz43s4u")

  // remove
  collection.schema.removeField("4tfxdpzt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ktuzsy5q",
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
    "id": "jm59kdcy",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rknxwh9kxxznlcc")

  collection.options = {
    "query": "select id, name, location from s3"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kiz43s4u",
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
    "id": "4tfxdpzt",
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
  }))

  // remove
  collection.schema.removeField("ktuzsy5q")

  // remove
  collection.schema.removeField("jm59kdcy")

  return dao.saveCollection(collection)
})
