# set variables
DOCKER_USERNAME="eric0023"
BACKEND_IMAGE="$DOCKER_USERNAME/backend"
FRONTEND_IMAGE="$DOCKER_USERNAME/frontend"
TAG="latest"

# build backend
echo "Building backend image..."
cd Backend
docker build -t $BACKEND_IMAGE:$TAG .
cd ..

# build frontend
echo "Building frontend image..."
cd client
docker build -t $FRONTEND_IMAGE:$TAG .
cd ..

# push images
echo "Pushing images to Docker Hub..."
docker push $BACKEND_IMAGE:$TAG
docker push $FRONTEND_IMAGE:$TAG

echo "Done!"