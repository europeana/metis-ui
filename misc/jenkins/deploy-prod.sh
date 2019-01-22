APP_NAME=metis-ui-angular-production
cd src/static
echo "---" > manifest.yml
echo "applications:" >> manifest.yml
echo "- name: ${APP_NAME}" >> manifest.yml
echo "  host: ${APP_NAME}" >> manifest.yml
echo "  buildpack: https://github.com/cloudfoundry/staticfile-buildpack.git" >> manifest.yml
echo "  memory: 64M" >> manifest.yml
echo "  instances: 2" >> manifest.yml
echo "  stack: cflinuxfs2" >> manifest.yml


echo "events {" > nginx.conf
echo "  worker_connections  1024;" >> nginx.conf
echo "}" >> nginx.conf

echo "http {" >> nginx.conf
echo "  server {" >> nginx.conf
echo "        listen <%= ENV[\"PORT\"] %>;" >> nginx.conf
echo "        root /home/vcap/app/public;" >> nginx.conf
echo "        index index.html;" >> nginx.conf
echo "        server_name metis.europeana.eu www.metis.europeana.eu ${APP_NAME}.eanadev.org www.${APP_NAME}.eanadev.org;" >> nginx.conf
echo "        if (\$http_x_forwarded_proto != \"https\") {" >> nginx.conf
echo "          return 301 https://\$server_name\$request_uri;" >> nginx.conf
echo "        }" >> nginx.conf
echo "        location / {" >> nginx.conf
echo "            try_files \$uri \$uri/ /index.html;" >> nginx.conf
echo "        }" >> nginx.conf
echo "  }" >> nginx.conf
echo "}" >> nginx.conf

cd ../../src/environments
echo "export const apiSettings = {" > apisettings.ts
echo "apiHostCore: 'https://metis-core-rest-production.eanadev.org'," >> apisettings.ts
echo "apiHostAuth: 'https://metis-authentication-rest-production.eanadev.org'," >> apisettings.ts
echo "viewPreview: 'https://metis-preview-portal.eanadev.org/portal/en/search?q=edm_datasetName:'," >> apisettings.ts
echo "viewCollections: 'https://metis-publish-portal.eanadev.org/portal/en/search?q=edm_datasetName:'" >> apisettings.ts

echo "};" >> apisettings.ts

cd ../../
npm install
npm run dist
cd dist/

mkdir -p ${HOME}/.cf/${JOB_NAME} && export CF_HOME=${HOME}/.cf/${JOB_NAME}
set +x && cf login -a ${BLUEMIX_CF_API} -u ${CF_USER} -p ${CF_PASS} -o ${BLUEMIX_CF_ORG} -s production && set -x
sleep 1
cf push --no-route -f manifest.yml
cf map-route ${APP_NAME} eanadev.org -n ${APP_NAME}
cf map-route ${APP_NAME} europeana.eu -n metis
