FROM nginx:1.18.0-alpine
CMD ["nginx", "-g", "daemon off;"]

RUN ls -l ./metis/browser

COPY ./metis/browser /usr/share/nginx/html
COPY ./env.copy.sh .
RUN chmod 755 ./env.copy.sh
ENTRYPOINT ["sh", "./env.copy.sh"]
