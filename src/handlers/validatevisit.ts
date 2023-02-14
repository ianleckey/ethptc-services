import { createClient } from '@supabase/supabase-js'

const processRules = ( visit ) => {

    if(visit.status == 'pending')
        return true
    
    if(compareTimes( visit.created_at, visit.finished_at, visit.visit_duration))
        return true

    return false

}

const compareTimes = (start, finished, duration) => {

    let durationMs = duration * 1000
    
    if(start + durationMs <= finished)
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
                visit_duration
            )
        `)
        .eq('id', visit_id)
        .eq('campaign_id', campaign_id)

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