FROM redis:8.2.1-alpine

RUN --mount=type=secret,id=REDIS_PASSWORD,env=REDIS_PASSWORD \
    if [[ -z "$REDIS_PASSWORD" ]]; then \
      echo Password Not Provided ; \
      exit 1 ; \
    fi

RUN --mount=type=secret,id=REDIS_USER,env=REDIS_USER \
    if [[ -z "$REDIS_USER" ]]; then \
        echo User Not Provided; \
        exit 1 ; \
    fi

RUN mkdir -p /usr/local/etc/redis

RUN echo "aclfile /usr/local/etc/redis/users.acl" > /usr/local/etc/redis/redis.conf

RUN --mount=type=secret,id=REDIS_PASSWORD,env=REDIS_PASSWORD \
    --mount=type=secret,id=REDIS_USER,env=REDIS_USER \
    echo "user ${REDIS_USER} on >${REDIS_PASSWORD} allcommands allkeys" > /usr/local/etc/redis/users.acl; \
    echo "user default off" >> /usr/local/etc/redis/users.acl

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]