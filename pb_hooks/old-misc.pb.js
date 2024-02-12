/// <reference path="../pb_data/types.d.ts" />
routerAdd('GET', '/gethost', async (c) => {
	console.log('** ls')
	try {
		// const cmd = $os.cmd('cat', '/etc/hostname')
		// const output = String.fromCharCode(...cmd.output())
		// return c.json(200, { result: output })
		return c.json(200, { data: process.env.HOST, error: null})	
	} catch (err) {
		console.log('err', err)
		const cmd = $os.cmd('ls', '-alt')
		return c.json(200, { 'got err': JSON.stringify(err) })
	}
})
routerAdd('GET', '/hello/:name', (c) => {
	let name = c.pathParam('name')
	console.log('** hello', name)
	return c.json(200, { message: 'Hello ' + name })
})
routerAdd(
	'GET',
	'/sample_hook',
	(c) => {
		// let name = c.pathParam("name")
		function randomString() {
			const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
			let result = ''
			for (let i = 15; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
			return result
		}

		const result = new DynamicModel({
			a: '',
			b: '',
			c: '',
			category: '',
			d: '',
			difficulty: '',
			id: '',
			question: '',
			subcategory: '',
		})

		try {
			const user = c.get('authRecord') // empty if not authenticated as regular auth record
			if (user === null) {
				console.log('user is null')
				try {
					$app
						.dao()
						.db()
						.newQuery(
							`SELECT trivia.a,trivia.b,trivia.c,trivia.d,trivia.category,trivia.difficulty,trivia.subcategory,trivia.id,trivia.question FROM trivia where trivia.id >= '${randomString()}' order by trivia.id asc LIMIT 1`
						)
						.one(result) // throw an error on db failure or missing row
				} catch (forwarderror) {
					console.log('forwarderror:', forwarderror)
					try {
						if (forwarderror.value.error() === 'sql: no rows in result set') {
							$app
								.dao()
								.db()
								.newQuery(
									`SELECT trivia.a,trivia.b,trivia.c,trivia.d,trivia.category,trivia.difficulty,trivia.subcategory,trivia.id,trivia.question FROM trivia where trivia.id <= '${randomString()}' order by trivia.id asc LIMIT 1`
								)
								.one(result) // throw an error on db failure or missing row
						}
					} catch (finalerror) {
						console.log('finalerror:', finalerror)
						return c.json(200, { error: finalerror })
					}
				}
			} else {
				console.log('user is: ', user?.id)
				try {
					$app
						.dao()
						.db()
						.newQuery(
							`SELECT trivia.a,trivia.b,trivia.c,trivia.d,trivia.category,trivia.difficulty,trivia.subcategory,trivia.id,trivia.question FROM trivia left outer join trivia_log on trivia_log.user = '${
								user?.id
							}' and trivia_log.question = trivia.id where trivia.id >= '${randomString()}' and trivia_log.id is null order by trivia.id asc LIMIT 1`
						)
						.one(result) // throw an error on db failure or missing row
				} catch (forwarderror) {
					console.log('forwarderror:', forwarderror)
					try {
						if (forwarderror.value.error() === 'sql: no rows in result set') {
							$app
								.dao()
								.db()
								.newQuery(
									`SELECT trivia.a,trivia.b,trivia.c,trivia.d,trivia.category,trivia.difficulty,trivia.subcategory,trivia.id,trivia.question FROM trivia left outer join trivia_log on trivia_log.user = '${
										user?.id
									}' and trivia_log.question = trivia.id where trivia.id <= '${randomString()}' and trivia_log.id is null order by trivia.id asc LIMIT 1`
								)
								.one(result) // throw an error on db failure or missing row
						}
					} catch (finalerror) {
						console.log('finalerror:', finalerror)
						return c.json(200, { error: finalerror })
					}
				}
			}
			return c.json(200, { result })
		} catch (err) {
			console.log('err:', err)
			return c.json(200, { error: err })
		}
	} /* optional middlewares */
)

// fires only for "users" (not) "managers" auth collections
// onRecordAfterConfirmVerificationRequest((e) => {
//     console.log('onRecordAfterConfirmVerificationRequest: e.httpContext',JSON.stringify(e.httpContext,null,2))
//     console.log('onRecordAfterConfirmVerificationRequest: e.record',JSON.stringify(e.record,null,2))
//     // e.redirect(200, "http://localhost:8100/welcome");
// }, "users")

onRealtimeConnectRequest((e) => {
	////console.log('onRealtimeConnectRequest', JSON.stringify(e,null,2))
	// for (let attr in e.httpContext) {
	//     console.log(`httpContext.${attr} = ${e.httpContext[attr]}`)
	// }
	/*
2023/12/02 08:07:03 client.channel = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.discard = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.get = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.hasSubscription = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.id = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.isDiscarded = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.send = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.set = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.subscribe = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.subscriptions = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.unset = function reflect.methodValueCall() { [native code] }
2023/12/02 08:07:03 client.unsubscribe = function reflect.methodValueCall() { [native code] }

2023/12/02 08:20:08 httpContext.attachment = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.bind = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.blob = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.cookie = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.cookies = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.echo = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.error = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.file = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.fileFS = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.formFile = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.formValue = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.formValueDefault = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.formValues = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.get = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.html = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.htmlBlob = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.inline = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.isTLS = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.isWebSocket = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.json = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.jsonBlob = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.jsonp = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.jsonpBlob = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.jsonPretty = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.multipartForm = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.noContent = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.path = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.pathParam = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.pathParamDefault = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.pathParams = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.queryParam = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.queryParamDefault = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.queryParams = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.queryString = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.rawPathParams = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.realIP = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.redirect = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.render = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.request = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.reset = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.response = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.routeInfo = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.scheme = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.set = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setCookie = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setPath = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setPathParams = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setRawPathParams = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setRequest = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setResponse = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.setRouteInfo = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.stream = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.string = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.validate = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.xml = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.xmlBlob = function reflect.methodValueCall() { [native code] }
2023/12/02 08:20:08 httpContext.xmlPretty = function reflect.methodValueCall() { [native code] }


*/
})

onRealtimeDisconnectRequest((e) => {
	////console.log('onRealtimeDisconnectRequest', JSON.stringify(e,null,2))
})
