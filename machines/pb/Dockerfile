FROM alpine:latest
ARG PB_VERSION=0.21.3
RUN apk update && apk add --no-cache \
    unzip \
    ca-certificates \    
    rm -rf /var/cache/apk/*
    # curl \
    # jq \
    # rsync \
    # openssh && rm -rf /var/cache/apk/*
#COPY ./pocketbase .
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /
RUN rm /CHANGELOG.md
RUN rm /LICENSE.md
RUN rm /tmp/pb.zip
COPY ./marmot .
#COPY ./nats-server .
COPY ./nats .
COPY ./start.sh .
COPY ./marmot.toml.sample .
# RUN mkdir -p /pb/.ssh
# COPY ./sshd_config /etc/ssh/sshd_config
# COPY ./authorized_keys /pb/.ssh/authorized_keys
COPY ./server .
EXPOSE 8080 2222 4222 5222 6222 7222 8222

CMD "./start.sh"
