/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rknxwh9kxxznlcc")

  collection.options = {
    "query": "select\n    id,\n    name,\n    location,\n    code\nfrom\n    s3"
  }

  // remove
  collection.schema.removeField("ktuzsy5q")

  // remove
  collection.schema.removeField("jm59kdcy")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ylh2aemu",
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
    "id": "3cs2fz1u",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7xjfhgq4",
    "name": "code",
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
    "query": "select\n    id,\n    name,\n    location\nfrom\n    s3"
  }

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

  // remove
  collection.schema.removeField("ylh2aemu")

  // remove
  collection.schema.removeField("3cs2fz1u")

  // remove
  collection.schema.removeField("7xjfhgq4")

  return dao.saveCollection(collection)
})
