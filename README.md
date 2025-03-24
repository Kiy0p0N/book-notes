# Meu Projeto de Livros

![Exemplo de execução](/image/example.gif)

## Descrição
Este é um projeto de um sistema de gerenciamento de livros, onde os usuários podem adicionar, visualizar e deletar livros. O sistema também inclui autenticação de usuários para garantir que apenas um usuário possa gerenciar os livros.

## Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **Node.js**: Plataforma para executar código JavaScript no servidor.
- **Express**: Framework web para Node.js.
- **PostgreSQL**: Banco de dados utilizado para armazenar informações dos livros e usuários.
- **EJS**: Template engine para renderização dinâmica das páginas HTML.
- **Bootstrap**: Framework CSS para estilização das páginas.
- **Axios**: Cliente HTTP para fazer requisições a APIs externas.
- **Bcrypt**: Biblioteca para hash de senhas.
- **Passport**: Middleware para autenticação de usuários.
- **dotenv**: Biblioteca para gerenciamento de variáveis de ambiente.

## Módulos e Suas Funcionalidades

### **Express**
- Usado para criar e gerenciar rotas HTTP.
- Configurado para servir arquivos estáticos e processar formulários.

### **Body-Parser**
- Middleware para processar dados de formulários enviados via POST.

### **pg (node-postgres)**
- Biblioteca para interagir com o banco de dados PostgreSQL.
- Usado para armazenar e recuperar informações de livros e usuários.

### **Axios**
- Utilizado para buscar informações de livros na API OpenLibrary.

### **Bcrypt**
- Utilizado para criptografar senhas antes de armazená-las no banco de dados.

### **Session & Express-Session**
- Gerencia sessões de usuários para manter o estado de autenticação.

### **Passport e Passport-Local**
- Middleware de autenticação.
- Usa a estratégia "local" para autenticar usuários via email e senha.

### **Dotenv**
- Utilizado para carregar variáveis de ambiente a partir de um arquivo `.env`.

## Funcionalidades
- Cadastro de usuário com senhas criptografadas.
- Login e logout de usuários.
- Adição e remoção de livros do banco de dados.
- Busca de livros na API OpenLibrary.
- Listagem de livros ordenados pela nota atribuída.
- Controle de sessão para garantir que apenas um usuário possa adicionar ou remover livros.

## Como Executar o Projeto

### Pré-requisitos

- Node.js instalado
- PostgreSQL configurado

### Passos para execução

1. Clone o repositório:
   ```sh
   git clone https://github.com/Kiy0p0N/book-notes.git
   cd <NOME_DO_REPOSITORIO>
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Configure o banco de dados PostgreSQL:
   ```sql
   CREATE DATABASE book-notes;

   CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password TEXT NOT NULL
   );

   CREATE TABLE books(
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      cover TEXT NOT NULL,
      score INT NOT NULL,
      notes TEXT NOT NULL
   );
   ```
4. Configure as variáveis de ambiente criando um arquivo `.env` e adicionando:
   ```env
   PG_USER=<seu_usuario>
   PG_DATABASE=<seu_banco>
   PG_HOST=<seu_host>
   PG_PASSWORD=<sua_senha>
   PG_PORT=<porta_do_postgres>
   SESSION_SECRET=<chave_secreta>
   ```
5. Inicie o servidor:
   ```sh
   node app.js
   ```
6. Acesse no navegador: `http://localhost:3000`


## Considerações Finais
Este projeto foi desenvolvido com foco no aprendizado de autenticação, criptografia de senhas, conexão com bancos de dados e consumo de APIs externas. Se tiver sugestões de melhorias, fique à vontade para contribuir!

