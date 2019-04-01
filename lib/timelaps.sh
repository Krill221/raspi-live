#!/bin/env bash
rm ~/camera/temp.mp4
rm ~/camera/timelaps.mp4
rm ~/camera/*.jpg

i=1
while [ true ]; do
 sleep  10
 ffmpeg -y -f video4linux2 -framerate 15 -i /dev/video0 -pix_fmt yuvj422p -s 1920x1080 -an -vframes 1 ~/camera/$(date +%Y-%m-%d-%H-%M-%S).jpg
 find . -mmin +1440 -type f -name "*.jpg" -exec rm -fv {} \;
 echo $(($i%60))
 if [ $(($i%60)) == 0 ]
 then
   i=0
   echo "compile"
   cd ~/camera
   ffmpeg -y -framerate 15 -pattern_type glob -i '*.jpg' -c:v libx264 -r 60  ~/camera/temp.mp4
   cd /usr/local/lib/node_modules/raspi-live/lib
   cp ~/camera/temp.mp4 ~/camera/timelaps.mp4
 fi
 i=$((i+1))
done

