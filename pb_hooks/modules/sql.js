const select = (fieldsObj, sqlText) => {
	try {
		// create the project_instance record
		const cursor = arrayOf(
			new DynamicModel(fieldsObj)
		)
		$app
			.dao()
			.db()
			.newQuery(sqlText)
			.all(cursor) // throw an error on db failure
            return { data: cursor, error: null }
	} catch (err) {
		return { data: null, error: err?.value?.error() || err };
	}
}

const execute = (sqlText) => {
	try {
		$app
			.dao()
			.db()
			.newQuery(sqlText)
			.execute() // throw an error on db failure
		return { data: 'ok', error: null };
	} catch (err) {
		return { data: null, error: err?.value?.error() || err };
	}

}
const executeReturning = (fieldsObj, sqlText) => {
	try {
		const retarr = arrayOf(
			new DynamicModel(fieldsObj)
		)
		$app
			.dao()
			.db()
			.newQuery(sqlText)
			.all(retarr) // throw an error on db failure
		return { data: retarr, error: null };
	} catch (err) {
		return { data: null, error: err?.value?.error() || err };
	}

}

module.exports = { select, execute, executeReturning };