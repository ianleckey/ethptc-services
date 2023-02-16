import { Router } from 'itty-router';
import { createCors } from 'itty-cors'

import CheckAddress from './handlers/checkaddress';
import ValidateVisit from './handlers/validatevisit';
import Payment from './handlers/payment';
import PoofWebhook from './handlers/poofwebhook';

// create CORS handlers
const { preflight, corsify } = createCors()

const router = Router();

router
	.all('*', preflight)
    .get('/api/checkaddress/:address', CheckAddress)
	.get('/api/validatevisit/:campaign_id/:visit_id', ValidateVisit)
	.get('/api/payment/:campaign_id', Payment)
	.post('/api/poof/webhook', PoofWebhook)
    .get('*', () => new Response('Not found', { status: 404 }));

export default {
	fetch: (request, env, context) => router
		.handle(request, env, context)
		.catch(err => {
			console.log(err)
		})
		.then(corsify)
}