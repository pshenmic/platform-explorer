# available global variables:
#   - REDIS_USER
#   - REDIS_PASSWORD

DEFAULT_REDIS_USER="redis"
DEFAULT_REDIS_PASSWORD="redis"

CONF_FILE_NAME="redis.conf"
CONF_FILE_PATH="./"

USERS_FILE_NAME="users.acl"
USERS_FILE_PATH="./"

if [[ "$REDIS_USER" == "" ]]; then
  echo "REDIS_USER empty, using default user ($DEFAULT_REDIS_USER)"
  REDIS_USER="$DEFAULT_REDIS_USER"
fi

if [[ "$REDIS_PASSWORD" == "" ]]; then
  echo "REDIS_PASSWORD empty, using default user ($DEFAULT_REDIS_PASSWORD)"
  REDIS_PASSWORD="$DEFAULT_REDIS_PASSWORD"
fi

echo "Removing old config"
rm -rf "$CONF_FILE_PATH$CONF_FILE_NAME"
rm -rf "$USERS_FILE_PATH$USERS_FILE_NAME"

echo "Generating new config"

CONF_VALUE="aclfile /usr/local/etc/redis/users.acl"

USERS_VALUE="user $REDIS_USER on >$REDIS_PASSWORD allcommands allkeys"

echo "$CONF_VALUE" > "$CONF_FILE_PATH$CONF_FILE_NAME"
echo "$USERS_VALUE" > "$USERS_FILE_PATH$USERS_FILE_NAME"

echo
echo "DONE"