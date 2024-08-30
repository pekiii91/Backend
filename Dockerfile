FROM node:20 

# Working directory
WORKDIR /app

COPY package*.json ./

# Install dependen
RUN npm install

# Copy all files to your working directory
COPY . .

# The port on which the application is seen
EXPOSE 3000

# The run application
CMD ["npm", "run", "dev"]