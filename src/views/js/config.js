$(function() {
    function testApi(api, cfg) {
        let url = '/' + api + '/test';

        fetchAsync(url, cfg).then(function(res) {
            let buildMsg;
            if ((res.status === "error")) {
                buildMsg = "Connection failed. ";

                let hardFailures = [400, 403, 404, 502];

                if (hardFailures.includes(res.response.statusCode)) {
                    buildMsg += res.response.statusCode;
                } else {
                    if ((api === "tautulli") && (res.response.body)) {
                        let detail = JSON.parse(res.response.body);
                        buildMsg += detail.response.message;
                    }
                }
                setFailedMsg(buildMsg, api);
            } else {
                buildMsg = "Connection successful! ";
                switch(api) {
                    case "radarr":
                    case "sonarr":
                        buildMsg += "Version " + res.version;
                        break;
                }

                setSuccessMsg(buildMsg, api);
            }
            $('#form-' + api + ' .testApi').html('Test Connectivity');
        });

    }

    async function fetchAsync (url, config={}) {
        let response;
        if (config) {
            response = await fetch(url,config);
        } else {
            response = await fetch(url);
        }
        return await response.json();
    }


    function setSuccessMsg(msg, api) {
        $('#' + api + '-message').html(msg).removeClass('alert-danger').removeClass('alert-warning').addClass('alert-success').show();
    }

    function setFailedMsg(msg, api) {
        $('#' + api + '-message').html(msg).removeClass('alert-success').removeClass('alert-warning').addClass('alert-danger').show();
    }

    function setWarningMsg(msg, api) {
        $('#' + api + '-message').html(msg).removeClass('alert-success').removeClass('alert-danger').addClass('alert-warning').show();
    }

    $('.testApi').click(function() {
        let request = {};

        // figure out which api this is
        request.api = $(this).data('api');

        // grab api details from the relevant form
        request.host = $('#form-' + request.api + ' input.host').val();
        request.port = $('#form-' + request.api + ' input.port').val();
        request.baseurl = $('#form-' + request.api + ' input.baseurl').val();
        request.apikey = $('#form-' + request.api + ' input.apikey').val();
        request.ssl =  $('#form-' + request.api + ' input.ssl').is(':checked') ? 'true' : 'false';

        // make sure that we actually have enough data to proceed first...
        if (!request.host || !request.apikey) {
            setWarningMsg('One or more required fields are missing. Please double check your configuration.', request.api);
            return false;
        }

        // load a fancy spinning thingy
        $(this).html('<i class="fas fa-spinner fa-pulse"></i> Testing...')


        // tell the ajax function this is a post request, and we're sending data
        let cfg = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        };

        // fire off to the test that does the hard work
        testApi(request.api, cfg);
    });
});