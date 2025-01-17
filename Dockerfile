FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY . .

COPY --from=development /usr/src/app/node_modules ./node_modules

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000/tcp

CMD [ "node", "dist/main.js" ]
