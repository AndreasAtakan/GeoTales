server {
	listen 80;
	listen [::]:80;

	server_name forum.geotales.io;

	# SSL configuration
	listen 443 ssl;
	listen [::]:443 ssl;

	ssl_certificate /etc/letsencrypt/live/forum.geotales.io/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/forum.geotales.io/privkey.pem;

	include /etc/letsencrypt/options-ssl-nginx.conf;

	more_set_headers 'Access-Control-Allow-Origin: *';

	# Redirect non-https traffic to https
	if ($scheme != "https") {
		return 301 https://$host$request_uri;
	}

	location / {
		proxy_pass http://unix:/var/discourse/shared/standalone/nginx.http.sock:;
		proxy_set_header Host $http_host;
		proxy_http_version 1.1;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Real-IP $remote_addr;
	}
}

