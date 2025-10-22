const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const app = express();
const PORT = process.env.PORT || 3000;

// Прямая ссылка на ваш фон
const BACKGROUND_URL = 'https://drive.google.com/uc?export=download&id=1FTAeLOAaHv2LDNEsx4vD_gZOqZIfeuHd';

app.use(express.json({ limit: '10mb' }));

async function loadImageFromUrl(url) {
  if (!url) throw new Error('Image URL is missing');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  const buffer = await res.buffer();
  return await loadImage(buffer);
}

app.post('/generate', async (req, res) => {
  try {
    const { homeTeam, homeLogo, awayTeam, awayLogo, birthYear } = req.body;

    if (!homeTeam || !awayTeam || !birthYear) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Загружаем фон
    const bgImage = await loadImageFromUrl(BACKGROUND_URL);
    ctx.drawImage(bgImage, 0, 0, width, height);

    // "Наше будущее" — сверху по центру
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.fillText('Наше будущее', width / 2, 50);

    // Названия команд
    const teamNameY = 250;
    const teamLogoY = 350;
    const homeX = width * 0.25;
    const awayX = width * 0.75;
    const vsX = width / 2;

    ctx.font = 'bold 48px Arial';
    ctx.fillText(homeTeam, homeX, teamNameY);
    ctx.fillText(awayTeam, awayX, teamNameY);

    // Логотипы
    const logoSize = 200;
    if (homeLogo) {
      const homeLogoImg = await loadImageFromUrl(homeLogo);
      ctx.drawImage(homeLogoImg, homeX - logoSize / 2, teamLogoY, logoSize, logoSize);
    }
    if (awayLogo) {
      const awayLogoImg = await loadImageFromUrl(awayLogo);
      ctx.drawImage(awayLogoImg, awayX - logoSize / 2, teamLogoY, logoSize, logoSize);
    }

    // "VS" между логотипами
    ctx.font = 'bold 64px Arial';
    ctx.fillText('VS', vsX, teamLogoY + logoSize / 2 - 32);

    // Год рождения — снизу по центру
    ctx.font = 'bold 48px Arial';
    ctx.textBaseline = 'bottom';
    ctx.fillText(birthYear, width / 2, height - 50);

    // Отправляем PNG
    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.set('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});