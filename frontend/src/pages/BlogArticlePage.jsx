import SeoMeta from '../components/SeoMeta';

const BLOG_ARTICLES = {
  '/blog/youtube-transcript-generator': {
    path: '/blog/youtube-transcript-generator',
    metaTitle: 'YouTube Transcript Generator: Convert Video to Text | Transcripta AI',
    metaDescription:
      'Use a YouTube transcript generator to convert any video into clean text in seconds. Get faster research, better notes, and searchable content.',
    h1: 'YouTube Transcript Generator: Convert Any Video to Text in Seconds',
    subtitle:
      'A practical guide to generate accurate transcript text from YouTube videos and reuse it for learning, writing, and execution.',
    introduction:
      'A YouTube transcript generator saves hours of manual typing. Instead of replaying a long video and writing notes line by line, you can extract the full text instantly and start working on the actual ideas.',
    problem:
      'Most people waste time pausing and rewinding videos because spoken content is not easy to search. Without a transcript, key points are buried inside a long timeline, and teams cannot quote or reuse information quickly.',
    steps: [
      {
        title: 'Step 1: Copy the YouTube video URL',
        text: 'Open the video you want, copy the link, and keep it ready for extraction.'
      },
      {
        title: 'Step 2: Open the transcript tool',
        text: 'Go to the tool page, paste the URL, and run the extraction flow.'
      },
      {
        title: 'Step 3: Review and reuse the output',
        text: 'Use the generated text for summaries, content repurposing, search indexing, or documentation.'
      }
    ],
    benefits: [
      'Turn long videos into searchable text that you can scan in seconds.',
      'Extract clear notes for study, marketing, or product research.',
      'Reuse transcript text in summaries, articles, and internal knowledge bases.',
      'Reduce context switching by keeping ideas in one written format.'
    ],
    related: [
      '/blog/how-to-get-youtube-transcript',
      '/blog/youtube-video-to-text',
      '/blog/download-youtube-transcript'
    ]
  },
  '/blog/how-to-get-youtube-transcript': {
    path: '/blog/how-to-get-youtube-transcript',
    metaTitle: 'How to Get YouTube Transcript: Simple Step-by-Step Guide',
    metaDescription:
      'Learn how to get YouTube transcript text quickly. Follow a simple process to extract speech from any public YouTube video and use it instantly.',
    h1: 'How to Get YouTube Transcript in 3 Simple Steps',
    subtitle:
      'If you need reliable transcript text from YouTube videos, this workflow gives you a fast and repeatable process.',
    introduction:
      'When people ask how to get YouTube transcript data, they usually need a faster way to review long videos. A direct extraction workflow gives you the text output immediately, without manual copy-paste from subtitles.',
    problem:
      'Getting transcript text manually is inconsistent. Some videos have partial captions, some have none, and the native interface is not built for bulk workflow. This creates delays for creators, analysts, and teams.',
    steps: [
      {
        title: 'Step 1: Pick the target video',
        text: 'Choose the video you want to analyze and copy its URL.'
      },
      {
        title: 'Step 2: Run transcript extraction',
        text: 'Paste the URL into the tool and generate the transcript in one action.'
      },
      {
        title: 'Step 3: Store and process the text',
        text: 'Save the transcript, then summarize or convert it into action items.'
      }
    ],
    benefits: [
      'Get transcript text faster than manual subtitle workflows.',
      'Support better collaboration by sharing one source of truth.',
      'Speed up writing, planning, and knowledge extraction from videos.',
      'Keep a reusable archive of YouTube content in text format.'
    ],
    related: [
      '/blog/youtube-transcript-generator',
      '/blog/extract-subtitles-from-youtube',
      '/blog/youtube-video-to-text'
    ]
  },
  '/blog/extract-subtitles-from-youtube': {
    path: '/blog/extract-subtitles-from-youtube',
    metaTitle: 'Extract Subtitles From YouTube: Fast and Accurate Method',
    metaDescription:
      'Need to extract subtitles from YouTube videos? Use a direct method to capture subtitle text quickly and convert it into useful written content.',
    h1: 'How to Extract Subtitles From YouTube Quickly',
    subtitle:
      'Use a clean workflow to extract subtitles from YouTube and transform spoken content into readable text.',
    introduction:
      'If your goal is to extract subtitles from YouTube for study, translation, or content production, speed and clarity matter. A dedicated extraction tool removes friction and gives you immediate text output.',
    problem:
      'Subtitle panels inside video players are hard to manage at scale. They are not ideal for structured editing, search, or team workflows. Manual extraction also increases errors and missed context.',
    steps: [
      {
        title: 'Step 1: Copy the video link',
        text: 'Take the full URL from the YouTube video where you need subtitle text.'
      },
      {
        title: 'Step 2: Extract subtitle content',
        text: 'Submit the link in the tool and generate subtitle lines as plain text.'
      },
      {
        title: 'Step 3: Clean and repurpose',
        text: 'Edit formatting, then reuse subtitles for summaries, captions, or documentation.'
      }
    ],
    benefits: [
      'Capture subtitle content in a format that is easy to edit and export.',
      'Improve content localization and translation pipelines.',
      'Create faster briefs, highlights, and scripts from video material.',
      'Avoid manual retyping and reduce transcription mistakes.'
    ],
    related: [
      '/blog/how-to-get-youtube-transcript',
      '/blog/download-youtube-transcript',
      '/blog/youtube-transcript-generator'
    ]
  },
  '/blog/youtube-video-to-text': {
    path: '/blog/youtube-video-to-text',
    metaTitle: 'YouTube Video to Text: Convert Videos Into Written Content',
    metaDescription:
      'Convert YouTube video to text for better SEO, research, and documentation. Learn a simple method to turn spoken content into structured text.',
    h1: 'YouTube Video to Text: A Fast Conversion Workflow',
    subtitle:
      'Converting YouTube video to text helps teams search, summarize, and ship content faster with less manual work.',
    introduction:
      'A YouTube video to text workflow makes long-form video content easier to use. Once speech is converted to text, you can quickly search ideas, quote exact lines, and build reusable assets.',
    problem:
      'Video content is rich but difficult to scan. Teams often miss important points because they cannot search inside audio. This slows down learning, execution, and publishing cycles.',
    steps: [
      {
        title: 'Step 1: Select the video source',
        text: 'Pick the YouTube video you want to convert and copy its URL.'
      },
      {
        title: 'Step 2: Generate text from the video',
        text: 'Run extraction in the tool to produce full transcript text.'
      },
      {
        title: 'Step 3: Use text in your workflow',
        text: 'Turn the transcript into summaries, outlines, social posts, or internal docs.'
      }
    ],
    benefits: [
      'Improve SEO by publishing written content based on video insights.',
      'Support faster editorial and research workflows.',
      'Make training material easier to review and reference.',
      'Create structured knowledge from unstructured spoken content.'
    ],
    related: [
      '/blog/youtube-transcript-generator',
      '/blog/how-to-get-youtube-transcript',
      '/blog/extract-subtitles-from-youtube'
    ]
  },
  '/blog/download-youtube-transcript': {
    path: '/blog/download-youtube-transcript',
    metaTitle: 'Download YouTube Transcript: Quick and Practical Guide',
    metaDescription:
      'Download YouTube transcript text in a clean format and use it for writing, analysis, and planning. Follow a fast and simple extraction process.',
    h1: 'Download YouTube Transcript in Minutes',
    subtitle:
      'A simple process to download YouTube transcript text and keep it ready for content, research, and execution use cases.',
    introduction:
      'When you need to download YouTube transcript output, the goal is usually simple: get the spoken content into a clean text file fast. This helps creators and teams move from watching to doing.',
    problem:
      'Manual methods make transcript downloads inconsistent. Formatting can break, timestamps can be messy, and important lines are easy to miss when copied by hand.',
    steps: [
      {
        title: 'Step 1: Prepare the video URL',
        text: 'Copy the target YouTube link before starting extraction.'
      },
      {
        title: 'Step 2: Generate transcript text',
        text: 'Paste the link into the tool and run the transcript extraction.'
      },
      {
        title: 'Step 3: Download or reuse the result',
        text: 'Save the output for reporting, scripts, summaries, or searchable archives.'
      }
    ],
    benefits: [
      'Keep transcript data in a portable format for later use.',
      'Build a documented library of video knowledge.',
      'Accelerate writing and planning with ready-to-use text.',
      'Reduce dependency on manual subtitle copy workflows.'
    ],
    related: [
      '/blog/youtube-transcript-generator',
      '/blog/extract-subtitles-from-youtube',
      '/blog/youtube-video-to-text'
    ]
  }
};

