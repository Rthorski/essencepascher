# Étape 1 : Construction de l'application Angular
FROM node:22.2-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Étape 2 : Servir l'application avec Nginx
FROM nginx:stable

COPY --from=build /app/dist/front-angular /usr/share/nginx/html

# Copiez votre fichier de configuration Nginx personnalisé si vous en avez un
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80