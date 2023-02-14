const CheckAddress = async (request, env, context) => {
    // This will be used soon to retrieve a post
    const address = request.params.address;
    const cache = caches.default
    let response = await cache.match(request)
    if (response) {
        return response
    }

    const fpResponse = await (
        await fetch('https://faucetpay.io/api/v1/checkaddress', {
            method: 'post',
            body: 'api_key='+ env.FPKEY +'&address='+ address,
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        })
    ).json()

    response = new Response(JSON.stringify(fpResponse), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age: 3600',
        },
    })

    context.waitUntil(cache.put(request, response.clone()))

    return response

};

export default CheckAddress;