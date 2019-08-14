docker build . -t magearena_server
docker run --name="magearena" -p 5000-5020:5000-5020 -e PROTOCOL='HTTP' -e MAX_ROOMS=20 -d magearena_server 