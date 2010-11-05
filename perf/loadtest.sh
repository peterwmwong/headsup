#!/bin/bash

# -----------------------------
# Quick dirty perf test
#   - Fires ~40K/sec in a log
#   - Connect 20 browser clients
# ------------------------------
echo '{"perf":"/tmp/headsupPerfLoadTestLog.txt"}\n' > /tmp/headsupPerfServerMap.json
echo '{}\n' > /tmp/headsupPerfIPMap.json

# Fill append to logfile to a mock logfile every half a second
# Simulates a log stream
node filefiller.js exampleLog.txt /tmp/headsupPerfLoadTestLog.txt 500 &

# Launch HeadsUp! Server
node ../lib/server/app.js /tmp/headsupPerfServerMap.json /tmp/headsupPerfIPMap.json &

# Launch 20 clients
for i in $(seq 0 1 20); do google-chrome 127.0.0.1:8080/headsup.html & done

# ... Check out the memory and cpu usage
