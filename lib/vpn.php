<?php
/**
 * Copyright (c) 2017 Dusan Klinec <dusan.klinec@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

/**
 * User authentication against a VPN Auth server
 *
 * @category Apps
 * @package  UserExternal
 * @author   Robin Appelman <icewind@owncloud.com>
 * @license  http://www.gnu.org/licenses/agpl AGPL
 * @link     http://github.com/owncloud/apps
 */
class OC_User_VPN extends \OCA\user_external\Base implements OCP\Authentication\IApacheBackend{
    private $host;
    private $secure;

    /**
     * Create new VPN authentication provider
     *
     * @param string  $host   Hostname or IP of FTP server
     * @param boolean $secure TRUE to enable SSL
     */
    public function __construct($host, $secure=false) {
        $this->host=$host;
        $this->secure=$secure;
        parent::__construct('vpn://' . $this->host);
    }

    /**
     * Contacts user server, returns user object.
     * Throws exception on non-auth.
     * @param $uid
     * @return decoded json server response
     * @throws AuthServerFailException on network error
     */
    private function checkVpnAuth($uid){
        $proto = $this->secure ? 'https' : 'http';
        $url = '';

        if (!empty($uid)){
            $url = sprintf('%s://%s/api/v1.0/verify?ip=%s&user=%s', $proto, $this->host,
                urlencode($_SERVER['REMOTE_ADDR']), urlencode($uid));
        } else {
            $url = sprintf('%s://%s/api/v1.0/verify?ip=%s', $proto, $this->host,
                urlencode($_SERVER['REMOTE_ADDR']));
        }

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        $curl_response = curl_exec($curl);
        if ($curl_response === false) {
            $info = curl_getinfo($curl);
            curl_close($curl);
            OCP\Util::writeLog(
                'user_external', 'ERROR: vpnclient error: ' . var_export($info),
                OCP\Util::ERROR
            );
            throw new AuthServerFailException();
        }

        curl_close($curl);
        $decoded = json_decode($curl_response);
        return $decoded;
    }

    /**
     * Checks the auth server response
     * @param $decoded
     * @return bool true if response is ok
     */
    private function checkResponse($decoded){
        return !empty($decoded)
            && isset($decoded->result)
            && $decoded->result == true
            && isset($decoded->user)
            && isset($decoded->user->email);
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
        try{
            $decoded = $this->checkVpnAuth(null);
            if (!$this->checkResponse($decoded)) {
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
        try{
            $decoded = $this->checkVpnAuth(null);
            if ($this->checkResponse($decoded)){
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
        try{
            $decoded = $this->checkVpnAuth(null);
            if ($this->checkResponse($decoded)){
                $this->storeUser($decoded->user->email);
                return $decoded->user->email;

            } else {
                return false;
            }

        } catch (AuthServerFailException $e){
            return false;
        }
    }


}
