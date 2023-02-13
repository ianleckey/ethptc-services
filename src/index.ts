// 1. listen for fetch events
addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event))
})
 
// 2. event handler which returns a Response object
async function handleRequest(event) {

	const { pathname, searchParams } = new URL(event.request.url);

	/** checkaddress */
	if (pathname == '/checkaddress') {
		let address = searchParams.get('address')
		const cache = caches.default
		let response = await cache.match(event.request)
		if (response) {
			return response
		}
		const fpResponse = await (
			await fetch('https://faucetpay.io/api/v1/checkaddress', {
				method: 'post',
				body: 'api_key='+ FPKEY +'&address='+ address,
        		headers: { 'Content-type': 'application/x-www-form-urlencoded' }
			})
		).json()

		response = new Response(JSON.stringify(fpResponse), {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'max-age: 3600',
			},
		})

		event.waitUntil(cache.put(event.request, response.clone()))

		return response

	} else {

		/** all other endpoints */
		return new Response('Forbidden', {
			headers: { 'content-type': 'text/plain' },
			status: 403
		})

	}




}