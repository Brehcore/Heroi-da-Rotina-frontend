# Etapa 1: Build do Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o resto do código e faz o build de produção
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos compilados da Etapa 1 para o Nginx
# Nota: Se usar Angular 17+, o caminho geralmente termina em /browser. Se for mais antigo, não tem o /browser.
COPY --from=build /app/dist/hero-frontend/browser /usr/share/nginx/html

# Copia o arquivo de configuração de rotas do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]