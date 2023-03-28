FROM node:latest

WORKDIR /getscratchpad_web

COPY package*.json ./

RUN npm install && \
npm rebuild bcrypt --build-from-source && \
npm cache clean --force

COPY index.js /getscratchpad_web/


EXPOSE 8000

CMD ["npm", "start" ]
