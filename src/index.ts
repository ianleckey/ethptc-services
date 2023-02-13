import { Router } from 'itty-router';
import { createCors } from 'itty-cors'

import CheckAddress from './handlers/checkaddress';

// create CORS handlers
const { preflight, corsify } = createCors()

const router = Router();

router
	.all('*', preflight)
    .get('/api/checkaddress/:address', CheckAddress)
    .get('*', () => new Response('Not found', { status: 404 }));

export default {
	fetch: (request, env, context) => router
		.handle(request, env, context)
		.catch(err => {
			console.log(err)
		})
		.then(corsify)
}