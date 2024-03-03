/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z93jvnmg",
    "name": "pitr",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4ddl9gtz6psb9ob")

  // remove
  collection.schema.removeField("z93jvnmg")

  return dao.saveCollection(collection)
})
