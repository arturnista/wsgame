# NW Game

## Build docker
docker build . -t nwgame_server
docker run --name="nwgame" -p 5000-5020:5000-5020 -e PROTOCOL='HTTP' -d nwgame_server 

## Config routing
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 5000
