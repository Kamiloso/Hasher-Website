# ETAP 1: Budowanie aplikacji
FROM node:24-alpine AS build
WORKDIR /app

# Kopiujemy pliki pakietów, by zoptymalizować cache dockera
COPY package.json package-lock.json ./

# Czysta instalacja zależności
RUN npm ci

# Kopiujemy resztę kodu i budujemy aplikację
COPY . .
RUN npm run build

# ETAP 2: Pobranie binarnego pliku Cloudflare Tunnel
FROM cloudflare/cloudflared:latest AS cloudflared

# ETAP 3: Serwowanie aplikacji
FROM nginx:alpine

# Kopiujemy własną konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiujemy zbudowane pliki z pierwszego etapu (katalog dist) do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiujemy plik binarny cloudflared z etapu 2
COPY --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared

# Kopiujemy i nadajemy uprawnienia do skryptu startowego
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Port, na którym nasłuchuje Nginx wewnątrz sieci Dockera
EXPOSE 80

CMD ["/start.sh"]