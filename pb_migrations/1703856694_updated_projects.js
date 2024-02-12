/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8wrexfo8",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6rcmt3rl2qq67qi")

  // remove
  collection.schema.removeField("8wrexfo8")

  return dao.saveCollection(collection)
})
