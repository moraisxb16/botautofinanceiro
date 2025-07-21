# Usa a imagem oficial do Node.js versão 20
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todos os demais arquivos da aplicação
COPY . .

# Evita o download redundante do Chromium (venom já usa puppeteer-core)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Expõe a porta 3000 que o Render usará
EXPOSE 3000

# Comando para iniciar sua aplicação
CMD ["node", "index.js"]
