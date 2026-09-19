#!/usr/bin/env bash
set -euo pipefail
# H.264 + AAC, square 1080p, 30 fps, with metadata moved to the front.
ffmpeg -y -i output/Feed-Paul-full.webm -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 30 -af "loudnorm=I=-18:TP=-1.5:LRA=11,apad" -shortest -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/Feed-Paul-full.mp4
# Keep the full round for X: countdown, sixty seconds of play, and the result.
cp output/Feed-Paul-full.mp4 output/Feed-Paul-X.mp4
