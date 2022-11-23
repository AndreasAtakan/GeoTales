server {
	listen 1804;
	listen [::]:1804;

	root /var/www/html/geotales_admin;

	# Add index.php to the list if you are using PHP
	index index.php index.html index.htm index.nginx-debian.html;

	server_name admin.geotales.io;

	auth_basic "Admin dashboard";
	auth_basic_user_file /etc/nginx/.htpasswd;

	#include /etc/letsencrypt/options-ssl-nginx.conf;

	more_set_headers 'Access-Control-Allow-Origin: *';

	location / { try_files $uri $uri/ =404; }

	# pass PHP scripts to FastCGI server
	location ~ \.php$ {
		include snippets/fastcgi-php.conf;
		fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
	}

	# deny access to .htaccess files, if Apache's document root
	# concurs with nginx's one
	location ~ /\.ht { deny all; }
}
