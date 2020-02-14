PROJECT_ID=digital-ucdavis-edu
CONTAINER_NAME=library-site-checker
IMAGE=gcr.io/$PROJECT_ID/$CONTAINER_NAME

gcloud builds submit --tag $IMAGE

gcloud beta run deploy $CONTAINER_NAME \
  --image $IMAGE \
  --platform managed \
  --memory=1Gi