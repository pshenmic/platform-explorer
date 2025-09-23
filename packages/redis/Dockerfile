FROM redis:8.2.1-alpine
COPY redis.conf /usr/local/etc/redis/redis.conf
COPY users.acl /usr/local/etc/redis/users.acl
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
