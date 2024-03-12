FROM golang:1.21.3 as builder

WORKDIR /src/litestream
COPY . .

ARG LITESTREAM_VERSION=latest

RUN --mount=type=cache,target=/root/.cache/go-build \
	--mount=type=cache,target=/go/pkg \
	go build -ldflags "-s -w -X 'main.Version=${LITESTREAM_VERSION}' -extldflags '-static'" -tags osusergo,netgo,sqlite_omit_load_extension -o /usr/local/bin/litestream ./cmd/litestream

FROM alpine:latest
COPY --from=builder /usr/local/bin/litestream /usr/local/bin/litestream
ARG PB_VERSION=0.22.2
RUN apk update && apk add --no-cache \
    unzip \
    ca-certificates \
    openssh \
    rsync \
    curl 
    # jq \
    # openssh && rm -rf /var/cache/apk/*
#COPY ./pocketbase .
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /
RUN rm /CHANGELOG.md
RUN rm /LICENSE.md
RUN rm /tmp/pb.zip
#RUN adduser -h /pb/home/user -D user
#RUN mkdir -p /pb/home/user/.ssh
COPY ./marmot .
#COPY ./nats-server .
COPY ./nats .
COPY ./start.sh .
COPY ./marmot.toml.sample .
COPY ./reset_marmot.sh .
COPY ./start_litestream.sh .
COPY ./start_marmot.sh .
COPY ./stop_litestream.sh .
COPY ./stop_marmot.sh .
COPY ./add-key.sh .

# RUN mkdir -p /pb/.ssh
COPY ./sshd_config /etc/ssh/sshd_config
# COPY ./authorized_keys /pb/.ssh/authorized_keys
# COPY ./server .
# COPY ./sslh .
EXPOSE 8080 2222 3222 4222 5222 6222 7222 8222

CMD "./start.sh"
