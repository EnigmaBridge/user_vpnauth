/**
 * Created by dusanklinec on 28.04.17.
 */
var vpnauth = null;

(function($) {
    "use strict";

    /**
     * VPNAuth namespace
     *
     * @namespace jsxc
     */
    vpnauth = {
        /** Version of vpnauth */
        version: '< $ app.version $ >',

        /** Auth url */
        authUrl: null

    };

    /**
     * Init vpn auth plugin
     * @param options
     */
    vpnauth.init = function(options){
        vpnauth.authUrl = options['auth_url'];
    };

    /**
     * Basic login test with VpnAuth
     */
    vpnauth.checkVpnAuth = function(onAuth, onError){
        $.ajax({
            type: 'GET',
            url: vpnauth.authUrl,

            success: function(d) {
                if (d){
                    onAuth(d);
                } else {
                    onError(d);
                }
            },
            error: function() {
                console.log('XHR error on authcheck');
                onError(false);
            }
        });


    };


}(jQuery));

