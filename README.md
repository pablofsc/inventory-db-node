# API para o Gerenciador de Estoque

Recebe solicitações do projeto <a href='https://github.com/pablofsc/inventory-manager'>inventory-manager</a> e as realiza no banco de dados.<br>
Este projeto deve ser hospedado no Heroku com um banco de dados PostgreSQL devidamente configurado com as seguintes tabelas:

![inventory drawio](https://user-images.githubusercontent.com/69557622/177455433-2be62c8f-11cd-4664-b8a2-485c9b2a21e9.png)

## Principais tecnologias utilizadas

- Node.js com Typescript
- Express.js
- node-postgres para manuseio do banco PostreSQL

## Executar
- `npm i` para instalar as dependências; <br>
- `npm run dev` ou `tsc && node .` para compilar e executar. <br>

## Requisitos
O projeto requer um arquivo `.env` com os seguintes valores:
- `PORT`: porta em que o projeto deve operar (e.g. 3000)
- `DATABASE_URL`: URL do banco de dados

Quando executado no Heroku, estes dados já são providos diretamente à aplicação, portanto o projeto não deve sofrer deploy com as variáveis de ambiente.
