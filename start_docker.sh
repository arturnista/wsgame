docker build . -t magearena_server
docker run --name="magearena" -p 5000-5020:5000-5020 -d magearena_server 