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

# ETAP 2: Serwowanie aplikacji
FROM nginx:alpine

# Kopiujemy własną konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiujemy zbudowane pliki z pierwszego etapu (katalog dist) do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Port, na którym nasłuchuje Nginx wewnątrz sieci Dockera
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]