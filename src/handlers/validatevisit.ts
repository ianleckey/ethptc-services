import { createClient } from '@supabase/supabase-js'

const processRules = ( visit ) => {

    console.log(visit)

    if(visit.status == 'pending')
        return true
    
    if(compareTimes( visit.created_at, visit.finished_at, visit.campaigns.visit_duration))
        return true

    return false

}

/**
 * @todo
 * pgsql timestampz in S or MS?
 */
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


    /**
     * @todo
     * make sure campaign status is `active`
     * pg trigger to set campaign status `complete` upon X confirmed visits
     */

    const { data, error } = await supabase
        .from('visits')
        .select(`
            created_at, finished_at, status, user_id, 
            campaigns( 
                visit_duration
            )
        `)
        .eq('id', visit_id)
        .eq('campaign_id', campaign_id)
        .single()

    if(data) {
        
        const isValid = processRules( data )

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