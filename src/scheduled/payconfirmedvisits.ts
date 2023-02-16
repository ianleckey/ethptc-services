import { createClient } from '@supabase/supabase-js'

const payVisit = async (visit, env, supabase) => {

    /** get address for user */
    const address = getUserAddress(visit.user_id, env, supabase)
    
    if(!address)
        return false

    const fpResponse = await (
        await fetch('https://faucetpay.io/api/v1/send', {
            method: 'post',
            body: 'api_key='+ env.FPKEY +'&amount='+ visit.user_ppv +'&to='+ address + '&currency=ETH',
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        })
    ).json()

    if(fpResponse.payout_id) {
        updateVisitPaid(visit, env, supabase)
        return true
    }
    
}

const updateVisitPaid = async (visit, env, supabase) => {
    await supabase
        .from('visits')
        .update({
            status: 'paid'
        })
        .eq('id', visit.id)

}

const getUserAddress = async (user_id, env, supabase) => {
    const { data, error } = await supabase 
        .from('profiles')
        .select('fp_address')
        .eq('id', user_id)
        .single()

    if(data) {
        return data.fp_address
    }

    return false
}

const PayConfirmedVisits = async (event, env, context) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
    /** 
     * get confirmed visits
     * foreach
     * payout w/ FP
     *  */

    const { data, error } = await supabase
        .from('visits')
        .select(`
            user_id,
            campaigns(
                user_ppv
            )
        `)
        .eq('status', 'confirmed')

    if(data) {
        data.forEach = ( (visit) => {
            payVisit(visit, env, supabase)
        })
    } else {

        return new Response(JSON.stringify({ success: false, message: 'nothing to do' }), { status: 200 });

    }

};

export default PayConfirmedVisits;