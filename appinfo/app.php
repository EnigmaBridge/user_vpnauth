<?php
OC::$CLASSPATH['OC_User_VPNAUTH']='user_vpnauth/lib/VpnAuthDirectBackend.php';

OCP\Util::addScript('user_vpnauth', 'vpnauth');
OCP\Util::addScript('user_vpnauth', 'ovpnauth');

// App init, backend installation
$config = \OC::$server->getConfig();
$app = new OCA\User_VPNAuth\AppInfo\Application();

$urlGenerator = \OC::$server->getURLGenerator();
$config = \OC::$server->getConfig();
$session = \OC::$server->getSession();
$request = \OC::$server->getRequest();
$userSession = \OC::$server->getUserSession();

$userBackend = new \OCA\User_VPNAuth\VpnAuthBackend(
    $config,
    $urlGenerator,
    $session);

$app->setAuthBackend($userBackend);
OC_User::useBackend($userBackend);

$authApache = $config->getAppValue('user_vpnauth', 'auth.apache', 'false');
if ($authApache === 'true' || $authApache === '1') {
    OC_User::handleApacheAuth();
}


