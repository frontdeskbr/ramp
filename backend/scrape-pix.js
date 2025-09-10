const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.options('/scrape', (req, res) => {
  res.sendStatus(200);
});

app.post("/scrape", async (req, res) => {
  const { amountBRL } = req.body;
  console.log("Iniciando scraping para valor:", amountBRL);

  if (!amountBRL) {
    return res.status(400).json({ ok: false, error: "Valor não informado" });
  }

  const browser = await puppeteer.launch({ 
    headless: false,  // Modo visual para debug
    devtools: true    // Abrir devtools
  });
  
  const page = await browser.newPage();
  
  // Configurações para evitar detecção de bot
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    console.log("Navegando para 4p.finance...");
    await page.goto("https://4p.finance/buy", { 
      waitUntil: "networkidle2",
      timeout: 60000  // Aumentar timeout
    });

    // Log de todos os elementos na página
    const allElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.trim()
      }));
    });
    console.log("Elementos na página:", JSON.stringify(allElements, null, 2));

    // Tentar fechar modal/aviso
    try {
      const buttons = await page.$$('button');
      for (let button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes("Estou ciente") || text.includes("Fechar"))) {
          await button.click();
          break;
        }
      }
    } catch (modalError) {
      console.log("Erro ao fechar modal:", modalError);
    }

    // Logs de debugging para cada etapa
    console.log("Tentando selecionar blockchain...");
    const blockchainSelector = await page.$('label:has-text("Rede blockchain")');
    if (blockchainSelector) {
      await blockchainSelector.click();
    } else {
      console.error("Seletor de blockchain não encontrado!");
    }

    console.log("Tentando selecionar Solana...");
    const solanaButton = await page.$('button:has-text("Solana")');
    if (solanaButton) {
      await solanaButton.click();
    } else {
      console.error("Botão de Solana não encontrado!");
    }

    console.log("Preenchendo valor...");
    await page.type("#amountFrom", amountBRL);

    console.log("Clicando em Comprar SOL...");
    const comprarSolButton = await page.$('button:has-text("Comprar SOL")');
    if (comprarSolButton) {
      await comprarSolButton.click();
    } else {
      console.error("Botão de Comprar SOL não encontrado!");
    }

    // Capturar screenshot para debug
    await page.screenshot({ path: 'debug-screenshot.png' });

    // Aguardar e capturar QR Code
    console.log("Aguardando QR Code...");
    await page.waitForSelector('img[src*="qrserver.com"]', { timeout: 30000 });
    
    const qrImg = await page.$('img[src*="qrserver.com"]');
    const qrSrc = await qrImg.evaluate(img => img.src);

    await browser.close();

    res.json({
      ok: true,
      amountBRL,
      qrImage: qrSrc,
      pixCopiaCola: "Código PIX gerado",
      detalhes: {
        valor: amountBRL,
        recebedor: "4p.finance",
        cidade: "Online"
      }
    });

  } catch (error) {
    console.error("Erro completo no scraping:", error);
    await browser.close();
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});