export const BLOG_ARTICLE_PATHS = Object.freeze(Object.keys(BLOG_ARTICLES));

const ARTICLE_SECTION_TITLES = {
  introduction: 'Section 1: Introduction',
  problem: 'Section 2: Explanation of the Problem',
  method: 'Section 3: Step-by-Step Method',
  benefits: 'Section 4: Benefits of Transcripts',
  cta: 'Section 5: Start with the Tool'
};

function BlogArticlePage({ currentPath, theme = 'light' }) {
  const article = BLOG_ARTICLES[currentPath];
  if (!article) return null;

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-700';
  const headingColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const stepCardClass = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const linkClass = isDark
    ? 'font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2'
    : 'font-semibold text-cyan-700 hover:text-cyan-900 underline underline-offset-2';
  const ctaButtonClass = isDark
    ? 'inline-flex items-center rounded-xl px-5 py-2.5 bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 transition'
    : 'inline-flex items-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-black hover:bg-slate-800 transition';

  return (
    <>
      <SeoMeta
        title={article.metaTitle}
        description={article.metaDescription}
        path={article.path}
        robots="index, follow"
        ogType="article"
      />

      <main
        className={`min-h-screen pt-20 ${
          isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
        }`}
        dir="ltr"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className={`rounded-2xl border p-5 sm:p-7 mb-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Published: March 4, 2026</p>
            <h1 className={`text-3xl sm:text-4xl font-black ${headingColor}`}>{article.h1}</h1>
            <p className={`mt-2 text-sm sm:text-base ${textColor}`}>{article.subtitle}</p>
          </header>

          <article className={`rounded-2xl border p-5 sm:p-7 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{ARTICLE_SECTION_TITLES.introduction}</h2>
              <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>
                {article.introduction}{' '}
                Start directly from the{' '}
                <a href="/tool" className={linkClass}>
                  transcript tool
                </a>{' '}
                to get text output from your next video.
              </p>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{ARTICLE_SECTION_TITLES.problem}</h2>
              <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{article.problem}</p>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-3 ${headingColor}`}>{ARTICLE_SECTION_TITLES.method}</h2>
              <div className="space-y-3">
                {article.steps.map((step) => (
                  <div key={step.title} className={`rounded-xl border p-4 ${stepCardClass}`}>
                    <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${headingColor}`}>{step.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{ARTICLE_SECTION_TITLES.benefits}</h2>
              <ul className={`text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5 ${textColor}`}>
                {article.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{ARTICLE_SECTION_TITLES.cta}</h2>
              <p className={`text-sm sm:text-base leading-relaxed mb-4 ${textColor}`}>
                Ready to convert a YouTube link into text right now?
              </p>
              <a href="/tool" className={ctaButtonClass}>
                Generate transcript instantly
              </a>

              <div className="mt-5">
                <h3 className={`text-base sm:text-lg font-extrabold mb-2 ${headingColor}`}>Related guides</h3>
                <ul className={`space-y-1 text-sm sm:text-base ${textColor}`}>
                  {article.related.map((relatedPath) => (
                    <li key={relatedPath}>
                      <a href={relatedPath} className={linkClass}>
                        {BLOG_ARTICLES[relatedPath]?.h1 || relatedPath}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

export default BlogArticlePage;
