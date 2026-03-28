import { LANG } from '../utils/lang.js';
import extraInsights from './extraInsights.js';

const INSIGHTS = [
  {
    slug: 'youtube-transcript-workflow-for-teams',
    publishedAt: '2026-03-10',
    title: {
      ar: 'نظام تفريغ يوتيوب للفرق: من الرابط إلى نتائج قابلة للتطبيق',
      en: 'YouTube transcript workflow for teams: from link to actionable output'
    },
    summary: {
      ar: 'خارطة عملية لبناء سير عمل واضح لاستخراج التفريغ وتحويله لملخص ومهام قابلة للتطبيق داخل الفريق.',
      en: 'A practical workflow to extract transcripts and turn them into summaries and actionable tasks.'
    },
    sections: [
      {
        title: {
          ar: 'المشكلة الشائعة في الفرق',
          en: 'The common team problem'
        },
        paragraphs: {
          ar: [
            'أغلب الفرق تتعامل مع الفيديو كمرجع طويل وصعب الرجوع له، فتضيع القرارات والمهام داخل دقائق غير موثقة. النتيجة: معرفة مشتتة وتأخر في التطبيق.',
            'سير العمل الصحيح يبدأ بتحويل الفيديو إلى نص قابل للبحث، ثم تلخيصه، ثم ربطه بمهام واضحة ومواعيد ومسؤوليات.'
          ],
          en: [
            'Teams often rely on long videos that are hard to search and reference. Decisions and action items get lost, which slows implementation.',
            'A healthy workflow turns the video into searchable text, then a summary, then concrete tasks with owners and timelines.'
          ]
        }
      },
      {
        title: {
          ar: 'خطوات عملية قابلة للتطبيق',
          en: 'A practical step-by-step flow'
        },
        paragraphs: {
          ar: [
            '1) اجمع الرابط وحدد الغرض: متابعة، تدريب، بحث، أو مراجعة قرار. وضوح الغرض يحدد شكل الملخص.',
            '2) استخرج التفريغ النصي بالكامل واحفظه ضمن مساحة معرفة مشتركة. النص هو المصدر المرجعي الأساسي.',
            '3) أنشئ ملخصًا تنفيذيًا من 5–8 نقاط. ركّز على القرارات والنتائج وليس السرد.',
            '4) حوّل الملخص إلى مهام: كل نقطة تتحول إلى إجراء واحد على الأقل مع مسؤول وموعد.',
            '5) أرفق الروابط الزمنية داخل الفيديو بجانب أهم النقاط لتسهيل المراجعة.'
          ],
          en: [
            '1) Capture the link and define the purpose: training, research, review, or decision-making.',
            '2) Extract the full transcript and store it in a shared knowledge base.',
            '3) Create an executive summary of 5–8 bullets focused on decisions and outcomes.',
            '4) Convert each summary point into tasks with owners and deadlines.',
            '5) Attach time-stamped references for quick verification.'
          ]
        }
      },
      {
        title: {
          ar: 'مؤشرات جودة قبل مشاركة الملخص',
          en: 'Quality checks before sharing'
        },
        paragraphs: {
          ar: [
            'تأكد أن الملخص لا يحتوي تفاصيل ثانوية، وأن كل نقطة مرتبطة بهدف واضح.',
            'راجع وجود مصطلحات غامضة أو مختصرات بلا تعريف، خاصة إذا كان الفريق متعدد التخصصات.',
            'قارن الملخص بالتفريغ للتأكد من عدم إسقاط قرار رئيسي أو شرط مهم.'
          ],
          en: [
            'Make sure the summary avoids secondary details and ties each point to a clear objective.',
            'Clarify vague terms or abbreviations, especially for cross-functional teams.',
            'Cross-check against the transcript to ensure no critical decision is missed.'
          ]
        }
      },
      {
        title: {
          ar: 'النتيجة',
          en: 'Outcome'
        },
        paragraphs: {
          ar: [
            'بهذا الأسلوب يتحول الفيديو من محتوى طويل إلى نظام معرفة مختصر، مع مهام قابلة للتطبيق وسهلة القياس.',
            'الفرق التي تتبع هذا النموذج تقلل وقت المتابعة وتزيد وضوح المسؤوليات، وهو ما ينعكس على سرعة الإنجاز.'
          ],
          en: [
            'This approach transforms a long video into a compact knowledge system with actionable tasks.',
            'Teams using this model reduce follow-up time and improve accountability and speed.'
          ]
        }
      }
    ]
  },
  {
    slug: 'transcript-quality-checklist',
    publishedAt: '2026-03-11',
    title: {
      ar: 'قائمة فحص جودة التفريغ قبل الاعتماد عليه',
      en: 'Transcript quality checklist before you rely on it'
    },
    summary: {
      ar: 'قائمة مختصرة لتقييم جودة التفريغ النصي، وتقليل الأخطاء التي تؤثر على القرارات.',
      en: 'A concise checklist to validate transcript quality and avoid decision-making errors.'
    },
    sections: [
      {
        title: {
          ar: 'لماذا الجودة مهمة؟',
          en: 'Why quality matters'
        },
        paragraphs: {
          ar: [
            'تفريغ منخفض الجودة يعني قرارات مبنية على معلومات ناقصة أو مغلوطة. هذا يضر بالمحتوى، بالتسويق، وبالقرارات التشغيلية.',
            'قبل اعتماد أي تفريغ، طبّق فحصًا سريعًا لتقليل المخاطر.'
          ],
          en: [
            'Low-quality transcripts lead to decisions based on incorrect or incomplete information.',
            'A quick quality check reduces risk before you rely on the content.'
          ]
        }
      },
      {
        title: {
          ar: 'قائمة الفحص السريعة',
          en: 'The quick checklist'
        },
        paragraphs: {
          ar: [
            '1) التوقيت: هل النص يغطي كامل الفيديو بدون فجوات؟',
            '2) الأسماء والمصطلحات: هل الأسماء الصحيحة ظاهرة أم تم تشويهها؟',
            '3) الأرقام والنسب: هل الأرقام دقيقة؟ راجع المقاطع التي تحتوي أرقامًا.',
            '4) العلامات الانتقالية: هل يبدأ كل مقطع منطقيًا ويعكس انتقالًا واضحًا في الموضوع؟',
            '5) اللغة: هل توجد جمل غير مفهومة تحتاج إعادة صياغة؟'
          ],
          en: [
            '1) Coverage: does the transcript span the full video without gaps?',
            '2) Names and terminology: are proper nouns and key terms intact?',
            '3) Numbers and metrics: verify critical numeric details.',
            '4) Topic transitions: do sections reflect logical shifts in the talk?',
            '5) Clarity: flag unclear sentences for revision.'
          ]
        }
      },
      {
        title: {
          ar: 'متى تعيد الاستخراج؟',
          en: 'When to re-extract'
        },
        paragraphs: {
          ar: [
            'إذا ظهرت أخطاء متكررة في المصطلحات أو انقطاعات كبيرة، أعد الاستخراج أو جرّب مصدرًا بديلًا.',
            'أما إذا كانت الأخطاء طفيفة فيمكن تصحيحها يدويًا ضمن الملخص.'
          ],
          en: [
            'If you see repeated terminology errors or large gaps, re-extract or try an alternative source.',
            'Minor issues can be fixed manually in the summary.'
          ]
        }
      },
      {
        title: {
          ar: 'النتيجة',
          en: 'Outcome'
        },
        paragraphs: {
          ar: [
            'باتباع هذه القائمة تقلّل الأخطاء وتزيد الثقة في القرارات المبنية على التفريغ.',
            'اجعل الفحص خطوة ثابتة قبل مشاركة أي ملخص أو تقرير.'
          ],
          en: [
            'This checklist reduces errors and builds confidence in transcript-based decisions.',
            'Make it a standard step before sharing summaries or reports.'
          ]
        }
      }
    ]
  },
  {
    slug: 'repurpose-transcripts-into-content',
    publishedAt: '2026-03-12',
    title: {
      ar: 'تحويل تفريغ الفيديو إلى محتوى تسويقي وتعليمي',
      en: 'Repurpose transcripts into marketing and learning content'
    },
    summary: {
      ar: 'طريقة عملية لتحويل التفريغ إلى مقالات، رسائل بريدية، ومحتوى شبكات اجتماعية.',
      en: 'A practical method to turn transcripts into articles, emails, and social content.'
    },
    sections: [
      {
        title: {
          ar: 'ابدأ بتحديد زاوية واحدة',
          en: 'Start with a single angle'
        },
        paragraphs: {
          ar: [
            'لا تحاول تحويل الفيديو كله إلى مقال واحد. اختر زاوية واحدة مرتبطة بهدف واضح: شرح مفهوم، أو دراسة حالة، أو إجابة سؤال شائع.',
            'التركيز على زاوية واحدة يسهّل الكتابة ويزيد جودة المحتوى.'
          ],
          en: [
            'Avoid turning the entire video into one article. Pick a single angle aligned with a clear goal.',
            'Focus improves clarity and content quality.'
          ]
        }
      },
      {
        title: {
          ar: 'هيكل التحويل المقترح',
          en: 'Suggested structure'
        },
        paragraphs: {
          ar: [
            '1) مقدمة قصيرة تربط المشكلة بالحل.',
            '2) 3–5 نقاط أساسية مأخوذة من التفريغ.',
            '3) مثال عملي أو دراسة حالة قصيرة.',
            '4) خاتمة مع دعوة واضحة للفعل.'
          ],
          en: [
            '1) A short intro connecting the problem to the solution.',
            '2) 3–5 core points extracted from the transcript.',
            '3) A short example or case study.',
            '4) A conclusion with a clear call to action.'
          ]
        }
      },
      {
        title: {
          ar: 'تحويل التفريغ إلى قنوات متعددة',
          en: 'Multi-channel repurposing'
        },
        paragraphs: {
          ar: [
            'من نفس التفريغ يمكنك إخراج: مقال طويل، بريد أسبوعي، سلسلة منشورات قصيرة، وسكريبت فيديو مختصر.',
            'احفظ نفس الرسالة الرئيسية واجعل صياغة كل قناة مناسبة لطبيعتها.'
          ],
          en: [
            'From the same transcript you can generate: a long article, a weekly email, short social posts, and a short video script.',
            'Keep the core message consistent, but tailor the tone to each channel.'
          ]
        }
      },
      {
        title: {
          ar: 'النتيجة',
          en: 'Outcome'
        },
        paragraphs: {
          ar: [
            'التركيز على إعادة الاستخدام يحسّن العائد من كل فيديو ويقلّل تكلفة الإنتاج.',
            'ابدأ بمقال واحد في الأسبوع ثم وسّع القنوات تدريجيًا.'
          ],
          en: [
            'Repurposing improves ROI per video and reduces production cost.',
            'Start with one article per week, then expand to other channels.'
          ]
        }
      }
    ]
  },
  ...extraInsights
];

const INSIGHTS_BY_SLUG = new Map(INSIGHTS.map((item) => [item.slug, item]));

const normalizeLang = (value) => (value === LANG.ar || value === LANG.fr || value === LANG.en ? value : LANG.en);

const pickLocalized = (value, lang) => {
  if (!value || typeof value !== 'object') return '';
  const normalized = normalizeLang(lang);
  return value[normalized] || value[LANG.en] || '';
};

export function getInsightBySlug(slug = '') {
  return INSIGHTS_BY_SLUG.get(String(slug || '').trim()) || null;
}

export function getInsightPaths() {
  return INSIGHTS.map((item) => `/insights/${item.slug}`);
}

export function mapInsightForLang(item, lang) {
  const normalized = normalizeLang(lang);
  return {
    ...item,
    title: pickLocalized(item.title, normalized),
    summary: pickLocalized(item.summary, normalized),
    sections: item.sections.map((section) => ({
      title: pickLocalized(section.title, normalized),
      paragraphs: section.paragraphs?.[normalized] || section.paragraphs?.[LANG.en] || []
    }))
  };
}

export default INSIGHTS;
