const fs = require('fs');

console.log('Configurando VacaFácil Backend...\n');

if (!fs.existsSync('.env')) {
  if (!fs.existsSync('.env.example')) {
    console.error('.env.example não encontrado. Crie o arquivo antes de rodar o setup.');
    process.exit(1);
  }
  console.log('Criando .env a partir de .env.example...');
  fs.copyFileSync('.env.example', '.env');
  console.log('.env criado. Edite o arquivo com suas configurações antes de iniciar.\n');
} else {
  console.log('.env já existe\n');
}

require('dotenv').config();
const database = require('./src/database/database');

database.connect()
  .then(() => {
    console.log('Banco de dados inicializado com sucesso\n');
    console.log('Pronto! Execute:');
    console.log('  npm run dev    - Modo desenvolvimento (nodemon)');
    console.log('  npm start      - Produção');
    console.log('  npm test       - Testes\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha ao inicializar o banco de dados:', error.message);
    process.exit(1);
  });
