#!/bin/sh

# ssh tunnel to database server
# FIRST TRANSFER SSH KEYS TO THE SERVER
ssh -o ExitOnForwardFailure=yes -f -N -L 63333:localhost:5432 ubuntu@ec2-13-49-137-26.eu-north-1.compute.amazonaws.com
