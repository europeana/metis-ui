#!/bin/bash

# Set run defaults
CONTEXT=minikube
DELETE=false
APP_IMAGE=
TARGET=local
UTILISATION_AVERAGE_PERCENT=75
PROJECT=metis
DEPLOYMENT_DIR=projects/$PROJECT/deployment

# Set default replicas min / max
MIN_REPLICAS=2
MAX_REPLICAS=4

# Track numnber of arguments supplied
export NUMARGS=$#

# Set variables for help
SCRIPT=`basename ${BASH_SOURCE[0]}`
NORM=`tput sgr0`
BOLD=`tput bold`
REV=`tput smso`

function HELP {
  echo -e \\n"Help documentation for ${BOLD}${SCRIPT}.${NORM}"\\n
  echo -e "${REV}Basic usage:${NORM} ${BOLD}$SCRIPT -i image${NORM}"\\n
  echo "The following optional parameters are recognised:"
  echo "${REV}-c${NORM}  --Sets the ${BOLD}context${NORM}. The default is ${BOLD}${CONTEXT}${NORM}."
  echo "${REV}-d${NORM}  --Sets the ${BOLD}delete${NORM} flag. The default is ${BOLD}${DELETE}${NORM}."
  echo "${REV}-p${NORM}  --Sets the ${BOLD}project${NORM} (sandbox or metis). The default is ${BOLD}${PROJECT}${NORM}."
  echo "${REV}-r${NORM}  --Sets the ${BOLD}replica${NORM} ${BOLD}min-max${NORM}. The default is ${BOLD}${MIN_REPLICAS}-${MAX_REPLICAS}${NORM}."
  echo "${REV}-t${NORM}  --Sets the ${BOLD}target${NORM}. The default is ${BOLD}${TARGET}${NORM}."
  echo "${REV}-u${NORM}  --Sets the desired resource ${BOLD}utilisation${NORM} average. The default is ${BOLD}${UTILISATION_AVERAGE_PERCENT}${NORM}(%)."
  echo -e "${REV}-h${NORM}  --Displays this ${BOLD}help${NORM} message. No further functions are performed."\\n
  echo -e "Example: ${BOLD}$SCRIPT -i dockerhub/myImage:version -d -c myCluster -r 3-12 -t acceptance${NORM}"\\n
  exit 1
}

if [ $NUMARGS -eq 0 ]; then
  HELP
fi

# Check for missing parameter values
while getopts "c:dhp:r:i:t:u:" opt; do
  case $opt in
    d) ;;
    h) ;;
    p) ;;
    *)
      if [ -z "$OPTARG" ];
      then
        # missing option
        exit 1;
      fi
    ;;
  esac
done

# Reset args and override default context / delete / target / image
OPTIND=1
while getopts ":c:dhp:r:i:t:u:" o; do
  case "${o}" in
    c)
      CONTEXT=${OPTARG}
      ;;
    d)
      DELETE=true
      ;;
    h)
      HELP
      ;;
    i)
      APP_IMAGE=${OPTARG}
      ;;
    p)
      PROJECT=${OPTARG}
      ;;
    r)
      ARR=(${OPTARG//-/ })
      MIN_REPLICAS="${ARR[0]}"
      MAX_REPLICAS="${ARR[1]}"
      ;;
    t)
      TARGET=${OPTARG}
      ;;
    u)
      UTILISATION_AVERAGE_PERCENT=${OPTARG}
      ;;
  esac
done

shift $((OPTIND-1))

# Check for unset image
if [ -z "$APP_IMAGE" ];
then
  echo "usage: an image must be set with the -i parameter"
  exit 1;
fi

# Check for invalid project
if ! ([ "$PROJECT" = metis ] || [ "$PROJECT" = sandbox ]); then
  echo "usage: the -p parameter should be a valid project"
  exit 1;
fi

# Check for invalid min-max replicas or an invalid utilisation average
re='^[0-9]+$'
if ! [[ $MIN_REPLICAS =~ $re && $MAX_REPLICAS =~ $re ]] ; then
  echo "usage: the -r parameter should be two integers separated by a dash"
  exit 1;
fi
if [[ $MIN_REPLICAS -gt $MAX_REPLICAS ]] ; then
  echo "usage: the -r parameter should specify a maximimum number of replicas that is greater than or equal to the minimum number"
  exit 1;
fi
if ! [[ $UTILISATION_AVERAGE_PERCENT =~ $re ]] ; then
  echo "usage: the -u parameter should be an integer"
  exit 1;
fi
if [[ $UTILISATION_AVERAGE_PERCENT -gt 100 ]] ; then
  echo $UTILISATION_AVERAGE_PERCENT
  echo "usage: the -u parameter should not be greater than 100"
  exit 1;
fi

echo "Will run deploy with the parameters:"
echo "  - ${BOLD}PROJECT${NORM} = ${PROJECT}"
echo "  - ${BOLD}CONTEXT${NORM} = ${CONTEXT}"
echo "  - ${BOLD}DELETE${NORM} = ${DELETE}"
echo "  - ${BOLD}APP_IMAGE${NORM} = ${APP_IMAGE}"
echo "  - ${BOLD}MAX_REPLICAS${NORM} = ${MAX_REPLICAS}"
echo "  - ${BOLD}MIN_REPLICAS${NORM} = ${MIN_REPLICAS}"
echo "  - ${BOLD}TARGET${NORM} = ${TARGET}"
echo "  - ${BOLD}UTILISATION_AVERAGE_PERCENT${NORM} = ${UTILISATION_AVERAGE_PERCENT}"

# Modify files deployment.yaml and hpa.yaml with variable data
sed -i "s,APP_IMAGE,$APP_IMAGE,g" $DEPLOYMENT_DIR/$TARGET/deployment.yaml
sed -i "s,MAX_REPLICAS,$MAX_REPLICAS,g" $DEPLOYMENT_DIR/$TARGET/hpa.yaml
sed -i "s,MIN_REPLICAS,$MIN_REPLICAS,g" $DEPLOYMENT_DIR/$TARGET/hpa.yaml
sed -i "s,UTILISATION_AVERAGE_PERCENT,$UTILISATION_AVERAGE_PERCENT,g" $DEPLOYMENT_DIR/$TARGET/hpa.yaml

# Delete or apply
if $DELETE;
then
  kubectl --context $CONTEXT delete -k $DEPLOYMENT_DIR/$TARGET/
else
  kubectl --context $CONTEXT apply -k $DEPLOYMENT_DIR/$TARGET/
fi

# Restore files deployment.yaml and hpa.yaml
git checkout $DEPLOYMENT_DIR/$TARGET/deployment.yaml
git checkout $DEPLOYMENT_DIR/$TARGET/hpa.yaml
