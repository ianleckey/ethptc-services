import { Router } from 'itty-router';

const router = Router();

import CheckAddress from './handlers/checkaddress';

router
    .get('/api/checkaddress', CheckAddress)
    .get('*', () => new Response('Not found', { status: 404 }));

export const handleRequest = request => router.handle(request);