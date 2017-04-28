<?php
/**
 * Copyright (c) 2017 Dusan Klinec <dusan.klinec@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\User_VPNAuth;
use OCP\IConfig;
use OCP\ISession;
use OCP\IURLGenerator;

/**
 * User authentication against a VPN Auth server
 *
 * @category Apps
 * @package  UserExternal
 * @author   Robin Appelman <icewind@owncloud.com>
 * @license  http://www.gnu.org/licenses/agpl AGPL
 * @link     http://github.com/owncloud/apps
 */
class VpnAuthBackend extends BaseBackend implements \OCP\Authentication\IApacheBackend{
    /** @var VpnAuth */
    private $vpnAuth;
    /** @var IConfig */
    private $config;
    /** @var IURLGenerator */
    private $urlGenerator;
    /** @var ISession */
    private $session;

    /**
     * Create new VPN authentication provider
     * @param IConfig $config
     * @param IURLGenerator $urlGenerator
     * @param ISession $session
     * @param string  $host   Hostname or IP of FTP server
     * @param boolean $secure TRUE to enable SSL
     */
    public function __construct(IConfig $config,
                                IURLGenerator $urlGenerator,
                                ISession $session,
                                $host=null,
                                $secure=false) {
        $this->config = $config;
        $this->urlGenerator = $urlGenerator;
        $this->session = $session;

        // If config was not passed, load manually
        if (empty($config)){
            $this->config = \OC::$server->getConfig();
            $this->urlGenerator = \OC::$server->getURLGenerator();
            $this->session = \OC::$server->getSession();
        }

        if (empty($host)){
            $host = $this->config->getAppValue('user_vpnauth', 'auth.host', '127.0.0.1');
            $secure = $this->config->getAppValue('user_vpnauth', 'auth.secure', 'false');
            $secure = 'true' === $secure || '1' === $secure;
        }

        $this->vpnAuth = new VpnAuth($host, $secure);
        parent::__construct('vpn://' . $host);
    }

    /**
     * Returns true if the mobile app is checking
     */
    private function isMobileAppChecking(){
        return (isset($_SERVER['PHP_AUTH_USER']) && empty($_SERVER['PHP_AUTH_USER']));
    }

    /**
     * Check if the password is correct without logging in the user
     *
     * @param string $uid      The username
     * @param string $password The password
     *
     * @return true/false
     */
    public function checkPassword($uid, $password) {
        if ($this->isMobileAppChecking()){
            return false;
        }

        try{
            $decoded = $this->vpnAuth->checkVpnAuth(null);
            if (!$this->vpnAuth->checkResponse($decoded)) {
                return false;
            }

            $this->storeUser($decoded->user->email);
            return $decoded->user->email;

        } catch (AuthServerFailException $e){
            return false;
        }
    }

    /**
     * In case the user has been authenticated by Apache true is returned.
     *
     * @return boolean whether Apache reports a user as currently logged in.
     * @since 6.0.0
     */
    public function isSessionActive()
    {
        if ($this->isMobileAppChecking()){
            return false;
        }

        try{
            $decoded = $this->vpnAuth->checkVpnAuth(null);
            if ($this->vpnAuth->checkResponse($decoded)){
                $this->storeUser($decoded->user->email);
                return true;

            } else {
                return false;
            }

        } catch (AuthServerFailException $e){
            return false;
        }
    }

    /**
     * Creates an attribute which is added to the logout hyperlink. It can
     * supply any attribute(s) which are valid for <a>.
     *
     * @return string with one or more HTML attributes.
     * @since 6.0.0
     */
    public function getLogoutAttribute()
    {
        return null;
    }

    /**
     * Return the id of the current user
     * @return string
     * @since 6.0.0
     */
    public function getCurrentUserId()
    {
        if ($this->isMobileAppChecking()){
            return false;
        }

        try{
            $decoded = $this->vpnAuth->checkVpnAuth(null);
            if ($this->vpnAuth->checkResponse($decoded)){
                $this->storeUser($decoded->user->email);
                return $decoded->user->email;

            } else {
                return false;
            }

        } catch (AuthServerFailException $e){
            return false;
        }
    }

    /**
     * Return the id of the current user
     * @return string
     * @since 6.0.0
     */
    public function checkVpnAuth()
    {
        try{
            $decoded = $this->vpnAuth->checkVpnAuth(null);
            if ($this->vpnAuth->checkResponse($decoded)){
                return $decoded->user;

            } else {
                return false;
            }

        } catch (AuthServerFailException $e){
            return false;
        }
    }

    /**
     * Backend name to be shown in user management
     * @return string the name of the backend to be shown
     * @since 8.0.0
     */
    public function getBackendName()
    {
        return 'user_vpnauth';
    }
}
