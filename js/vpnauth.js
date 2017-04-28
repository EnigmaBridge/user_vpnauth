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

        /**
         * Checks if there is a element with the given selector
         *
         * @param {String} selector jQuery selector
         * @return {Boolean}
         */
        el_exists: function(selector) {
            return $(selector).length > 0;
        },


    };

    /**
     * Options
     * @type {{authUrl: null}}
     */
    vpnauth.options = {
        authUrl: null,
        loginForm: {},

    };

    /**
     * Init vpn auth plugin
     * @param options
     * @param options.auth_url
     */
    vpnauth.init = function(options){
        if (options) {
            vpnauth.options.authUrl = options.authUrl || {};
            vpnauth.options.loginForm = options.loginForm || {};
        }
    };

    /**
     * Basic login test with VpnAuth
     */
    vpnauth.checkVpnAuth = function(onAuth, onError){
        $.ajax({
            type: 'GET',
            url: vpnauth.options.authUrl,

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

    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        };
    }

}(jQuery));

