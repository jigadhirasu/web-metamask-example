FROM nginx:stable-alpine
COPY dist/metamask /usr/share/nginx/html/metamask
COPY drone-ci/server.conf /etc/nginx/conf.d/default.conf
COPY drone-ci/load.sh /bin/load.sh
RUN chmod 755 /bin/load.sh
CMD sh /bin/load.sh

