#!/bin/sh

# Jeśli token nie został podany w zmiennej środowiskowej, poproś o niego interaktywnie
if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    printf "Enter Cloudflare Tunnel Token (or type 'No' to skip): "
    read input
    
    if [ "$input" != "No" ] && [ "$input" != "no" ] && [ -n "$input" ]; then
        CLOUDFLARE_TUNNEL_TOKEN="$input"
    fi
fi

# Uruchomienie Cloudflare Tunnel w tle, jeśli posiadamy token
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
    echo "Starting Cloudflare Tunnel..."
    cloudflared tunnel run --token "$CLOUDFLARE_TUNNEL_TOKEN" &
else
    echo "Skipping Cloudflare Tunnel setup."
fi

# Uruchomienie Nginx
echo "Starting Nginx..."
exec nginx -g "daemon off;"
