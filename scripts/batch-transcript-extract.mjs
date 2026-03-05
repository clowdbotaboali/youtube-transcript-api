const API_BASE_URL = String(process.env.TRANSCRIPTA_API_BASE_URL || 'https://www.transcripta.tech')
  .trim()
  .replace(/\/+$/, '');
const AUTH_TOKEN = String(process.env.TRANSCRIPTA_AUTH_TOKEN || '').trim();
const DELAY_MS = Number(process.env.TRANSCRIPTA_BATCH_DELAY_MS || 3000);

const VIDEO_QUEUE = [
  {
    label: 'Steve Jobs Stanford',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc'
  },
  {
    label: 'TED Talk',
    url: 'https://www.youtube.com/watch?v=H14bBuluwB8'
  },
  {
    label: 'Y Combinator',
    url: 'https://www.youtube.com/watch?v=rP8bAvqi-EM'
  }
  // Add more items here when needed.
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function shortText(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}...`;
}

async function extractTranscript(item, index, total) {
  const payload = {
    url: item.url,
    youtube_url: item.url
  };

  const response = await fetch(`${API_BASE_URL}/api/transcript/extract`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  const ok = Boolean(response.ok && data?.success);
  const statusLabel = `${index + 1}/${total}`;

  if (!ok) {
    const message =
      data?.error?.message ||
      data?.error ||
      response.statusText ||
      'Unknown extraction error';
    return {
      ok: false,
      status: response.status,
      label: item.label,
      url: item.url,
      message: shortText(message)
    };
  }

  return {
    ok: true,
    status: response.status,
    label: item.label,
    url: item.url,
    videoId: String(data.videoId || '').trim(),
    videoTitle: shortText(data.videoTitle || item.label),
    words: Number(data.wordCount || 0),
    seoSlug: String(data.seoSlug || '').trim()
  };
}

async function main() {
  if (!AUTH_TOKEN) {
    console.error('Missing TRANSCRIPTA_AUTH_TOKEN environment variable.');
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(VIDEO_QUEUE) || VIDEO_QUEUE.length === 0) {
    console.error('VIDEO_QUEUE is empty. Add at least one YouTube URL.');
    process.exitCode = 1;
    return;
  }

  const delay = Number.isFinite(DELAY_MS) ? Math.max(0, Math.floor(DELAY_MS)) : 3000;
  const total = VIDEO_QUEUE.length;
  const startedAt = Date.now();
  const results = [];

  console.log(`Starting transcript batch for ${total} video(s).`);
  console.log(`Base URL: ${API_BASE_URL}`);
  console.log(`Delay between requests: ${delay}ms`);

  for (let i = 0; i < VIDEO_QUEUE.length; i += 1) {
    const item = VIDEO_QUEUE[i];
    console.log(`\n[${i + 1}/${total}] Extracting: ${item.label}`);
    console.log(`URL: ${item.url}`);

    try {
      const result = await extractTranscript(item, i, total);
      results.push(result);

      if (result.ok) {
        console.log(`OK (${result.status}) | videoId=${result.videoId} | words=${result.words} | seoSlug=${result.seoSlug || '-'}`);
      } else {
        console.log(`FAIL (${result.status}) | ${result.message}`);
      }
    } catch (error) {
      const message = shortText(error?.message || error);
      const failed = {
        ok: false,
        status: 0,
        label: item.label,
        url: item.url,
        message
      };
      results.push(failed);
      console.log(`FAIL (network) | ${message}`);
    }

    if (i < VIDEO_QUEUE.length - 1 && delay > 0) {
      console.log(`Waiting ${delay}ms...`);
      await sleep(delay);
    }
  }

  const successCount = results.filter((item) => item.ok).length;
  const failCount = results.length - successCount;
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  console.log('\nBatch completed.');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Duration: ${seconds}s`);

  if (failCount > 0) {
    console.log('\nFailed items:');
    results
      .filter((item) => !item.ok)
      .forEach((item) => {
        console.log(`- ${item.label} | ${item.url} | ${item.message}`);
      });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Unexpected failure in transcript batch script:', error);
  process.exitCode = 1;
});
