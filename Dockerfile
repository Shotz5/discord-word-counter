FROM node:22-alpine

WORKDIR /code
COPY . .

CMD [ "npm", "run", "dev" ]