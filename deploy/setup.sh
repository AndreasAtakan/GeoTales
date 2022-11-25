#!/bin/sh

# ssh tunnel to database server
# FIRST TRANSFER SSH KEYS TO THE SERVER

echo "
[Unit]
Description=database server tunnel
Requires=network.target network-online.target

[Service]
Type=simple
ExecStart=ssh -o ExitOnForwardFailure=yes -NTL 63333:localhost:5432 ubuntu@db.geotales.io
User=ubuntu

[Install]
WantedBy=multi-user.target
" > /etc/systemd/system/postgres-db-tunnel.service

systemctl daemon-reload
systemctl enable --now postgres-db-tunnel
