FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
