/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // remove
  collection.schema.removeField("inkhmtj0")

  // remove
  collection.schema.removeField("9qelakdc")

  // remove
  collection.schema.removeField("jlvkb1a2")

  // remove
  collection.schema.removeField("y21lnvcg")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "inkhmtj0",
    "name": "primary_region",
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
    "id": "9qelakdc",
    "name": "cpu_kind",
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
    "id": "jlvkb1a2",
    "name": "cpus",
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
    "id": "y21lnvcg",
    "name": "memory_mb",
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
})
