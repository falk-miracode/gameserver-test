FROM node:22

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g corepack@0.24.1 && corepack enable
# run this for production
RUN pnpm i --only=production --frozen-lockfile

COPY . .

EXPOSE 2567

CMD [ "pnpm", "start" ]