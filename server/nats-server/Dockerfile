# Use Alpine Linux as the base image
FROM alpine:latest

# Update and install NATS server
RUN apk update && \
    apk add nats-server

# Copy the NATS server configuration file from your host to the container
# COPY /home/ubuntu/nats-server/nats-server.conf /nats-server/nats-server.conf

# Expose ports (add other ports if needed)
EXPOSE 4222 5222 5223 5224
COPY ./restart-nats-server.sh /
# Set the entrypoint to NATS server with the desired options
ENTRYPOINT ["nats-server"]
CMD ["-c", "/nats-server/nats-server.conf", "--jetstream"]
