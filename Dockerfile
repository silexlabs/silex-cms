# docker build -t linter .
# docker run -v `pwd`/src:/silex/src --rm linter
FROM node:lts

COPY . /silex
WORKDIR /silex
RUN npm install

CMD ["npm", "run", "lint:fix"]
