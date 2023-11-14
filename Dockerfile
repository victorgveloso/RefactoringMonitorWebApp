FROM node:6.9.5-wheezy

RUN useradd -m -G sudo angular && npm install webpack@^4 -g && npm install tslint -g #; echo "deb http://archive.debian.org/debian wheezy main" | tee /etc/apt/sources.list; apt-get update; apt-get install --allow-unauthenticated sudo

USER angular

RUN mkdir -p /home/angular/project

WORKDIR /home/angular/project

COPY . /home/angular/project

RUN npm install --production

ENTRYPOINT ["npm","start"]

EXPOSE 8000
