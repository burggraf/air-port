/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zzuyko8i",
    "name": "site_id",
    "type": "relation",
    "required": true,
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rvjcd1k1nl16re7")

  // remove
  collection.schema.removeField("zzuyko8i")

  return dao.saveCollection(collection)
})
