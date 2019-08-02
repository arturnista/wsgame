docker build . -t nwgame_server
docker run --name="nwgame" -p 5000-5020:5000-5020 -e PROTOCOL='HTTP' -e MAX_ROOMS=20 -d nwgame_server 