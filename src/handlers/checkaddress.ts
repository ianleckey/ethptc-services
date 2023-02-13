const checkaddress = {};

const CheckAddress = async request => {
    // This will be used soon to retrieve a post
    const address = request.params.address;

    const fpResponse = await (
        await fetch('https://faucetpay.io/api/v1/checkaddress', {
            method: 'post',
            body: 'api_key='+ FPKEY +'&address='+ address,
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        })
    ).json()

    response = new Response(JSON.stringify(fpResponse), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age: 3600',
        },
    })

    return response

};

export default CheckAddress;