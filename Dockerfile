FROM node:22-alpine

ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASS=password

WORKDIR /code
RUN npm install

CMD [ "node", "app.js" ]