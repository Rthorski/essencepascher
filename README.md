# essencepascher - Guide de démarrage rapide

Ce guide vous aidera à configurer et à exécuter l'application essencepascher localement en utilisant Docker et Docker Compose.

## Prérequis

- Docker: Assurez-vous que Docker est installé et en cours d'exécution sur votre machine. Vous pouvez le télécharger et l'installer depuis le site officiel de Docker: https://www.docker.com/
- Docker Compose: Assurez-vous que Docker Compose est également installé. Vous pouvez le télécharger et l'installer depuis le site officiel de Docker : https://docs.docker.com/compose/install/

## Étapes

### Cloner le dépôt

```
git clone git@github.com:Rthorski/essencepascher.git
cd essencepascher
```

### Configurer les variables d'environnement

- Créer un fichier .env à la racine du projet et un admin vous donnera les variables à inclure dans ce fichier.

### Lancer Airflow

- Aller dans le dossier data, puis exécutez:

```
docker compose up -d
```

### Lancer le frontend, le backend et la base de données

- Revenez à la racine du projet, puis exécutez:

```
docker compose up -d
```

### Accéder aux applications:

- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- Airflow : http://localhost:8081

## Arrêter les conteneurs

Depuis la racine du projet si vous souhaitez couper les conteneurs du frontend, backend et base de données, ou depuis le dossier data si vous souhaitez couper Airflow, la commande est la même:

```
docker compose down
```
