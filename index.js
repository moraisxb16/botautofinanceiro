const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'transacoes.json');

venom
  .create({
    session: 'cofrinho-session',
    multidevice: true,
    browserArgs: ['--no-sandbox'],
    headless: 'new' // 👈 ESSENCIAL para Chrome novo!
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.error('❌ Erro ao iniciar o bot:', erro);
  });

function start(client) {
  console.log("🤖 Bot iniciado! Escutando mensagens...");

  client.onMessage(async (message) => {
    // ✅ CORREÇÃO para evitar erro com mensagens sem texto
    if (!message.body) return;
    // Ignora mensagens de grupos
    if (message.isGroupMsg) return;

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
