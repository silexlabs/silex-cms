FROM node:lts

COPY . /silex
WORKDIR /silex
RUN npm install

CMD ["npm", "run", "lint:fix"]
