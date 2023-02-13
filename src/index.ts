import { Router } from 'itty-router';

import CheckAddress from './handlers/checkaddress';

const router = Router();

router
    .get('/api/checkaddress/:address', CheckAddress)
    .get('*', () => new Response('Not found', { status: 404 }));

export default {
	fetch: router.handle,
};