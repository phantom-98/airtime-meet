# Airtime meeting app

This is a video meeting app built with Next.js. It's live on [https://meet.airtime.com](https://meet.airtime.com).

## Tech Stack

- Typescript
- Next.js 15 (App router)
- Socket.io client
- PeerJS client

## Getting Started

Clone the repository and install npm modules.

- To run dev server
  ```
  npm run dev
  ```
- To build the project
  ```
  npm run build
  ```
- To run prod server after building the project
  ```
  npm start
  ```

## Deployment

Prepare the server (e.g. AWS EC2 instance - ubuntu 24) and make sure your server has nodejs v20+ installed.
Upload the codebase on your server and then install npm modules to run the project.

Install `pm2` globally:
```
npm install -g pm2
```

Run the project as a damon:
```
cd /your-project-root-directory/
npm run build
pm2 start "npm start" --name "frontend"
```
The project will run on the port 3000 by default.

Install `nginx`. (You maybe have more than one project on the server like a backend project. That's why we need `nginx`.)
```
sudo apt install nginx
```
Prepare the ssl certificate including *.crt, *.ca-bundle, *.key.
Here nginx requires chain certificate file. It means that you need to combine the `crt` and `ca-bundle` with one `crt`. You can do it with this command:
```
cat STAR_airtime_com.crt STAR_airtime_com.ca-bundle > STAR_airtime_com_nginx.crt
```

Edit the nginx conf file (`/etc/nginx/sites-available/default`):
```
server {
  server_name         meet.airtime.com;
  listen              443 ssl;

  ssl                 on;
  ssl_certificate        /home/ubuntu/airtime/STAR_airtime_com_nginx.crt;
  ssl_certificate_key    /home/ubuntu/airtime/STAR_airtime_com.key;

  location / {
    proxy_buffering     off;
    proxy_pass          http://localhost:3000/;

	  proxy_http_version  1.1;
	  proxy_set_header    Upgrade $http_upgrade;
	  proxy_set_header    Connection 'upgrade';
	  proxy_set_header    Host $host;
  }
}
```

Restart the nginx service:
```
sudo systemctl restart nginx
```

Make sure your domain is correctly linked the server ip address.
Then your website is live on [https://meet.airtime.com](https://meet.airtime.com).
