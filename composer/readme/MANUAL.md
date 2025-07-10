##PRODUCTION:
1. START -> docker compose --env-file composer/env/.env.production -f composer/docker-compose.production.yml up --build -d
2. STOP -> docker compose --env-file composer/env/.env.production -f composer/docker-compose.production.yml down
3. STOP & CLEAR VOLUME -> docker compose --env-file composer/env/.env.production -f composer/docker-compose.production.yml down --rmi all --volumes --remove-orphans