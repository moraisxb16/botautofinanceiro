const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // 👈 Permite acesso do frontend (Netlify)

const filePath = path.join(__dirname, 'transacoes.json');
const app = express();
app.use(cors()); // 👈 Libera a API para consumo externo (frontend)

// 🔹 Inicia o bot Venom com ajustes para Render
venom
  .create({
    session: 'cofrinho-session',
    multidevice: true,
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'], // 👈 ESSENCIAL
    headless: 'new'
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.error('❌ Erro ao iniciar o bot:', erro);
  });

// 🔄 Inicia escuta de mensagens
function start(client) {
  console.log("🤖 Bot iniciado! Escutando mensagens...");

  client.onMessage(async (message) => {
    if (!message.body || message.isGroupMsg) return;

    if (message.body.toLowerCase().includes('cofrinho virtual')) {
      console.log("📥 Mensagem recebida:", message.body);

      const resultado = processarMensagem(message.body);
      console.log("✅ Resultado:", resultado);

      salvarTransacao(resultado);

      await client.sendText(
        message.from,
        `✅ Transação capturada:\n${resultado.tipo.toUpperCase()} - R$ ${resultado.valor}\n📋 ${resultado.descricao}`
      );
    }
  });
}

// 🔍 Processa a mensagem e extrai valor, tipo e descrição
function processarMensagem(mensagem) {
  const msg = mensagem.toLowerCase();
  let valor = 0;
  let descricao = '';
  let tipo = 'despesa';

  const match = msg.match(/(\d+[.,]?\d*)/);
  if (match) {
    valor = parseFloat(match[1].replace(',', '.'));
  }

  if (msg.includes('recebi') || msg.includes('ganhei')) {
    tipo = 'receita';
  }

  descricao = msg
    .replace(/cofrinho virtual|recebi|ganhei|gastei|paguei|comprei|[0-9,.]+/gi, '')
    .trim();

  return {
    descricao,
    valor,
    tipo,
    data: new Date().toISOString()
  };
}

// 💾 Salva a transação no arquivo local
function salvarTransacao(transacao) {
  let transacoes = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    try {
      transacoes = JSON.parse(data);
    } catch (e) {
      console.error('⚠️ Erro ao ler JSON existente:', e);
    }
  }

  transacoes.push(transacao);

  fs.writeFileSync(filePath, JSON.stringify(transacoes, null, 2), 'utf-8');
  console.log('💾 Transação salva no arquivo transacoes.json!');
}

// 🌐 Endpoint simples para ver se o bot está online
app.get('/', (req, res) => {
  res.send('🟢 Bot Cofrinho Virtual está online!');
});

// 📤 Endpoint para retornar todas as transações
app.get('/transacoes', (req, res) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    try {
      const transacoes = JSON.parse(data);
      res.json(transacoes);
    } catch (e) {
      res.status(500).json({ erro: 'Erro ao ler transações' });
    }
  } else {
    res.json([]);
  }
});

// 🚀 Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Servidor web iniciado na porta ${PORT}`);
});
