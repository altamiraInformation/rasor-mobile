# rasor-mobile

Main capabilities:

- Generate RASOR compliant layers
- Upload them to the platform (GeoNode)
- Download them from the platform (GeoNode)

Clone repository to your local folder, 

For build the project for android type the next commands:

Make sure you have the path of android ant and tools of the sdk in your .bashrc:

export PATH=$PATH:/PATH_TO_SDK/android-sdk-linux/tools/ant

export PATH=$PATH:/PATH_TO_SDK/android-sdk-linux/tools

once you have the paths type the next command inside the project directory:

ionic platform add android

Run application in the device:

ionic run android 
