FROM nginx:1.18.0-alpine
CMD ["nginx", "-g", "daemon off;"]

RUN ls -l
RUN ls -l ./dist
RUN ls -l ./dist/metis
RUN ls -l ./dist/metis/browser

COPY ./dist/metis/browser /usr/share/nginx/html
COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["sh", "./env.copy.sh"]
