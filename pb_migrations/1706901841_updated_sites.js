/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "2avvwwfk",
    "name": "dns_host",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("souws1inx11patr")

  // remove
  collection.schema.removeField("2avvwwfk")

  return dao.saveCollection(collection)
})
