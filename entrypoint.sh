#!/bin/sh

# This script checks if the container is started for the first time.
CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"

# APP_INIT environment variable
# If APP_INIT is set to true, the script will run the initdb script.


if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
    # script that should run only on first startup
    touch /$CONTAINER_FIRST_STARTUP
    
    if [ "$APP_INIT" = "true" ]; then
        echo "Running initdb script..."
        bun run db:migrate:deploy && bun run db:seed;
    fi

    # place your script that you only want to run on first startup.
    bun run db:generate && bun run start
else
    # script that should run the rest of the times (instances where you 
    # stop/restart containers).
    bun run start
fi