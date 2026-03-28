const fill = (value, fallback) => {
  const text = String(value || '').trim();
  return text || String(fallback || '').trim();
};

function createSection({ titleEn, titleAr, paragraphsEn = [], paragraphsAr = [] }) {
  return {
    title: {
      en: fill(titleEn, 'Section'),
      ar: fill(titleAr, titleEn)
    },
    paragraphs: {
      en: Array.isArray(paragraphsEn) ? paragraphsEn.filter(Boolean) : [],
      ar: Array.isArray(paragraphsAr) && paragraphsAr.length > 0 ? paragraphsAr.filter(Boolean) : (Array.isArray(paragraphsEn) ? paragraphsEn.filter(Boolean) : [])
    }
  };
}

function createInsight({
  slug,
  publishedAt,
  titleEn,
  titleAr,
  summaryEn,
  summaryAr,
  sections = []
}) {
  return {
    slug,
    publishedAt,
    title: {
      en: fill(titleEn, slug),
      ar: fill(titleAr, titleEn)
    },
    summary: {
      en: fill(summaryEn, titleEn),
      ar: fill(summaryAr, summaryEn)
    },
    sections
  };
}

const extraInsights = [
  createInsight({
    slug: 'summarize-long-video-lessons',
    publishedAt: '2026-03-13',
    titleEn: 'How to summarize long video lessons without losing the useful parts',
    summaryEn: 'A simple workflow for turning a long lesson transcript into a compact, useful summary.',
    sections: [
      createSection({
        titleEn: 'Why long lessons are hard to summarize',
        paragraphsEn: [
          'Long educational videos mix key ideas with examples, repetition, and side notes. That makes it hard to see what actually matters after the lesson ends.',
          'If you summarize too early from memory, you usually keep the broad theme but lose the parts you need later when studying or applying the material.'
        ]
      }),
      createSection({
        titleEn: 'A practical workflow',
        paragraphsEn: [
          'Start with the transcript, not the video replay. Split the transcript into sections based on topic changes, then write one sentence for the purpose of each section.',
          'After that, combine the strongest ideas into five to eight takeaway bullets that explain the lesson in plain language.'
        ]
      }),
      createSection({
        titleEn: 'Quality checks',
        paragraphsEn: [
          'Keep definitions, examples, and numbers that change the meaning. Remove repeated explanations that do not add a new decision or insight.',
          'When possible, keep timestamps next to major points so you can jump back to the source quickly.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A good transcript-based summary gives you a compact version of the lesson without removing the parts that matter for later review.',
          'That makes revision faster and makes the lesson easier to share with a classmate, teammate, or client.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'study-from-youtube-transcripts',
    publishedAt: '2026-03-14',
    titleEn: 'How to study from YouTube transcripts instead of passive rewatching',
    summaryEn: 'Use transcripts as study material so you can review ideas actively instead of rewatching everything.',
    sections: [
      createSection({
        titleEn: 'The passive viewing trap',
        paragraphsEn: [
          'Watching a lesson again can feel productive, but passive viewing often creates weak recall. You recognize ideas while watching, yet struggle to explain them later.',
          'A transcript gives you a fixed source that is easier to scan, annotate, search, and turn into study questions.'
        ]
      }),
      createSection({
        titleEn: 'How to convert the transcript into study material',
        paragraphsEn: [
          'Highlight the claims, steps, and definitions that appear repeatedly. These usually form the core of the lesson.',
          'Then rewrite the transcript into short question-and-answer notes so you can test understanding instead of rereading the same text.'
        ]
      }),
      createSection({
        titleEn: 'How to keep the notes useful',
        paragraphsEn: [
          'Remove filler phrases and examples that do not help memory. Keep only the examples that clarify a difficult idea or show a real application.',
          'If a lesson includes formulas, named frameworks, or terminology, keep them exactly as written and verify them before saving your notes.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Studying from transcripts improves recall because the material becomes active. You move from watching to testing and organizing your understanding.',
          'This approach is especially useful when you need to review many lessons in a short time window.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'turn-transcripts-into-revision-notes',
    publishedAt: '2026-03-15',
    titleEn: 'Turn video transcripts into revision notes you can actually review later',
    summaryEn: 'A note workflow for converting long transcripts into clean revision material.',
    sections: [
      createSection({
        titleEn: 'Why revision notes usually fail',
        paragraphsEn: [
          'Most revision notes are written too quickly, too late, or without a stable source. That leaves you with fragments that make sense only on the same day.',
          'A transcript solves that problem because it preserves the lesson in full before you compress it.'
        ]
      }),
      createSection({
        titleEn: 'How to build the notes',
        paragraphsEn: [
          'Start by dividing the transcript into idea blocks. For each block, write one heading and one or two lines that explain the point in your own words.',
          'Then turn the most important blocks into revision cards, each covering one idea, process, or comparison.'
        ]
      }),
      createSection({
        titleEn: 'What to avoid',
        paragraphsEn: [
          'Do not copy the transcript word for word into your notes. Notes should be shorter than the source and easier to review under time pressure.',
          'Avoid mixing several ideas into one card. One note should answer one question or explain one step.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Transcript-based revision notes are easier to trust because they come from a complete source instead of rushed memory.',
          'That reduces the effort needed when exams, reviews, or project handoffs are close.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'build-research-briefs-from-videos',
    publishedAt: '2026-03-16',
    titleEn: 'Build research briefs from video transcripts without losing evidence',
    summaryEn: 'Capture claims, evidence, and open questions from long videos in a reusable research format.',
    sections: [
      createSection({
        titleEn: 'Why research videos are difficult to reuse',
        paragraphsEn: [
          'Interviews, talks, and expert breakdowns often include useful ideas, but the evidence is scattered across long recordings.',
          'Without a transcript, researchers end up relying on memory and broad impressions instead of specific claims.'
        ]
      }),
      createSection({
        titleEn: 'How to structure the brief',
        paragraphsEn: [
          'Use the transcript to capture the main thesis, supporting arguments, examples, and open questions. Treat each category as a separate section in the brief.',
          'When a speaker changes position or qualifies a claim, note that explicitly so the brief reflects the nuance of the source.'
        ]
      }),
      createSection({
        titleEn: 'How to protect quality',
        paragraphsEn: [
          'Separate facts, interpretations, and opinions. The transcript gives you the wording, but your brief should make the category of each statement clear.',
          'Keep timestamps or section references for any claim you may need to quote, verify, or challenge later.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A transcript-based research brief is much easier to share and verify than loose notes from a video.',
          'It becomes a reusable document for later reporting, analysis, or strategic review.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'use-transcripts-for-content-calendars',
    publishedAt: '2026-03-17',
    titleEn: 'Use video transcripts to plan a better content calendar',
    summaryEn: 'Turn one strong transcript into a sequence of content ideas instead of guessing what to publish next.',
    sections: [
      createSection({
        titleEn: 'The planning problem',
        paragraphsEn: [
          'Content teams often know a video contains many publishable ideas, but those ideas stay hidden inside one long asset.',
          'A transcript lets you inspect the asset by theme, question, and quote rather than by rough memory.'
        ]
      }),
      createSection({
        titleEn: 'How to turn the transcript into a calendar',
        paragraphsEn: [
          'First, segment the transcript into themes. Then assign each theme to a format such as article, newsletter, short post, FAQ, or script.',
          'Next, order the ideas by audience need. Simple educational points can come first, while advanced explanations can support later pieces.'
        ]
      }),
      createSection({
        titleEn: 'How to keep the plan useful',
        paragraphsEn: [
          'Do not force every paragraph into a content item. Select only the themes that clearly match a distribution channel or user problem.',
          'Keep the transcript nearby while outlining so each content item stays aligned with the original message.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A transcript-led content calendar reduces planning time and improves thematic consistency across channels.',
          'Instead of treating each publication as a new task, you build a repeatable system from one solid source.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'extract-action-items-from-webinars',
    publishedAt: '2026-03-18',
    titleEn: 'How to extract action items from webinars and online workshops',
    summaryEn: 'Find decisions, responsibilities, and follow-up actions hidden inside long webinar recordings.',
    sections: [
      createSection({
        titleEn: 'Why webinars create messy follow-up',
        paragraphsEn: [
          'Webinars often mix teaching, promotion, questions, and operational details in one stream. That makes follow-up notes messy and incomplete.',
          'A transcript helps separate the useful commitments from the surrounding talk.'
        ]
      }),
      createSection({
        titleEn: 'What to capture',
        paragraphsEn: [
          'Look for commitments, recommendations, next steps, and any statements tied to an owner, a deadline, or a decision.',
          'If the webinar includes audience questions, capture the objections and clarifications because they often become future tasks or FAQ items.'
        ]
      }),
      createSection({
        titleEn: 'How to review the list',
        paragraphsEn: [
          'Make sure each action item can be understood without replaying the webinar. Rewrite vague lines into direct tasks with context.',
          'Separate suggestions from actual decisions so the team knows what is optional and what is already agreed.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Transcript-based action extraction turns a long webinar into a practical follow-up document.',
          'That improves accountability and reduces the time spent asking what was agreed during the session.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'transcript-vs-manual-note-taking',
    publishedAt: '2026-03-19',
    titleEn: 'Transcript vs manual note-taking: the better workflow is using both',
    summaryEn: 'A transcript should not replace note-taking. It should make note-taking more accurate and easier to review.',
    sections: [
      createSection({
        titleEn: 'Why manual notes are not enough',
        paragraphsEn: [
          'Manual notes are fast, but they often miss terminology, examples, and qualifying details that matter later.',
          'When you depend on notes alone, you may keep the theme of a lesson while losing the details needed for action.'
        ]
      }),
      createSection({
        titleEn: 'Why transcripts alone are not enough',
        paragraphsEn: [
          'A full transcript preserves detail, but it is still too long to function as a working note system on its own.',
          'Without filtering and organizing the text, the transcript becomes an archive instead of a usable workspace.'
        ]
      }),
      createSection({
        titleEn: 'The combined workflow',
        paragraphsEn: [
          'Use the transcript as the factual source and your notes as the decision layer. The transcript protects completeness, while notes compress meaning.',
          'Review the transcript after watching, then update your notes with the points that truly matter for understanding or implementation.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'The best workflow is not transcript or notes. It is transcript plus notes, each doing a different job well.',
          'That combination improves recall, reduces errors, and makes later review much easier.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'turn-video-transcripts-into-sops',
    publishedAt: '2026-03-20',
    titleEn: 'Turn video transcripts into SOPs and repeatable internal processes',
    summaryEn: 'A transcript can become the raw material for an internal SOP if you rewrite it into steps, owners, and standards.',
    sections: [
      createSection({
        titleEn: 'Why training videos often stay trapped',
        paragraphsEn: [
          'Teams record training videos to explain a process once, but the knowledge stays inside the recording unless someone watches it from start to finish.',
          'That makes onboarding and repeat work slower than it should be.'
        ]
      }),
      createSection({
        titleEn: 'How to convert the transcript into an SOP',
        paragraphsEn: [
          'Identify the repeated process inside the transcript. Then rewrite it as a clear sequence of steps with inputs, outputs, and responsible roles.',
          'Where the speaker uses stories or examples, keep only the parts that clarify the step or standard.'
        ]
      }),
      createSection({
        titleEn: 'How to make the SOP usable',
        paragraphsEn: [
          'A useful SOP needs start triggers, ownership, and done criteria. Add those details even if the original video does not state them cleanly.',
          'Keep checklists and decision points short so a teammate can follow the document during live work.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Instead of replaying a training video each time, the team gets a document they can follow and improve.',
          'That reduces onboarding time and makes process quality easier to maintain.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'create-newsletters-from-video-lessons',
    publishedAt: '2026-03-21',
    titleEn: 'Create newsletters from video lessons without sounding copied',
    summaryEn: 'Use transcripts to produce clear newsletter angles while keeping the writing original and audience-specific.',
    sections: [
      createSection({
        titleEn: 'Why newsletters from videos often feel weak',
        paragraphsEn: [
          'When a writer tries to cover the full video in one email, the result feels overloaded and generic.',
          'Transcripts work better when they help you select one clear angle instead of copying everything.'
        ]
      }),
      createSection({
        titleEn: 'How to extract a newsletter angle',
        paragraphsEn: [
          'Read the transcript and identify one problem, one thesis, and one practical takeaway worth sending this week.',
          'Use the transcript to support the angle with one quote, one example, or one contrarian point rather than summarizing the entire recording.'
        ]
      }),
      createSection({
        titleEn: 'How to keep the email sharp',
        paragraphsEn: [
          'Give the newsletter a single job. It should either teach, reframe, or invite a reply, not try to do all three equally.',
          'Rewrite the transcript material in your own editorial voice so the newsletter fits your audience and brand.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Transcript-assisted newsletters are faster to write because the research base is already captured.',
          'They also feel more focused because each issue is built around one strong idea instead of a loose recap.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'build-a-personal-learning-library',
    publishedAt: '2026-03-22',
    titleEn: 'Build a personal learning library from transcripts and notes',
    summaryEn: 'A transcript archive becomes much more useful when it is tagged, titled, and reviewed like a real knowledge library.',
    sections: [
      createSection({
        titleEn: 'Why saved videos are not a library',
        paragraphsEn: [
          'A playlist or a folder of bookmarks is not the same as a usable knowledge system. Saved links are hard to search and easy to forget.',
          'A transcript gives each video a text layer that can be indexed, tagged, and summarized.'
        ]
      }),
      createSection({
        titleEn: 'How to organize the library',
        paragraphsEn: [
          'Create a consistent title format for each transcript, then tag it by topic, skill level, output type, and next action.',
          'Add a short summary and one line about why the resource matters so you can find it later without rewatching anything.'
        ]
      }),
      createSection({
        titleEn: 'How to keep the library healthy',
        paragraphsEn: [
          'Review the archive regularly and remove low-value items. A smaller high-quality library is easier to use than a large pile of weak material.',
          'Update tags when a transcript becomes useful for a new project, team, or learning goal.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A personal learning library turns random video consumption into a reusable system you can actually return to.',
          'That compounds the value of every hour you spend learning from video.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'transcript-workflow-for-founders',
    publishedAt: '2026-03-23',
    titleEn: 'A transcript workflow for founders who learn from podcasts and interviews',
    summaryEn: 'Use transcripts to turn founder content into decision memos instead of inspirational noise.',
    sections: [
      createSection({
        titleEn: 'The founder content overload problem',
        paragraphsEn: [
          'Founders consume a lot of podcasts, talks, and interviews, but the useful ideas often disappear after the episode ends.',
          'Without a transcript, the content stays inspirational rather than operational.'
        ]
      }),
      createSection({
        titleEn: 'How to capture useful decisions',
        paragraphsEn: [
          'Extract the transcript and scan for ideas related to product, distribution, hiring, pricing, or operations. Group notes by decision area rather than by episode order.',
          'Write a short memo for each area: what was learned, what assumptions are behind it, and what the team should test.'
        ]
      }),
      createSection({
        titleEn: 'How to stay critical',
        paragraphsEn: [
          'Do not treat every founder quote as universal truth. Separate context-specific advice from principles that genuinely fit your stage and market.',
          'Use the transcript to compare what was actually said against what you thought you heard.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A transcript workflow helps founders convert media consumption into clearer decisions and better internal communication.',
          'That makes each episode more valuable because it feeds an actual operating system, not just motivation.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'transcripts-for-seo-briefs',
    publishedAt: '2026-03-24',
    titleEn: 'Use transcripts to build better SEO briefs from video content',
    summaryEn: 'A transcript can help turn spoken insight into articles, FAQs, and search-focused outlines without losing the original meaning.',
    sections: [
      createSection({
        titleEn: 'Why video ideas do not automatically become search content',
        paragraphsEn: [
          'Strong video material often contains search-worthy ideas, but the structure is optimized for watching rather than searching.',
          'A transcript exposes the exact questions, phrases, and examples that can anchor an SEO brief.'
        ]
      }),
      createSection({
        titleEn: 'How to build the brief',
        paragraphsEn: [
          'Start by marking repeated questions, problem statements, and audience language inside the transcript. These often become headings or FAQ entries.',
          'Then map the transcript themes into a brief with audience, intent, primary angle, supporting sections, and evidence examples.'
        ]
      }),
      createSection({
        titleEn: 'How to protect usefulness',
        paragraphsEn: [
          'Do not publish the transcript as the article. The transcript is source material, while the brief should translate it into a search-friendly structure.',
          'Keep the original meaning and examples, but reorganize them for clarity and reader intent.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Transcript-driven SEO briefs reduce planning time and preserve the strongest language from the source material.',
          'They are especially useful when video is already your main knowledge asset and search is the next distribution layer.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'turn-video-qa-into-faq-pages',
    publishedAt: '2026-03-25',
    titleEn: 'Turn video Q&A sessions into FAQ pages people can actually use',
    summaryEn: 'Group transcript questions into themes and rewrite them into concise FAQ answers for support or marketing pages.',
    sections: [
      createSection({
        titleEn: 'Why Q&A videos are underrated knowledge assets',
        paragraphsEn: [
          'Question-and-answer videos often contain the exact objections and uncertainties users already have.',
          'The problem is that the answers are buried inside a long recording that nobody wants to scan manually.'
        ]
      }),
      createSection({
        titleEn: 'How to build the FAQ',
        paragraphsEn: [
          'Extract the transcript, list all the questions, and group duplicates into one clearer wording. Then rewrite each answer into a concise paragraph or two.',
          'Where a speaker gives a long story before the real answer, keep the story out of the FAQ and focus on the actual resolution.'
        ]
      }),
      createSection({
        titleEn: 'How to improve readability',
        paragraphsEn: [
          'Use plain wording that matches how a user would search or ask support, not the exact wording used in the live session.',
          'Keep source links or timestamps for any answer that may need later verification or legal review.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A transcript-based FAQ page makes hidden support knowledge visible and reusable.',
          'That reduces repetitive questions and gives marketing, product, and support teams a shared answer base.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'transcript-review-before-publishing',
    publishedAt: '2026-03-26',
    titleEn: 'Transcript review checks to run before publishing any transcript page',
    summaryEn: 'A clean transcript page needs one last review for names, numbers, structure, and readability.',
    sections: [
      createSection({
        titleEn: 'Why raw transcripts should not be published as-is',
        paragraphsEn: [
          'Raw transcripts often include filler, repeated phrases, and formatting issues that make the page harder to trust.',
          'Even when the transcript is accurate enough, the published version can still feel low quality if the structure is weak.'
        ]
      }),
      createSection({
        titleEn: 'What to review first',
        paragraphsEn: [
          'Check names, brands, technical terms, and numbers. These are the parts most likely to cause confusion if they are wrong.',
          'Then review heading structure and paragraph length so the page is easier to scan and quote.'
        ]
      }),
      createSection({
        titleEn: 'What to clean up',
        paragraphsEn: [
          'Remove repeated openings, broken transitions, and lines that only exist because of how speech sounds in real time.',
          'If the page includes a summary or highlights, make sure they match the transcript and do not overstate the source.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A short final review makes a major difference in credibility and usability.',
          'It turns the transcript from a raw extraction artifact into a page readers can rely on.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'weekly-learning-review-with-transcripts',
    publishedAt: '2026-03-27',
    titleEn: 'Run a weekly learning review using transcripts instead of scattered bookmarks',
    summaryEn: 'A weekly review helps turn saved videos into retained knowledge and next actions.',
    sections: [
      createSection({
        titleEn: 'Why weekly reviews matter',
        paragraphsEn: [
          'Learning from video compounds only when you revisit and organize what you watched. Otherwise the value fades quickly after consumption.',
          'Transcripts make weekly review easier because you can scan, compare, and tag the material without replaying everything.'
        ]
      }),
      createSection({
        titleEn: 'How to run the review',
        paragraphsEn: [
          'Once a week, gather the transcripts from the videos you watched. Pull out three things: new insights, unresolved questions, and actions worth taking.',
          'Then move those items into your notes, backlog, or study system so they are not trapped in a review doc.'
        ]
      }),
      createSection({
        titleEn: 'How to keep the review lightweight',
        paragraphsEn: [
          'Do not try to review every line again. Focus on the signals that changed how you think, what you need to test, or what you want to remember.',
          'If a transcript produces nothing useful, tag it accordingly and move on. A review should sharpen your system, not slow it down.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A weekly transcript review transforms passive consumption into compounding knowledge.',
          'Over time, it gives you a clearer memory of what you learned and a better record of what actually changed your work.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'create-course-briefs-from-video-transcripts',
    publishedAt: '2026-03-28',
    titleEn: 'Create course briefs from video transcripts for faster onboarding',
    summaryEn: 'Condense a course module transcript into a short brief that helps new learners get oriented quickly.',
    sections: [
      createSection({
        titleEn: 'Why course briefs help',
        paragraphsEn: [
          'New learners often start a course without knowing what matters in each module. A transcript-based brief gives them orientation before the deep watch.',
          'That reduces overwhelm and makes the course easier to navigate.'
        ]
      }),
      createSection({
        titleEn: 'How to write the brief',
        paragraphsEn: [
          'Read the transcript and capture the module goal, the main concepts, the required prerequisites, and the expected outcome.',
          'Keep the brief short enough to read in two minutes while preserving the context needed for the learner to know what to expect.'
        ]
      }),
      createSection({
        titleEn: 'What to include',
        paragraphsEn: [
          'Useful briefs mention what the learner should be able to explain, build, or decide after the module.',
          'If the lesson includes exercises or tools, list them early so the learner can prepare before starting.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Course briefs make onboarding smoother because learners know where the module is going before they invest full attention.',
          'They also make internal training libraries easier to search and maintain.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'transcript-workflow-for-team-handovers',
    publishedAt: '2026-03-29',
    titleEn: 'A transcript workflow for cleaner team handovers after meetings and videos',
    summaryEn: 'Use transcripts to produce better handover notes when a meeting or walkthrough contains too much context to remember.',
    sections: [
      createSection({
        titleEn: 'Why handovers fail',
        paragraphsEn: [
          'Many handovers fail because they rely on broad memory or a few rushed bullets after a long meeting or walkthrough.',
          'Important conditions, decisions, and caveats disappear even when the team feels aligned in the moment.'
        ]
      }),
      createSection({
        titleEn: 'How transcripts improve handovers',
        paragraphsEn: [
          'A transcript gives the outgoing owner a full reference, then the handover note can focus on context, decisions, current status, and next actions.',
          'This is especially useful when a project update includes technical details, stakeholder constraints, and unresolved questions.'
        ]
      }),
      createSection({
        titleEn: 'What the handover note should contain',
        paragraphsEn: [
          'Keep the note organized into current situation, key decisions, open risks, and next actions. Link back to transcript sections only when deeper context is needed.',
          'Avoid copying long transcript blocks into the handover document. Rewrite them into the information the next owner actually needs.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'A transcript-backed handover is easier to trust because the details can be checked against a complete source.',
          'That reduces repeated clarification meetings and makes transitions smoother.'
        ]
      })
    ]
  }),
  createInsight({
    slug: 'use-transcripts-to-spot-repeated-questions',
    publishedAt: '2026-03-30',
    titleEn: 'Use transcripts to spot repeated customer questions across videos',
    summaryEn: 'Repeated questions in transcripts can reveal friction points worth addressing in support, product, or marketing.',
    sections: [
      createSection({
        titleEn: 'Why repeated questions matter',
        paragraphsEn: [
          'When the same question appears across webinars, demos, or onboarding calls, it usually points to friction in messaging, product understanding, or process design.',
          'A transcript makes those patterns visible in a way that memory or isolated notes usually do not.'
        ]
      }),
      createSection({
        titleEn: 'How to find the patterns',
        paragraphsEn: [
          'Collect transcripts from several sessions and mark similar questions or objections. Group them by topic such as pricing, onboarding, outcomes, or technical setup.',
          'Then count the recurring themes so the team can prioritize what needs clearer explanation or a product change.'
        ]
      }),
      createSection({
        titleEn: 'How to use the findings',
        paragraphsEn: [
          'Repeated questions can feed FAQ pages, onboarding copy, sales enablement, and product documentation. They can also reveal where the product itself needs simplification.',
          'Keep the original phrasing nearby because user language is often more useful than internal shorthand.'
        ]
      }),
      createSection({
        titleEn: 'Outcome',
        paragraphsEn: [
          'Transcript analysis turns repeated questions into a visible signal instead of an anecdotal complaint.',
          'That helps teams improve communication and reduce avoidable confusion over time.'
        ]
      })
    ]
  }),
];

export default extraInsights;
