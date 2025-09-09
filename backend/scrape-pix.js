const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { amountBRL } = req.body;
  if (!amountBRL) return res.status(400).json({ ok: false, error: "Valor não informado" });

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    await page.goto("https://4p.finance/buy", { waitUntil: "networkidle2" });

    // Fechar aviso, se existir
    try {
      await page.click('button:has-text("Estou ciente")', { timeout: 2000 });
    } catch {}

    // Seleciona Solana
    await page.click('label:has-text("Rede blockchain") + div button');
    await page.waitForSelector('button:has-text("Solana")');
    await page.click('button:has-text("Solana")');

    // Valor
    await page.type("#amountFrom", amountBRL);

    // Comprar SOL
    await page.click('button:has-text("Comprar SOL")');

    // Modal 1
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', "Nelson Junior");
    await page.type('input[name="email"]', "contato.frontdesk@gmail.com");
    await page.type('input[name="phone"], #phone', "+55 11 91307 0770");
    await page.type('input[name="document"], #doc', "419.133.048-92");
    await page.type('input[name="receiverWallet"]', "EBag2tN979uQcYRK9woQdcvvBUE5ArBs72JDchzxVJyF");
    // Aceita termos
    const terms = await page.$('#terms_policies[role="checkbox"]');
    if (terms) await terms.click();
    await page.click('button:has-text("Confirmar dados")');

    // Modal 2
    await page.waitForSelector('button:has-text("Solicitar conversão")');
    await page.click('button:has-text("Solicitar conversão")');

    // Modal 3 (PIX)
    await page.waitForSelector('img[src*="api.qrserver.com"]', { timeout: 30000 });
    const qrImg = await page.$('img[src*="api.qrserver.com"]');
    const qrSrc = await qrImg.evaluate(img => img.src);
    const url = new URL(qrSrc);
    const pix = decodeURIComponent(url.searchParams.get("data") || "");

    await browser.close();

    res.json({
      ok: true,
      amountBRL,
      qrImage: qrSrc,
      pixCopiaCola: pix,
      detalhes: {
        valor: amountBRL,
        recebedor: "NOME DO RECEBEDOR",
        cidade: "SAO PAULO",
      },
    });
  } catch (e) {
    await browser.close();
    res.status(500).json({ ok: false, error: "Erro ao fazer scraping: " + e.message });
  }
});

app.listen(8080, () => {
  console.log("Backend de scraping rodando em http://localhost:8080/scrape");
});