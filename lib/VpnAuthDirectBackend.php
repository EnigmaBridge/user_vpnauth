<?php
/**
 * Copyright (c) 2017 Dusan Klinec <dusan.klinec@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\User_VPNAuth;

/**
 * User authentication against a VPN Auth server.
 * Usable directly from the cloud config file - setting hostname & secure port.
 *
 * @license  http://www.gnu.org/licenses/agpl AGPL
 * @link     http://github.com/owncloud/apps
 */
class VpnAuthDirectBackend extends VpnAuthBackend {
    /**
     * Create new VPN authentication provider
     *
     * @param string  $host   Hostname or IP of FTP server
     * @param boolean $secure TRUE to enable SSL
     */
    public function __construct($host, $secure=false) {
        parent::__construct(null, null, null, $host, $secure);
    }
}