server {

        root /var/www/dontownsendcreative.com/html;
        index index.html index.htm index.nginx-debian.html;

        server_name dontownsendcreative.com www.dontownsendcreative.com;

        # trailing slash used for proxy_pass below to filter out original URI path from target path
        # see: https://serverfault.com/a/725433

        location /snek-leaderboard/ {
                proxy_pass http://127.0.0.1:8000/;
                include proxy_params;
        }

        # # apparently proxy_pass does not work for POST requests
        # location ~* ^/snek-leaderboard/ {
        #         rewrite ^/snek-leaderboard/(.*) /$1 break;
        #         # note lack of trailing slash - see: https://serverfault.com/questions/649151/nginx-location-regex-doesnt-work-with-proxy-pass
        #         proxy_pass http://127.0.0.1:8000;
        #         include proxy_params;
        # }

        location / {
                try_files $uri $uri/ =404;
        }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/dontownsendcreative.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dontownsendcreative.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot




}


server {
    if ($host = www.dontownsendcreative.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = dontownsendcreative.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen 80;
        listen [::]:80;

        server_name dontownsendcreative.com www.dontownsendcreative.com;
    return 404; # managed by Certbot




}

