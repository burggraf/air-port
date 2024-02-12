/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kvqigirutuwa1tf")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qf85qugl",
    "name": "instance_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "rvjcd1k1nl16re7",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kvqigirutuwa1tf")

  // remove
  collection.schema.removeField("qf85qugl")

  return dao.saveCollection(collection)
})
