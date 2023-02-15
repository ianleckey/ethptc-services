import { createClient } from '@supabase/supabase-js'


const getPrice = (visits, visit_duration) => {

    const durations = {
        10: '0.0000012',
        20: '0.0000014',
        30: '0.0000016',
        40: '0.0000018',
        60: '0.0000022'
    }

    let total = durations[visit_duration] * visits
    return total.toPrecision(8) / 1
}

async const getCampaign = (campaign_id) => {
    const { data, error } = await supabase
        .from('campaigns')
        .select('visits, visit_duration, user_id')
        .eq('id', campaign_id)
        .single()

    return data;
}

async const validateCampaign = (visits, visit_duration, user_id) => {

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

    const campaign = getCampaign(campaign_id)
    if( campaign ) {

        /** campaign found, continue */
        if(!validateCampaign(campaign.visits, campaign.visit_duration, campaign.user_id)) {

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

        const price = getPrice(campaign.visits, campaign.visit_duration)
        const options = {
            method: 'POST',
            headers: {
              Authorization: 'sha512-SFQfOwTpwIwqQnhQx+EN62I9P3qyshhIzXH8S25PuxeY9TFGKMBzctZjZkXJ1Wad/ea6msVdgem72NWDvZRVsw==?fUrw',
              'content-type': 'application/json'
            },
            body: JSON.stringify({metadata: { campaign_id: campaign_id }, amount: price, crypto: 'ethereum'})
          };
          
          fetch('https://www.poof.io/api/v2/create_invoice', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
        
    } else {
        /** 404 if campaign not found */
        return new Response(JSON.stringify({ status: 404 }), {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'max-age: 3600',
            },
        })

    }


};

export default Payment;