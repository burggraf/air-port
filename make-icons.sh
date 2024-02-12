#
# this script requires ImageMagick
# brew install imagemagick
#
# sips is also required, but that should be included with macOS
#
#convert static/icon.svg -resize 400% static/icon-2048.png
sips -Z 512 static/icon-2048.png --out static/icon-1024.png
sips -Z 512 static/icon-2048.png --out static/icon-512.png
sips -Z 384 static/icon-2048.png --out static/icon-384.png
sips -Z 256 static/icon-2048.png --out static/icon-256.png
sips -Z 192 static/icon-2048.png --out static/icon-192.png
sips -Z 180 static/icon-2048.png --out static/icon-180.png
sips -Z 168 static/icon-2048.png --out static/icon-168.png
sips -Z 167 static/icon-2048.png --out static/icon-167.png
sips -Z 152 static/icon-2048.png --out static/icon-152.png
sips -Z 150 static/icon-2048.png --out static/icon-150.png
sips -Z 144 static/icon-2048.png --out static/icon-144.png
sips -Z 128 static/icon-2048.png --out static/icon-128.png
sips -Z 120 static/icon-2048.png --out static/icon-120.png
sips -Z 96 static/icon-2048.png --out static/icon-96.png
sips -Z 64 static/icon-2048.png --out static/icon-64.png
sips -Z 32 static/icon-2048.png --out static/icon-32.png
sips -Z 32 static/icon-2048.png --out static/icon-24.png
sips -Z 32 static/icon-2048.png --out static/icon-16.png
# make apple-touch-icon
sips -Z 180 static/icon-2048.png --out static/apple-touch-icon.png
# make favicons (requires convert, part of ImageMagick)
convert static/icon-16.png static/icon-24.png static/icon-32.png static/icon-64.png static/favicon.ico
sips -Z 128 static/icon-2048.png --out static/favicon.png
