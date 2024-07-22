# Usa una imagen base de Node.js
FROM node:16

# Configura el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que se ejecuta la aplicación
EXPOSE 5000

# Define el comando para iniciar la aplicación
CMD ["node", "server.js"]
