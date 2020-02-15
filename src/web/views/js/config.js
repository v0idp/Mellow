$(function() {
    function ucwords(str) {
        return (str + '')
            .replace(/^(.)|\s+(.)/g, function ($1) {
                return $1.toUpperCase();
            })
    }

    function testBot(bot, cfg) {
        let url = '/' + bot + '/test';

        fetchAsync(url, cfg).then(function(res) {
            let buildMsg;
            if ((res.status === "error")) {
                buildMsg = "Connection failed. ";

                let hardFailures = [400, 403, 404, 502];

                if (hardFailures.includes(res.response.statusCode)) {
                    buildMsg += res.response.statusCode;
                }
                setFailedMsg(buildMsg, bot);
            } else {
                buildMsg = "Connection successful! ";
                setSuccessMsg(buildMsg, bot);
            }
            $('#form-' + bot + ' .testBot').html('Test Connectivity');
            window.scrollTo(0,0);
        });
    }

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
                if (api === "tautulli")
                    buildMsg += "Version " + res.response.data.version;
                else
                    buildMsg += "Version " + res.version;
                setSuccessMsg(buildMsg, api);
            }
            $('#form-' + api + ' .testApi').html('Test Connectivity');
            window.scrollTo(0,0);
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
        $('#main-alert .message').html(ucwords(api) + ': ' + msg);
        $('#main-alert').removeClass('collapse').removeClass('alert-danger').removeClass('alert-warning').addClass('alert-success').show();
    }

    function setFailedMsg(msg, api) {
        $('#main-alert .message').html(ucwords(api) + ': ' + msg);
        $('#main-alert').removeClass('collapse').removeClass('alert-success').removeClass('alert-warning').addClass('alert-danger').show();
    }

    function setWarningMsg(msg, api) {
        $('#main-alert .message').html(ucwords(api) + ': ' + msg);
        $('#main-alert').removeClass('collapse').removeClass('alert-success').removeClass('alert-danger').addClass('alert-warning').show();
    }

    $('.testBot').click(function(e) {
        e.preventDefault();
        let request = {};

        // figure out which bot this is
        request.bot = $(this).data('bot');

        // grab bot details from the relevant form
        request.token = $('#form-' + request.bot + ' input.token').val();

        // make sure that we actually have enough data to proceed first...
        if (!request.token) {
            setWarningMsg('One or more required fields are missing. Please double check your configuration.', request.bot);
            window.scrollTo(0,0);
            return false;
        }

        // load a fancy spinning thingy
        $(this).html('<i class="fas fa-spinner fa-pulse"></i> Testing...');

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
        testBot(request.bot, cfg);
    })

    $('.testApi').click(function(e) {
        e.preventDefault();
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
            window.scrollTo(0,0);
            return false;
        }

        // load a fancy spinning thingy
        $(this).html('<i class="fas fa-spinner fa-pulse"></i> Testing...');


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

    $('button.close').click(function() {
        $($(this).data('parent-id')).hide();
    });

    // are you sure?!
    $('.reset-button').click(function() {
        return confirm('Are you sure?');
    });

    // show current tab on load / refresh
    $("ul.nav-tabs > li > a").on("shown.bs.tab", function(e) {
        var id = $(e.target).attr("href").substr(1);
        window.location.hash = id;
    });

    // on load of the page: switch to the currently selected tab
    var hash = window.location.hash;
    $('#nav-tabs a[href="' + hash + '"]').tab('show');
});