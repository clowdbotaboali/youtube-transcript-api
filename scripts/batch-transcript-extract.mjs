const API_BASE_URL = String(process.env.TRANSCRIPTA_API_BASE_URL || 'https://www.transcripta.tech')
  .trim()
  .replace(/\/+$/, '');
const AUTH_TOKEN = String(process.env.TRANSCRIPTA_AUTH_TOKEN || '').trim();
const DELAY_MS = Number(process.env.TRANSCRIPTA_BATCH_DELAY_MS || 3000);

const VIDEO_QUEUE = [
  {
    label: 'TED | Simon Sinek - How Great Leaders Inspire Action',
    url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4'
  },
  {
    label: 'TED | Brene Brown - The Power of Vulnerability',
    url: 'https://www.youtube.com/watch?v=iCvmsMzlF7o'
  },
  {
    label: 'TED | Amy Cuddy - Your Body Language May Shape Who You Are',
    url: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc'
  },
  {
    label: 'TED | Tim Urban - Inside the Mind of a Master Procrastinator',
    url: 'https://www.youtube.com/watch?v=arj7oStGLkU'
  },
  {
    label: 'TED | Sir Ken Robinson - Do Schools Kill Creativity?',
    url: 'https://www.youtube.com/watch?v=iG9CE55wbtY'
  },
  {
    label: 'TED | Susan Cain - The Power of Introverts',
    url: 'https://www.youtube.com/watch?v=c0KYU2j0TM4'
  },
  {
    label: 'YC | The Powerful Alternative To Fine-Tuning',
    url: 'https://www.youtube.com/watch?v=UPGB-hsAoVY'
  },
  {
    label: 'YC | The AI Agent Economy Is Here',
    url: 'https://www.youtube.com/watch?v=Q8wVMdwhlh4'
  },
  {
    label: 'YC | Inside Claude Code With Its Creator Boris Cherny',
    url: 'https://www.youtube.com/watch?v=PQU9o_5rHC4'
  },
  {
    label: 'YC | The New Way To Build A Startup',
    url: 'https://www.youtube.com/watch?v=rWUWfj_PqmM'
  },
  {
    label: 'YC | OpenClaw Creator: Why 80% Of Apps Will Disappear',
    url: 'https://www.youtube.com/watch?v=4uzGDAoNOZc'
  },
  {
    label: 'Startup School | How to Get and Evaluate Startup Ideas',
    url: 'https://www.youtube.com/watch?v=Th8JoIan4dg'
  },
  {
    label: 'Arabic Edu | Nafham - Pre-IGCSE vs IGCSE',
    url: 'https://www.youtube.com/watch?v=x3DCiLwnZvo'
  },
  {
    label: 'Arabic Edu | Nafham - When to Switch Systems?',
    url: 'https://www.youtube.com/watch?v=fpNZMXmiLGk'
  },
  {
    label: 'Arabic Edu | Khan Academy Arabic - Finding an Idea in the Mail',
    url: 'https://www.youtube.com/watch?v=c79MFGAaD70'
  },
  {
    label: 'Arabic Edu | Khan Academy Arabic - Sutton Hoo Ship Burial',
    url: 'https://www.youtube.com/watch?v=msSxZnyS3Bg'
  },
  {
    label: 'Arabic Edu | Droos Online - Rest and Responsibility',
    url: 'https://www.youtube.com/watch?v=v68RcDZzBrg'
  },
  {
    label: 'Arabic Edu | Droos Online Podcast - Identity',
    url: 'https://www.youtube.com/watch?v=1Gqw1QVpiXw'
  },
  {
    label: 'Programming | freeCodeCamp - Learn Python Full Course',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  },
  {
    label: 'Programming | Programming with Mosh - Python Full Course',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc'
  },
  {
    label: 'Programming | freeCodeCamp - Python for Beginners (1 Hour)',
    url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8'
  },
  {
    label: 'Programming | freeCodeCamp - Intro to Programming & CS',
    url: 'https://www.youtube.com/watch?v=zOjov-2OZ0E'
  },
  {
    label: 'Programming | Mosh - JavaScript Course for Beginners',
    url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk'
  },
  {
    label: 'Programming | freeCodeCamp - Git and GitHub Crash Course',
    url: 'https://www.youtube.com/watch?v=RGOj5yH7evk'
  },
  {
    label: 'Marketing | Neil Patel - B2B Client Acquisition',
    url: 'https://www.youtube.com/watch?v=vzYQQR8omqo'
  },
  {
    label: 'Marketing | Ahrefs - How to Pick an SEO Niche',
    url: 'https://www.youtube.com/watch?v=PTe1TAuTXHI'
  },
  {
    label: 'Marketing | Semrush - Toolkits Overview',
    url: 'https://www.youtube.com/watch?v=TNwsfWTb1Hw'
  },
  {
    label: 'Business | Simplilearn - User Research Full Course',
    url: 'https://www.youtube.com/watch?v=xkXaPOb9Qxo'
  },
  {
    label: 'Business | Wharton - Adam Grant (Improv & Decision-Making)',
    url: 'https://www.youtube.com/watch?v=OhknYa7sOhE'
  },
  {
    label: 'Business | Harvard Business Review - McKinsey and AI',
    url: 'https://www.youtube.com/watch?v=hSpem_oGAf0'
  }
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
