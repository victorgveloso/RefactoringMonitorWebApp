FROM node:6.9.5-wheezy

RUN useradd -m -G sudo angular && npm install webpack@^4 -g && npm install tslint -g #; echo "deb http://archive.debian.org/debian wheezy main" | tee /etc/apt/sources.list; apt-get update; apt-get install --allow-unauthenticated sudo

USER angular

RUN mkdir -p /home/angular/project

WORKDIR /home/angular/project

COPY tslint.json tsconfig.json protractor.conf.js package.json karma.conf.js angular-cli.json /home/angular/project/

RUN npm install --production

COPY src e2e .gitignore .editorconfig Dockerfile README.md /home/angular/project/

ENTRYPOINT ["npm","start"]

EXPOSE 8000
