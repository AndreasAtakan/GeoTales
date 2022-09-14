server {
	listen 80;
	listen [::]:80;

	server_name www.geotales.io;

	# SSL configuration
	listen 443 ssl;
	listen [::]:443 ssl;

	ssl_certificate /etc/letsencrypt/live/www.geotales.io/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/www.geotales.io/privkey.pem;

	include /etc/letsencrypt/options-ssl-nginx.conf;

	more_set_headers 'Access-Control-Allow-Origin: *';

	return 301 https://geotales.io$request_uri;
}
