import { Router } from 'itty-router';
import CheckAddress from './handlers/checkaddress';

const router = Router();

router
    .get('/api/checkaddress/:address', CheckAddress)
    .get('*', () => new Response('Not found', { status: 404 }));

export default {
	fetch: (request, env, context) => router.handle(request, env, context).then(response => {
		return response
	}).catch(err => {
		// and do something with the errors here, like logging, error status, etc
		console.log(err)
	})
}