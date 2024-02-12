/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kvqigirutuwa1tf")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kp2o9lfv",
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
    "id": "do2ju2sf",
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
    "id": "lobp401h",
    "name": "port",
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
  const collection = dao.findCollectionByNameOrId("kvqigirutuwa1tf")

  // remove
  collection.schema.removeField("kp2o9lfv")

  // remove
  collection.schema.removeField("do2ju2sf")

  // remove
  collection.schema.removeField("lobp401h")

  return dao.saveCollection(collection)
})
