FROM nginx:1.18.0
CMD ["nginx", "-g", "daemon off;"]

COPY ./src/static/nginx-docker.conf /etc/nginx/nginx.conf
COPY ./src/static/nginx.types /etc/nginx

COPY ./dist/metis /usr/share/nginx/html

COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["bash", "./env.copy.sh"]
