# Clean the dist folder ahead of the sonarqube scan
rm -f -r ./dist

# Set manifest and config files
cd src/static
echo "---" > manifest.yml
echo "applications:" >> manifest.yml
echo "- name: metis-ui-angular-test" >> manifest.yml
echo "  host: metis-ui-angular-test" >> manifest.yml
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
echo "        server_name metis-ui-angular-test.eanadev.org www.metis-ui-angular-test.eanadev.org;" >> nginx.conf
echo "        if (\$http_x_forwarded_proto != \"https\") {" >> nginx.conf
echo "          return 301 https://\$server_name\$request_uri;" >> nginx.conf
echo "        }" >> nginx.conf
echo "        location / {" >> nginx.conf
echo "            try_files \$uri \$uri/ /index.html;" >> nginx.conf
echo "        }" >> nginx.conf
echo "  }" >> nginx.conf
echo "}" >> nginx.conf
cd ../../

cd src/environments
echo "export const apiSettings = {" > apisettings.ts
echo "apiHostCore: 'https://metis-core-rest-test.eanadev.org'," >> apisettings.ts
echo "apiHostAuth: 'https://metis-authentication-rest-test.eanadev.org'," >> apisettings.ts
echo "viewPreview: 'https://metis-preview-portal-test.eanadev.org/portal/en/search?q=edm_datasetName:'," >> apisettings.ts
echo "viewCollections: 'https://metis-publish-portal-test.eanadev.org/portal/en/search?q=edm_datasetName:'" >> apisettings.ts
echo "};" >> apisettings.ts
cd ../../

# install
npm install

export CHROME_BIN="/usr/bin/chromium-browser"
npm test

# Perform the SonarQubre scan. Note: requires npm module 'sonarqube-scanner'
sonar-scanner -Dsonar.host.url=http://jenkins.eanadev.org:9000 -Dsonar.projectKey=eu.europeana.metis:metis-ui-angular -Dsonar.test=src/app -Dsonar.test.inclusions=**/*.spec.ts -Dsonar.sources=src/app -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info

# build
npm run dist

# publish
cd dist/
mkdir -p ${HOME}/.cf/${JOB_NAME} && export CF_HOME=${HOME}/.cf/${JOB_NAME}
set +x && cf login -a ${BLUEMIX_CF_API} -u ${CF_USER} -p ${CF_PASS} -o ${BLUEMIX_CF_ORG} -s test && set -x
sleep 1
cf push --no-route -f manifest.yml
cf map-route metis-ui-angular-test eanadev.org -n metis-ui-angular-test
