#!/usr/bin/env bash
set -euo pipefail
# H.264 + AAC, square 1080p, 30 fps, with metadata moved to the front.
ffmpeg -y -i output/Feed-Paul-full.webm -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 30 -af "loudnorm=I=-18:TP=-1.5:LRA=11,apad" -shortest -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/Feed-Paul-full.mp4
# A 38-second cut: opening, a later brief, then the final ten seconds and score.
ffmpeg -y -i output/Feed-Paul-full.mp4 -filter_complex '[0:v]trim=0:15,setpts=PTS-STARTPTS[v0];[0:a]atrim=0:15,asetpts=PTS-STARTPTS[a0];[0:v]trim=26:34,setpts=PTS-STARTPTS[v1];[0:a]atrim=26:34,asetpts=PTS-STARTPTS[a1];[0:v]trim=53:68,setpts=PTS-STARTPTS[v2];[0:a]atrim=53:68,asetpts=PTS-STARTPTS[a2];[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]' -map '[v]' -map '[a]' -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart output/Feed-Paul-X.mp4
