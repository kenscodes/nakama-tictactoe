#!/bin/sh
echo "Initiating Database Migrations..."
/nakama/nakama migrate up --database.address ${DB_URL}?sslmode=disable
echo "Booting Nakama Server..."
exec /nakama/nakama --config /nakama/data/local.yml --database.address ${DB_URL}?sslmode=disable
