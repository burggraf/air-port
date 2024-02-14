FROM alpine:latest
RUN apk update && apk add --no-cache \
    unzip \
    ca-certificates \
    curl \
    jq \
    rsync \
    openssh && rm -rf /var/cache/apk/*
COPY ./pocketbase .
COPY ./marmot .
COPY ./nats-server .
COPY ./nats .
COPY ./start.sh .
COPY ./marmot.toml.sample .
RUN mkdir -p /pb/.ssh
COPY ./sshd_config /etc/ssh/sshd_config

EXPOSE 8080 4222 5222 6222 7222 8222

CMD "./start.sh"
