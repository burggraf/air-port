/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("philrzzyd5fffbp")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zq3wejwe",
    "name": "download_link",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("philrzzyd5fffbp")

  // remove
  collection.schema.removeField("zq3wejwe")

  return dao.saveCollection(collection)
})
