
> **Note**: If your Dockerfile is not yet created, create one as shown below.

---

## 🐳 Dockerfile Example

Create a file named `Dockerfile` in your project root with the following content:

```Dockerfile
# Use official Node.js image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the app port
EXPOSE 5000

# Run the app
CMD ["node", "index.js"]


> **Note**: If your Dockerfile is not yet created, create one as shown below.

---

## 🐳 Dockerfile Example

Create a file named `Dockerfile` in your project root with the following content:

```Dockerfile
# Use official Node.js image
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the app port
EXPOSE 5000

# Run the app
CMD ["node", "index.js"]

# Steps to Run
# ren dockerfile.txt Dockerfile
#Build Docker Image
# docker build -t mwb-node .
# Run Docker Container
# docker run -p 5000:5000 mwb-node
# Verify Server http://localhost:5000
