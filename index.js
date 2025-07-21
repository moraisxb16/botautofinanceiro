const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors'); // 👈 Permite acesso de outros domínios como Netlify

const filePath = path.join(__dirname, 'transacoes.json');
const app = express();
app.use(cors()); // 👈 Ativa o CORS para toda a API

// 🔹 Inicia o bot Venom
venom
  .create({
    session: 'cofrinho-session',
    multidevice: true,
    browserArgs: ['--no-sandbox'],
    headless: 'new'
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.error('❌ Erro ao iniciar o bot:', erro);
  });

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

// 🔍 Extrai valor, tipo e descrição
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

// 💾 Salva no arquivo transacoes.json
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

// 🌐 Endpoint simples (para teste)
app.get('/', (req, res) => {
  res.send('🟢 Bot Cofrinho Virtual está online!');
});

// 📤 Endpoint para retornar as transações (para o React buscar)
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
