import { createClient } from '@supabase/supabase-js'


const getPrice = (visits, visit_duration) => {

    const durations = {
        10: '0.002',
        20: '0.0025',
        30: '0.0030',
        40: '0.0035',
        60: '0.0045'
    }

    let totalUsd = (durations[visit_duration] * visits).toPrecision(2) / 1
    
    return totalUsd

}

const getCampaign = async (campaign_id, env) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    const { data, error } = await supabase
        .from('campaigns')
        .select('visits, visit_duration, user_id')
        .eq('id', campaign_id)
        .single()

    return data;
}

const validateCampaign = async (visits, visit_duration, user_id, env) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    if(visits !== 1000 && visits !== 2000 && visits !== 3000 && visits !== 4000 && visits !== 5000 && visits !== 6000 && visits !== 7000 && visits !== 8000 && visits !== 9000 && visits !== 10000) {
        return false
    }

    if(visit_duration !== 10 && visit_duration !== 20 && visit_duration !== 30 && visit_duration !== 40 && visit_duration !== 60) {
        return false
    }

    /** check user id is present and  exists in db */
    if(!user_id) {
        return false
    }

    let { data, error, status, count } = await supabase
        .from('profiles')
        .select(`*`, { count: 'exact', head: true })
        .eq('id', user_id)
    
    if(count == 0 || error) {
        return false
    }

    return true
}

const Payment = async (request, env, context) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)    
    const campaign_id = request.params.campaign_id;

    const campaign = await getCampaign(campaign_id, env)

    if( campaign ) {

        /** campaign found, continue */
        if(!validateCampaign(campaign.visits, campaign.visit_duration, campaign.user_id, env)) {

            /** update campaign status to invalid in db */
            await supabase
                .from('campaigns')
                .update({
                    status: 'invalid'
                })
                .eq('id', campaign_id)

            /** 400 bad request if campaign invalid */
            return new Response(JSON.stringify({ status: 400 }), {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'max-age: 3600',
                },
            })
            
        }
        
        const price = getPrice(campaign.visits, campaign.visit_duration).toString()

        const options = {
            method: 'POST',
            headers: {
              'Authorization': env.POOF_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify({metadata: { campaign_id: campaign_id }, amount: price, crypto: 'ethereum'})
        };
          
        const poofResponse = await (
            await fetch('https://www.poof.io/api/v2/create_invoice', options)
        ).json()

        return new Response(JSON.stringify(poofResponse), {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'max-age: 3600',
            },
        })

        
    } else {
        /** 404 if campaign not found */
        return new Response(JSON.stringify({ message: 'Campaign not found', status: 404 }), {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'max-age: 3600',
            },
        })

    }


};

export default Payment;