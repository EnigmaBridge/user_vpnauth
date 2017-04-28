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

    // initialization
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

        console.log('vpnauth init, url: ' + authUrl);
        console.log('OC user: ' + curUser);

        // Init
        vpnauth.init({
            authUrl: authUrl
        });

        if (!curUser || !curUser.uid){
            console.log('Check the user');
            vpnauth.checkVpnAuth(function(d){
                console.log('Auth: ');
                console.log(d);

            }, function(err){
               // fail
            });
        } else {
            console.log(curUser);
        }

        // $(document).one('ready.roster.jsxc', onRosterReady);
        // $(document).on('toggle.roster.jsxc', onRosterToggle);
        //
        // jsxc.init({
        //     app_name: 'Nextcloud',
        //     loginForm: {
        //         form: '#body-login form',
        //         jid: '#user',
        //         pass: '#password',
        //         ifFound: 'force',
        //         onConnecting: (oc_config.version.match(/^([8-9]|[0-9]{2,})+\./)) ? 'quiet' : 'dialog'
        //     },
        //     logoutElement: $('#logout'),
        //     rosterAppend: 'body',
        //     root: oc_appswebroots.ojsxc + '/js/jsxc',
        //     RTCPeerConfig: {
        //         url: OC.filePath('ojsxc', 'ajax', 'getTurnCredentials.php')
        //     },
        //     displayRosterMinimized: function() {
        //         return OC.currentUser != null;
        //     },
        //     defaultAvatar: function(jid) {
        //         var cache = jsxc.storage.getUserItem('defaultAvatars') || {};
        //         var user = Strophe.unescapeNode(jid.replace(/@[^@]+$/, ''));
        //
        //         $(this).each(function() {
        //
        //             var $div = $(this).find('.jsxc_avatar');
        //             var size = $div.width();
        //             var key = user + '@' + size;
        //
        //             var handleResponse = function(result) {
        //                 if (typeof(result) === 'object') {
        //                     if (result.data && result.data.displayname) {
        //                         $div.imageplaceholder(user, result.data.displayname);
        //                     } else {
        //                         $div.imageplaceholder(user);
        //                     }
        //                 } else {
        //                     $div.css('backgroundImage', 'url(' + result + ')');
        //                 }
        //             };
        //
        //             if (typeof cache[key] === 'undefined' || cache[key] === null) {
        //                 var url;
        //
        //                 url = OC.generateUrl('/avatar/' + encodeURIComponent(user) + '/' + size + '?requesttoken={requesttoken}', {
        //                     user: user,
        //                     size: size,
        //                     requesttoken: oc_requesttoken
        //                 });
        //
        //                 $.get(url, function(result) {
        //
        //                     var val = (typeof result === 'object') ? result : url;
        //                     handleResponse(val);
        //
        //                     jsxc.storage.updateItem('defaultAvatars', key, val, true);
        //                 });
        //
        //             } else {
        //                 handleResponse(cache[key]);
        //             }
        //         });
        //     },
        //     loadSettings: function(username, password, cb) {
        //         $.ajax({
        //             type: 'POST',
        //             url: OC.filePath('ojsxc', 'ajax', 'getSettings.php'),
        //             data: {
        //                 username: username,
        //                 password: password
        //             },
        //             success: function(d) {
        //                 if (d.result === 'success' && d.data && d.data.serverType !== 'internal' && d.data.xmpp.url !== '' && d.data.xmpp.url !== null) {
        //                     cb(d.data);
        //                 } else if (d.data && d.data.serverType === 'internal') {
        //                     // fake successful connection
        //                     jsxc.bid = username + '@' + window.location.host;
        //
        //                     jsxc.storage.setItem('jid', jsxc.bid + '/internal');
        //                     jsxc.storage.setItem('sid', 'internal');
        //                     jsxc.storage.setItem('rid', '123456');
        //
        //                     jsxc.options.set('xmpp', {
        //                         url: OC.generateUrl('apps/ojsxc/http-bind')
        //                     });
        //                     if (d.data.loginForm) {
        //                         jsxc.options.set('loginForm', {
        //                             startMinimized: d.data.loginForm.startMinimized
        //                         });
        //                     }
        //
        //                     cb(false);
        //                 } else {
        //                     cb(false);
        //                 }
        //             },
        //             error: function() {
        //                 jsxc.error('XHR error on getSettings.php');
        //
        //                 cb(false);
        //             }
        //         });
        //     },
        //     saveSettinsPermanent: function(data, cb) {
        //         $.ajax({
        //             type: 'POST',
        //             url: OC.filePath('ojsxc', 'ajax', 'setUserSettings.php'),
        //             data: data,
        //             success: function(data) {
        //                 cb(data.trim() === 'true');
        //             },
        //             error: function() {
        //                 cb(false);
        //             }
        //         });
        //     },
        //     getUsers: function(search, cb) {
        //         $.ajax({
        //             type: 'GET',
        //             url: OC.filePath('ojsxc', 'ajax', 'getUsers.php'),
        //             data: {
        //                 search: search
        //             },
        //             success: cb,
        //             error: function() {
        //                 jsxc.error('XHR error on getUsers.php');
        //             }
        //         });
        //     },
        //     viewport: {
        //         getSize: function() {
        //             var w = $(window).width() - $('#jsxc_windowListSB').width();
        //             var h = $(window).height() - $('#header').height() - 10;
        //
        //             if (jsxc.storage.getUserItem('roster') === 'shown') {
        //                 w -= $('#jsxc_roster').outerWidth(true);
        //             }
        //
        //             return {
        //                 width: w,
        //                 height: h
        //             };
        //         }
        //     }
        // });
        //
        // // Autologin feature ... Add submit link without chat functionality
        // if (jsxc.el_exists(jsxc.options.loginForm.form) && jsxc.el_exists(jsxc.options.loginForm.jid) && jsxc.el_exists(jsxc.options.loginForm.pass)) {
        //
        //     var link = $('<a/>').text($.t('Log_in_without_chat')).attr('href', '#').click(function() {
        //         jsxc.submitLoginForm();
        //     });
        //
        //     var alt = $('<p id="jsxc_alt"/>').append(link);
        //     $('#body-login form:eq(0) fieldset').append(alt);
        // }


    });
}(jQuery));


