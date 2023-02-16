import { Router } from 'itty-router';
import { createCors } from 'itty-cors'

import CheckAddress from './handlers/checkaddress';
import ValidateVisit from './handlers/validatevisit';
import Payment from './handlers/payment';
import PoofWebhook from './handlers/poofwebhook';
import PayConfirmedVisits from './scheduled/payconfirmedvisits';

// create CORS handlers
const { preflight, corsify } = createCors()

const router = Router();

router
	.all('*', preflight)
    .get('/api/checkaddress/:address', CheckAddress)
	.get('/api/validatevisit/:campaign_id/:visit_id', ValidateVisit)
	.get('/api/payment/:campaign_id', Payment)
	.post('/api/poof/webhook', PoofWebhook);

export default {
	async scheduled(event, env, context) {
		context.waitUntil( PayConfirmedVisits );
	},
	fetch: (request, env, context) => router
		.handle(request, env, context)
		.catch(err => {
			console.log(err)
		})
		.then(corsify)
}