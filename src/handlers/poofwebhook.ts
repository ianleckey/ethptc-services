import { createClient } from '@supabase/supabase-js'


const getCampaign = async (campaign_id, env) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    const { data, error } = await supabase
        .from('campaigns')
        .select('visits, visit_duration, user_id')
        .eq('id', campaign_id)
        .single()

    return data;
}


const PoofWebhook = async (request, env, context) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)    

    const payload = await request.json()

    if( payload['x-proof-signature'] !== env.POOF_SHARED ) {
        return new Response(JSON.stringify({ error: 'Invalid key'}), { status: 403 });
    }

    if( payload['paid'] !== 'yes' ) {
        return new Response(JSON.stringify({ error: 'Unpaid'}), { status: 200 });
    }

    if( !payload['payment_id'] ) {
        return new Response(JSON.stringify({ error: 'No payment id'}), { status: 200 });
    }

    if( !payload['metadata']['external']['campaign_id'] ) {
        return new Response(JSON.stringify({ error: 'No campaign_id present'}), { status: 200 });
    }

    const campaign = await getCampaign(payload['metadata']['external']['campaign_id'], env)
    if(!campaign) {
        return new Response(JSON.stringify({ error: 'Campaign not found'}), { status: 404 });
    }

    const ethPaid = parseFloat(payload['metadata']['due'])
    const bid = (ethPaid / campaign.visits).toPrecision(8)
    /** take 50% of eth paid to move to faucet */
    const userPayoutTotal = (ethPaid / 2).toPrecision(8)
    /** calculate individual visit payout amount */
    const ppv = (userPayoutTotal / campaign.visits).toPrecision(8)

    /** update campaign data */
    await supabase 
        .from('campaigns')
        .update({
            payment_id: payload['payment_id'],
            bid: bid,
            user_ppv: ppv,
            total: ethPaid,
        })
        .eq('id', payload['metadata']['external']['campaign_id'])

    /** NOW DO FUND TRANSFER TO FAUCET WALLET
     * ...
     */

    const options = {
        method: 'POST',
        headers: {
          Authorization: 'sha512-omROq2vL0qVgyTKYI9VCERWPZxRA/nyLQQzsh0KLJFVh/29l+wSTDMW5eg9aVNz8Zht6kATUudFca2a5eF24jQ==?Un6A',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          amount: 0.2,
          crypto: 'ethereum',
          address: env.FP_ADDRESS
        })
      };

    const poofResponse = await (
        await fetch('https://www.poof.io/api/v2/payouts', options)
    ).json()
      
    if(poofResponse.message !== 'Insufficient Balance') {
        /** NOW SET CAMPAIGN ACTIVE */

        await supabase 
            .from('campaigns')
            .update({
                status: 'active',
            })
            .eq('id', payload['metadata']['external']['campaign_id'])

    }




    return new Response(JSON.stringify({ success: true }), { status: 200 });

};

export default PoofWebhook;