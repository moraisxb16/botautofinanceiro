# Usa a imagem oficial do Node.js
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o restante da aplicação
COPY . .

# Expõe a porta que o Render irá usar
EXPOSE 3000

# Comando para iniciar sua aplicação
CMD ["node", "server.js"]
