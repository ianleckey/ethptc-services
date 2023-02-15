import { createClient } from '@supabase/supabase-js'

const processRules = ( visit, env ) => {
    

    /** 
     * check total visits on campaign to see if this new visit is applicable
     * update campaign status if not 
     */

    if( getTotalCampaignVisits(visit.campaign_id, env) >= visit.campaigns.visits ) {
        campaignComplete(visit.campaign_id, env)
        return false
    }


    /** check if campaign status is active */
    if(visit.campaigns.status !== 'active') 
        return false

    /** check if visit status is still pending (i.e. hasn't *already* been confirmed or paid) */
    if(visit.status !== 'pending')
        return false
    
    /** make sure visit is for the appropriate duration set by the campaign parameters */
    if(!compareTimes( visit.created_at, visit.finished_at, visit.campaigns.visit_duration))
        return false

    return true

}

const getTotalCampaignVisits = async (campaign_id, env) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    let { data, error, status, count } = await supabase
        .from('visits')
        .select(`*`, { count: 'exact', head: true })
        .eq('campaign_id', campaign_id)
        .or(`status.eq.paid,status.eq.confirmed,and(campaign_id.eq.${campaign_id}`)

    console.log(count)
    return count
}

const campaignComplete = async (campaign_id, env) => {
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

    await supabase
        .from('campaigns')
        .update({
            status: 'complete'
        })
        .eq('id', campaign_id)

}

const compareTimes = (start, finished, duration) => {

    let startFormatted = new Date(start)
    let finishedFormatted = new Date(finished)
    let secondsDiff = Math.floor( Math.abs( finishedFormatted.getTime() - startFormatted.getTime() ) / 1000 );
    
    if(secondsDiff >= duration)
        return true

    return false

};

const ValidateVisit = async (request, env, context) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
    
    const visit_id = request.params.visit_id;
    const campaign_id = request.params.campaign_id;

    const { data, error } = await supabase
        .from('visits')
        .select(`
            created_at, finished_at, status, user_id, 
            campaigns( 
                visits,
                visit_duration,
                status
            )
        `)
        .eq('id', visit_id)
        .eq('campaign_id', campaign_id)
        .single()

    if(data) {
        
        const isValid = processRules( data, env )

        if(isValid) {
            await supabase
                .from('visits')
                .update({
                    status: 'confirmed'
                })
                .eq('id', visit_id)
        }

        return new Response(JSON.stringify({ valid: isValid }), {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'max-age: 3600',
            },
        })

    }
    if(error) { }


};

export default ValidateVisit;