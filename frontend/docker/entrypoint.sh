#!/bin/bash
set -e

if [ -f /etc/letsencrypt/live/kadimoja.com/fullchain.pem ]; then
    echo "TLS cert found — using HTTPS config"
    cp /etc/nginx/templates/ssl.conf /etc/nginx/conf.d/default.conf
else
    echo "No TLS cert yet — using HTTP-only config"
    cp /etc/nginx/templates/http.conf /etc/nginx/conf.d/default.conf
fi
