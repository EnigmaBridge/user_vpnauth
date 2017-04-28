<?php
/**
 * Copyright (c) 2017 Dusan Klinec <dusan.klinec@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\User_VPNAuth;

/**
 * VPN Auth engine
 */
class VpnAuth {
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
    }

    /**
     * Contacts user server, returns user object.
     * Throws exception on non-auth.
     * @param $uid
     * @return decoded json server response
     * @throws AuthServerFailException on network error
     */
    public function checkVpnAuth($uid){
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
            \OCP\Util::writeLog(
                'user_external', 'ERROR: vpnclient error: ' . var_export($info),
                \OCP\Util::ERROR
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
    public function checkResponse($decoded){
        return !empty($decoded)
            && isset($decoded->result)
            && $decoded->result === true
            && isset($decoded->user)
            && isset($decoded->user->email);
    }
}
