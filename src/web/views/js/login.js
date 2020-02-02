$(function() {
    async function fetchAsync (url, config={}) {
        let response;
        if (config) {
            response = await fetch(url,config);
        } else {
            response = await fetch(url);
        }
        return await response
    }

    $(document).ready( function () {
        fetchAsync('/login/verify', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            if (response.status === 200)
                window.location = response.url;
            if (response.status === 401)
                console.log("Mellow - Your Little Discord Friend :-)");
        });
    });
});