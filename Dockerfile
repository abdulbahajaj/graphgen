#Use ubuntu
FROM ubuntu:18.10

#Set teh work directory to home
WORKDIR ~/

#Add the server files
ADD Server Server

#Update apt-get
RUN apt-get update

#Install python and pip
RUN apt-get install -y python3.6
RUN apt-get install -y python3-pip

#Install requirements
RUN pip3 install --trusted-host pypi.python.org -r Server/requirements.txt

#Install nginx
RUN apt-get install -y nginx

#set nginx configurations
WORKDIR /etc/nginx
COPY nginx.conf nginx.conf

#run nginx
RUN nginx

#Expose port 80 of the docker
EXPOSE 80

#Run gunicorn to keep the docker running and to serve django content
WORKDIR ~/Server/
CMD ["gunicorn","-b","0.0.0.0:8000","-w","4","Server.wsgi"]