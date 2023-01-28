# API to test Sitecore CDP functionality

## External APIs

- [Yelp API](https://www.yelp.com/developers/)
- [Geocoding API](https://www.geoapify.com/geocoding-api)
- [Sitecore CDP](https://doc.sitecore.com/cdp/en/developers/sitecore-customer-data-platform--data-model-2-1/index-en.html)

## Databases

- [PostgreSQL](https://www.postgresql.org/about/)

## Caching

- [Redis](https://redis.io/)

## PostgreSQL Tools

- [pgAdmin](https://www.pgadmin.org/)

## API tools

- [Swagger editor](https://editor.swagger.io/)

## Getting started

- Create environnement file in ./config folder based on .env.schema, name it .env.development
- Get api key for to [Yelp](https://docs.developer.yelp.com/docs/fusion-intro) and put it in YELP_KEY in environnement file
- Get api key for [Geocoding API](https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/#about) and put it in GEOAPIFY_URI in environnement file
- Get Sitecore CDP keys by going to your instance and fill all variables which are starting with CDP

## Running solution

- To start all needed containers just run `docker compose up`
- It will start 4 containers:
  - PostgreSQL
  - Redis
  - pgAdmin - management tool for PostgreSQL
  - Swagger Editor - one of the most powerful design tools for developers to define APIs
- To initialize database run
  -- `npm run migrate:postgres:dev`
  -- `npm run prisma:seed:dev`
- To run application
  -- `npm install`
  -- `npm run dev`
  make sure you are authorized with bearer token making API calls

## Usage

- You can connect to the PostgreSQL running in container using pgAdmin which is running in container as well
  - go to `http://localhost:5050/` which is pgAdmin url
    - login to pgAdmin
      - user name: user@domain.com
      - password: secret
    - add PostgreSQL server
      - name: any name you like
      - host name/address: host.docker.internal
      - user name: admin
      - password: postgres
- You can go to Swagger Editor to run APIs
  - go to `http://localhost:8044/`
  - load file API spec from `\backend\src\utils\api`
  - from server dropdown select `http://localhost:3010/api/v1`

## Start containers individually

- Create network `docker network create backend-network`
- PostgreSQL `docker run --rm -p 5433:5432 --network backend-network --name postgres -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=postgres -v /data:/var/lib/postgresql/data -d postgres`
- PGAdmin `docker run --rm --name pgadmin -p 82:80 --network backend-network -e 'PGADMIN_DEFAULT_EMAIL=user@domain.com' -e 'PGADMIN_DEFAULT_PASSWORD=secret' -d dpage/pgadmin4`
- Swagger Editor `docker run --rm -d -p 8044:8080 --network backend-network --name swagger-editor -e SWAGGER_FILE=/src/utils/api/openapi.yml -v ${PWD}/config:/config swaggerapi/swagger-editor`
- Redis `docker run --rm -d -p 6379:6379 --network backend-network -v /data --name redis redis:latest`

## Generate private & public keys

```bash
mkdir config/jwt
$ openssl genpkey -algorithm RSA -aes256 -out config/jwt/private.pem
$ openssl rsa -in config/jwt/private.pem -pubout -outform PEM -out config/jwt/public.pem
```
