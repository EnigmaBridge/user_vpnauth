/*!
 * ojsxc v3.2.0-beta.1 - 2017-04-05
 *
 * Copyright (c) 2017 Klaus Herberth <klaus@jsxc.org> <br>
 * Released under the MIT license
 *
 * Please see http://www.jsxc.org/
 *
 * @author Klaus Herberth <klaus@jsxc.org>
 * @version 3.2.0-beta.1
 * @license MIT
 */

/* global vpnauth, oc_appswebroots, OC, oc_requesttoken, dijit, oc_config, console */
/* jshint latedef: nofunc */


(function($) {
    "use strict";

    // initialization on page load
    $(function() {
        if (location.pathname.substring(location.pathname.lastIndexOf("/") + 1) === 'public.php') {
            // abort on shares
            return;
        }

        if (window.parent && window !== window.parent) {
            // abort if inside a frame
            return;
        }

        if (typeof vpnauth === 'undefined') {
            // abort if core or dependencies threw an error
            return;
        }

        var authUrl = OC.filePath('user_vpnauth', 'ajax', 'checkAuth.php');
        var curUser = OC.getCurrentUser();
        var user_pass = 'any-passwd.you-are-using-vpn-authenticated-sso.';  // password placeholder for curious

        // Init
        vpnauth.init({
            authUrl: authUrl,
            loginForm: {
                form: '#body-login form',
                jid: '#user',
                submit: '#body-login form input[type=submit]',
                pass: '#password',
                ifFound: 'force',
                onConnecting: (oc_config.version.match(/^([8-9]|[0-9]{2,})+\./)) ? 'quiet' : 'dialog'
            },
        });

        // Autologin feature ...
        if (vpnauth.el_exists(vpnauth.options.loginForm.form) &&
            vpnauth.el_exists(vpnauth.options.loginForm.jid) &&
            vpnauth.el_exists(vpnauth.options.loginForm.pass)) {

            if (!curUser || !curUser.uid){
                vpnauth.checkVpnAuth(function(d){
                    if (!d || !d.state || d.state !== 'vpnauth'){
                        console.log('Auto-login not applicable');
                        return;
                    }

                    var cntdown = 5;
                    var usr = d.user;
                    $(vpnauth.options.loginForm.jid).val(usr.email);
                    $(vpnauth.options.loginForm.pass).val(user_pass);
                    $(vpnauth.options.loginForm.submit).focus();

                    var ac_timer;
                    var ac_link_txt = $.t('Cancel_Autologin');
                    ac_link_txt = 'Autologin in {0} s. Cancel?';

                    var al_start;
                    var alt;
                    var link = $('<a/>').text(ac_link_txt.format(cntdown)).attr('href', '#').click(function() {
                        clearTimeout(ac_timer);
                        alt.hide();
                    });

                    var cntFnc = function(){
                        if (al_start === undefined){
                            al_start = $.now();
                        }

                        var diff = ($.now() - al_start) / 1000.0;
                        var sec = Math.ceil(cntdown - diff);
                        link.text(ac_link_txt.format(sec));
                        if (diff >= cntdown){
                            alt.hide();
                            $(vpnauth.options.loginForm.submit).click();

                        } else {
                            ac_timer = setTimeout(cntFnc, 250);
                        }
                    };

                    alt = $('<p id="vpnauth_alt" class="warning"/>').append(link);
                    $('#body-login form:eq(0) .groupbottom').append(alt);

                    // Countdown kick off
                    cntFnc();

                }, function(err){
                    // fail
                });
            } else {
                console.log(curUser);
            }
        }


    });
}(jQuery));


