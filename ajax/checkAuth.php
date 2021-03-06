<?php

header('Content-Type: application/json; charset=utf-8');


// Base App init
$config = \OC::$server->getConfig();
$app = new OCA\User_VPNAuth\AppInfo\Application();

$currentUser = false;
if (OCP\User::isLoggedIn()) {
    $currentUser = \OC::$server->getUserSession()->getUser();
}

// User is not already logged in - check out vpn auth state
$vpnAuth = $app->resolveAuthBackend();
$authState = $vpnAuth->checkVpnAuth();

if ($authState === false){
    if (!empty($currentUser)) {
        echo json_encode(array(
            'state' => 'auth',
            'user' => array(
                'uid' => $currentUser->getUID(),
                'name' => $currentUser->getDisplayName(),
                'email' => $currentUser->getEMailAddress()
            )
        ));
        exit();

    }

    echo json_encode(array(
        'state' => 'unauth'
    ));
    exit();
}

echo json_encode(array(
    'state' => 'vpnauth',
    'user' => $authState,
    'loggedIn' => !empty($currentUser)
));

