FROM nginx:1.18.0-alpine
CMD ["nginx", "-g", "daemon off;"]

COPY ./src/static/nginx-docker.conf /etc/nginx/nginx.conf
COPY ./src/static/nginx.types /etc/nginx

RUN ls -l
RUN ls -l ./dist
RUN ls -l ./dist/sandbox
RUN ls -l ./dist/sandbox/browser

COPY ./dist/sandbox /usr/share/nginx/html

COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["sh", "./env.copy.sh"]
