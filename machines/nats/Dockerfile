FROM alpine:latest

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    openssh && rm -rf /var/cache/apk/*

COPY ./nats-server .
COPY ./nats .
COPY ./start.sh .
COPY ./nats-server.conf.sample .

EXPOSE 8080 
EXPOSE 4222 
EXPOSE 5222 
EXPOSE 6222 
EXPOSE 7222 
EXPOSE 8222

CMD "./start.sh"

