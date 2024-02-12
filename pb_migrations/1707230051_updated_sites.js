/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ujwbmh8v",
    "name": "bench_cpu",
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
    "id": "6u3ya80a",
    "name": "bench_read",
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
    "id": "c7ib2fqm",
    "name": "bench_write",
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
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // remove
  collection.schema.removeField("ujwbmh8v")

  // remove
  collection.schema.removeField("6u3ya80a")

  // remove
  collection.schema.removeField("c7ib2fqm")

  return dao.saveCollection(collection)
})
