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

/* global vpnauth, oc_appswebroots, OC, oc_requesttoken, dijit, oc_config, console, jsxc, Strophe */
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
                    if (!d || !d.state || (d.state !== 'vpnauth' && d.state !== 'unauth')){
                        console.log('Auto-login not applicable');
                        return;
                    }

                    // Not connected to private space
                    if (d.state === 'unauth'){
                        var ac_no_vpn_txt = $.t('No_privatespace');
                        ac_no_vpn_txt = 'Not connected to the Private Space';

                        var ncalt = $('<p id="vpnauth_alt" class="warning"/>').append($('<span/>').text(ac_no_vpn_txt));
                        $('#body-login').find('form:eq(0) .groupbottom').append(ncalt);
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
                    $('#body-login').find('form:eq(0) .groupbottom').append(alt);

                    // Countdown kick off
                    cntFnc();

                }, function(err){});
            } else {
                // logged in
                console.log(curUser);
            }
        }

        // Autologin patch for ojsxc - if needed.
        if (curUser && curUser.uid){
            setTimeout(function () {
                if (!jsxc || !jsxc.gui){
                    console.log('JSXC not loaded');
                    return;
                }

                // Set focus to username or password field
                $(document).on("complete.dialog.jsxc", function() {
                    if (!vpnauth.el_exists('#jsxc_username')){
                        return;  // not a login dialog.
                    }

                    var dialog = $('#jsxc_dialog');
                    var uname = $('#jsxc_username');
                    var upass = $('#jsxc_password');

                    vpnauth.checkVpnAuth(function(d){
                        if (!d || !d.state || (d.state !== 'vpnauth')){
                            console.log('Auto-login not applicable');
                            return;
                        }

                        var cntdown = 5;
                        var usr = d.user;
                        var ac_timer;
                        var ac_link_txt = $.t('JSXC_Autologin');
                        ac_link_txt = 'Autologin: {0} s.';

                        var $reset = dialog.find('button[type=reset]');
                        var $submit = dialog.find('button[type=submit]');
                        var $resetClone = $reset.clone();
                        var oldSubmitTxt = $submit.text();

                        // Form hooks + controls
                        uname.val(usr.email);
                        upass.val(user_pass);
                        $reset.hide();
                        $resetClone.insertAfter($reset);
                        $resetClone.off();
                        $resetClone.removeClass('jsxc_close');
                        $resetClone.attr('type', 'button');
                        $resetClone.click(function(){
                            clearTimeout(ac_timer);
                            $submit.text(oldSubmitTxt);
                            $resetClone.hide();
                            $reset.show();
                        });
                        $submit.click(function(){
                            clearTimeout(ac_timer);
                        });

                        // Countdown + handler
                        var al_start;
                        var cntFnc = function(){
                            if (al_start === undefined){
                                al_start = $.now();
                            }

                            var diff = ($.now() - al_start) / 1000.0;
                            var sec = Math.ceil(cntdown - diff);
                            $submit.text(ac_link_txt.format(sec));
                            if (diff >= cntdown){
                                $resetClone.hide();
                                $reset.show();
                                $submit.click();

                            } else {
                                ac_timer = setTimeout(cntFnc, 250);
                            }
                        };

                        // Countdown kick off
                        cntFnc();

                    }, function(err){});
                });

            }, 500);
        }

        // Custom on roster handler - for new contact loading.
        var onRoster = function(iq, target_jid){
            if ($(iq).find('query').length === 0) {
                jsxc.debug('Use cached roster');
                return;
            }

            var buddies = [];

            $(iq).find('item').each(function() {
                var jid = $(this).attr('jid');
                var name = $(this).attr('name') || jid;
                var sub = $(this).attr('subscription');
                var bid = jsxc.jidToBid(jid);

                buddies.push(bid);
                jsxc.gui.roster.remove(bid);

                // Update existing buddies
                jsxc.storage.saveBuddy(bid, {
                    jid: jid,
                    name: name,
                    sub: sub,
                    rnd: Math.random() // force storage event
                });

                jsxc.gui.roster.add(bid);
            });

            if (buddies.length === 0) {
                jsxc.gui.roster.empty();
            }

            jsxc.storage.setUserItem('buddylist', buddies);
            if ($(iq).find('query').attr('ver')) {
                jsxc.storage.setUserItem('rosterVer', $(iq).find('query').attr('ver'));
            }
        };

        // On presence handler
        $(document).on("presence.jsxc", function(evt, from, status, presence) {
            if (!jsxc || !jsxc.gui){
                return;
            }

            var jid = Strophe.getBareJidFromJid(from).toLowerCase();
            var bid = jsxc.jidToBid(jid);
            var ri = jsxc.gui.roster.getItem(bid);
            if (ri.length > 0){
                return;
            }

            // Reload the roster...
            var queryAttr = {
                xmlns: 'jabber:iq:roster'
            };

            var iq = $iq({
                type: 'get'
            }).c('query', queryAttr);

            jsxc.xmpp.conn.sendIQ(iq, function(iq){
                onRoster(iq, jid);
            });
        });

    });
}(jQuery));


