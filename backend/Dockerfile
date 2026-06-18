# Step 1 — Which base to start from
# Like choosing which OS + Node.js version
FROM node:20-alpine

# Step 2 — Where inside the container to put your code
# Like choosing a folder inside the container
WORKDIR /app

# Step 3 — Copy package.json first
# Done separately for speed (Docker caching)
COPY package*.json ./

# Step 4 — Install all dependencies inside container
RUN npm install --production

# Step 5 — Copy the rest of your code
COPY . .

# Step 6 — Tell Docker which port your app uses
EXPOSE 3001

# Step 7 — Command to start your app
CMD ["node", "src/index.js"]