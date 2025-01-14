FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]