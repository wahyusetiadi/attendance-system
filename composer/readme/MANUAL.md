##PRODUCTION:
1. START -> docker compose   --env-file composer/env/production/.env   -f composer/docker-compose.production.yml   up --build -d
2. STOP -> docker compose   --env-file composer/env/production/.env   -f composer/docker-compose.production.yml   down
3. STOP & CLEAR VOLUME -> docker compose   --env-file composer/env/production/.env   -f composer/docker-compose.production.yml down --rmi all --volumes --remove-orphans

##STAGING:
1. START -> docker compose   --env-file composer/env/staging/.env   -f composer/docker-compose.staging.yml   up --build -d
2. STOP -> docker compose   --env-file composer/env/staging/.env   -f composer/docker-compose.staging.yml   down
3. STOP & CLEAR VOLUME -> docker compose   --env-file composer/env/staging/.env   -f composer/docker-compose.staging.yml down --rmi all --volumes --remove-orphans

##DEVELOPMENT:
1. START -> docker compose   --env-file composer/env/development/.env   -f composer/docker-compose.development.yml   up --build -d
2. STOP -> docker compose   --env-file composer/env/development/.env   -f composer/docker-compose.development.yml   down
3. STOP & CLEAR VOLUME -> docker compose   --env-file composer/env/development/.env   -f composer/docker-compose.development.yml down --rmi all --volumes --remove-orphans