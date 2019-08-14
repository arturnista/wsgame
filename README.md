# Mage Arena

## Build docker
docker build . -t magearena_server
docker run --name="magearena" -p 5000-5020:5000-5020 -e PROTOCOL='HTTP' -d magearena_server 

## Config routing
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 5000
