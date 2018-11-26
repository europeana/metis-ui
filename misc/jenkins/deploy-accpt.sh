cd src/static
echo "---" > manifest.yml
echo "applications:" >> manifest.yml
echo "- name: metis-ui-angular-acceptance" >> manifest.yml
echo "  host: metis-ui-angular-acceptance" >> manifest.yml
echo "  buildpack: https://github.com/cloudfoundry/staticfile-buildpack.git" >> manifest.yml
echo "  memory: 64M" >> manifest.yml
echo "  instances: 1" >> manifest.yml
echo "  stack: cflinuxfs2" >> manifest.yml


echo "events {" > nginx.conf
echo "  worker_connections  1024;" >> nginx.conf
echo "}" >> nginx.conf

echo "http {" >> nginx.conf
echo "  server {" >> nginx.conf
echo "        listen <%= ENV[\"PORT\"] %>;" >> nginx.conf
echo "        root /home/vcap/app/public;" >> nginx.conf
echo "        index index.html;" >> nginx.conf
echo "        server_name metis-ui-angular-acceptance.eanadev.org www.metis-ui-angular-acceptance.eanadev.org;" >> nginx.conf
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
echo "apiHostCore: 'https://metis-core-rest-acceptance.eanadev.org'," >> apisettings.ts
echo "apiHostAuth: 'https://metis-authentication-rest-acceptance.eanadev.org'," >> apisettings.ts
echo "viewPreview: 'https://metis-preview-portal-acceptance.eanadev.org/portal/en/search?q=edm_datasetName:'," >> apisettings.ts
echo "viewCollections: 'https://metis-publish-portal-acceptance.eanadev.org/portal/en/search?q=edm_datasetName:'" >> apisettings.ts
echo "};" >> apisettings.ts

cd ../../
npm install
npm run dist
cd dist/

mkdir -p ${HOME}/.cf/${JOB_NAME} && export CF_HOME=${HOME}/.cf/${JOB_NAME}
set +x && cf login -a ${BLUEMIX_CF_API} -u ${CF_USER} -p ${CF_PASS} -o ${BLUEMIX_CF_ORG} -s acceptance && set -x
sleep 1
cf push --no-route -f manifest.yml
cf map-route metis-ui-angular-acceptance eanadev.org -n metis-ui-angular-acceptance
