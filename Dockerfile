# Dockerfile
FROM nginx:alpine

# Copiar archivos del proyecto
COPY . /usr/share/nginx/html/

# Configurar nginx para single page application
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Usar puerto no privilegiado (>1024)
EXPOSE 8080
