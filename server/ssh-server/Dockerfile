FROM alpine:latest

# Install OpenSSH
RUN apk update
RUN apk add --no-cache openssh

# Create directories and set permissions
#RUN mkdir -p /data/home/markb && \
#    chown root:root /data && \
#    chmod 755 /data && \

##RUN adduser -D -h /data/10001 10001

# Set password for the user
##RUN echo "10001:" | chpasswd

# Configure SSHD for SCP/SFTP-only Access
RUN echo 'StrictModes no' >> /etc/ssh/sshd_config
##    echo '' >> /etc/ssh/sshd_config && \
##    echo 'Match User 10001' >> /etc/ssh/sshd_config && \
##    echo 'ChrootDirectory /data/10001' >> /etc/ssh/sshd_config

#RUN echo 'Subsystem sftp internal-sftp' >> /etc/ssh/sshd_config

# Expose SSH port
EXPOSE 22

# Generate host keys (required for SSH)
RUN ssh-keygen -A

COPY ./start.sh .
COPY ./create-user.sh .
COPY ./delete-user.sh .
COPY ./generate-ssh-keys.sh .

RUN ./generate-ssh-keys.sh
# Start SSHD
CMD "./start.sh"

