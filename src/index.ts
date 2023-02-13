
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
}

export const worker = {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		return new Response(`Hello World from ${request.method}!`);
	},
};

/*
addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event))
})
 
async function handleRequest(event) {

	const { pathname, searchParams } = new URL(event.request.url);

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

		return new Response('Forbidden', {
			headers: { 'content-type': 'text/plain' },
			status: 403
		})

	}

}
*/