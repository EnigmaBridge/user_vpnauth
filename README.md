# OwnCloud User Authenticator

OwnCloud user authentication provider enables to create users / login into the owncloud
using [Enigma Bridge Private Spaces].

With this plugin you don't need any password to log in. 

[Enigma Bridge Private Spaces]: https://enigmabridge.com/spaces.html

## Installation

* Download the app

```bash
cd owncloud/apps
git clone https://github.com/EnigmaBridge/user_vpnauth.git

# change the owner to match web user
chown -R nginx:nginx user_vpnauth
```

* Enable the app, either in the apps or from cli:

```bash
sudo -u nginx php occ app:enable user_vpnauth
```

* Edit `owncloud/config/config.php`

```php
 'user_backends' => 
  array (
    0 => 
    array (
      'class' => 'OC_User_VPNAUTH',
      'arguments' => 
      array (
        0 => '127.0.0.1:32080',
      ),
    ),
  ),
```

