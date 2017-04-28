<?php

namespace OCA\User_VPNAuth\AppInfo;

use OCA\User_VPNAuth\VpnAuthBackend;
use OCP\AppFramework\App;
use OCP\AppFramework\IAppContainer;

class Application extends App {

	private static $config = [];
	private $authBackend;

	public function __construct(array $urlParams=array()){
		parent::__construct('user_vpnauth', $urlParams);
		$container = $this->getContainer();

		/** @var $config \OCP\IConfig */
		$configManager = $container->query('OCP\IConfig');

        $container->registerService('VpnAuthBackend', function(IAppContainer $c){
            return new VpnAuthBackend(
                $c->query('OCP\IConfig'),
                $c->query('OCP\IURLGenerator'),
                $c->query('OCP\ISession')
            );
        });

	}

    /**
     * Resolves auth backend. Either currently set or created dynamically.
     * @return VpnAuthBackend
     */
	public function resolveAuthBackend(){
        if (!empty($this->authBackend)){
            return $this->authBackend;
        }

        return $this->getContainer()->query('VpnAuthBackend');
    }

    /**
     * @return VpnAuthBackend
     */
    public function getAuthBackend()
    {
        return $this->authBackend;
    }

    /**
     * @param VpnAuthBackend $authBackend
     */
    public function setAuthBackend($authBackend)
    {
        $this->authBackend = $authBackend;
    }

}