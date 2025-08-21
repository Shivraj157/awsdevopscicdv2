#!/bin/bash
set -e
# Convert CRLF -> LF and ensure executable perms
apt-get update -y && apt-get install -y dos2unix || true
for f in /opt/codedeploy-agent/deployment-root/**/deployment-archive/scripts/*.sh; do
 [ -f "$f" ] && dos2unix "$f" && chmod +x "$f"
done