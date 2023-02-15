import { createClient } from '@supabase/supabase-js'


const Payment = async (request, env, context) => {

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
    
    const campaign_id = request.params.campaign_id;


};

export default Payment;