/**
 * AccessVision PWA – Curated Accessible Reading Library
 *
 * Contains sample full-length articles in English and Urdu,
 * plus support for custom user-pasted text and offline persistence.
 */

export const SAMPLE_ARTICLES = [
  {
    id: 'empowering-web-users',
    title: 'Empowering Visually Impaired Web Users Through Digital Accessibility',
    category: 'Accessibility & Inclusion',
    lang: 'en',
    author: 'AccessVision Accessibility Team',
    date: 'October 2026',
    summary: 'An exploration of modern web accessibility standards, WCAG 2.2 Level AA compliance, and how thoughtful digital interfaces unlock independence.',
    content: `The modern internet has transformed from a static collection of documents into an essential utility for commerce, education, civic engagement, and social connection. Yet for hundreds of millions of people worldwide who live with visual impairments, low vision, color blindness, or situational disabilities, navigating the web often presents significant and frustrating digital barriers.

Digital accessibility is not a luxury or a secondary cosmetic enhancement. It is a fundamental human right rooted in universal design and dignity. When software developers embrace standards such as the Web Content Accessibility Guidelines (WCAG) 2.2 AA, they ensure that every user, regardless of their visual acuity or input method, can access information seamlessly and independently.

Key pillars of accessible web architecture include structured semantic HTML, generous focus indicators, comprehensive alternative text for non-text content, and natural auditory feedback. High contrast color schemes, such as yellow on obsidian black or cyan on midnight slate, provide critical legibility for individuals experiencing macular degeneration or glaucoma.

Furthermore, integrating natural-sounding synthetic speech transforms the reading experience. Rather than enduring harsh, robotic tones that induce cognitive fatigue, users deserve warm, cozy, and articulate narration that makes long-form reading as effortless and engaging as listening to an audiobook.

As we look toward the future, the convergence of machine intelligence and inclusive design will continue to dismantle barriers. AccessVision stands at the forefront of this mission, empowering every user to explore, learn, and thrive with absolute confidence.`
  },
  {
    id: 'urdu-digital-independence',
    title: 'بصارت سے محروم افراد کے لیے ڈیجیٹل رسائی اور خود مختاری',
    category: 'شمولیت اور ٹیکنالوجی',
    lang: 'ur',
    author: 'ایکسیس ویژن ریسرچ گروپ',
    date: 'اکتوبر ۲۰۲۶',
    summary: 'اردو زبان میں ڈیجیٹل رسائی، معاون ٹیکنالوجی اور بصارت سے محروم افراد کے لیے تعلیمی اور پیشہ ورانہ مواقع پر تفصیلی جائزہ۔',
    content: `ڈیجیٹل دور میں معلومات تک فوری اور آسان رسائی ہر انسان کا بنیادی حق ہے۔ تاہم اردو زبان بولنے اور پڑھنے والے بصارت سے محروم افراد کے لیے انٹرنیٹ پر معیاری مواد تک رسائی ایک طویل عرصے سے ایک بڑا چیلنج رہی ہے۔

ایکسیس ویژن اس خلیج کو پاٹنے کے لیے ایک انقلابی قدم ہے۔ روایتی سکرین ریڈرز اکثر اردو زبان کے مخصوص لہجے اور درست تلفظ سے قاصر رہتے ہیں، جس کی وجہ سے سننے والے کو مسلسل الجھن کا سامنا کرنا پڑتا ہے۔ قدرتی اور خوشگوار آواز میں اردو عبارت کی ادائیگی سے نہ صرف فہم آسان ہوتا ہے بلکہ طویل مطالعے کے دوران ذہنی تھکن بھی نہیں ہوتی۔

معاون ٹیکنالوجی نہ صرف تعلیمی میدان میں طلبا کے لیے نئے راستے کھولتی ہے بلکہ دفتری امور اور روزمرہ زندگی میں بھی خود مختاری کا احساس پیدا کرتی ہے۔ ہائی کنٹراسٹ ڈسپلے، واضح فونٹ اور انگلیوں کے اشاروں کے مطابق لچکدار کنٹرولز کم بینائی والے افراد کو بغیر کسی رکاوٹ کے پڑھنے میں مدد دیتے ہیں۔

جب ہم معاشرے کے تمام طبقات کو جدید ترین ڈیجیٹل وسائل سے آراستہ کرتے ہیں، تو پورا معاشرہ ترقی کی نئی منازل طے کرتا ہے۔ ہمارا عزم ہے کہ کوئی بھی فرد معلومات اور علم کی روشنی سے محروم نہ رہے۔`
  },
  {
    id: 'audio-ergonomics',
    title: 'The Science of Audio Ergonomics & Natural Speech Synthesis',
    category: 'Speech Science',
    lang: 'en',
    author: 'Dr. Elena Vance, Cognitive Acoustics',
    date: 'September 2026',
    summary: 'Why cozy, natural voices dramatically reduce cognitive load and listener fatigue during extended screen reader sessions.',
    content: `For daily screen reader users, synthesized voices are not merely a convenience; they represent the primary auditory lens through which the digital universe is perceived. Despite decades of technological progress, many default speech synthesizers still employ harsh formant-based synthesis characterized by metallic resonance and unnatural cadence.

Cognitive acoustics research demonstrates that robotic voices require the human brain to expend substantially greater metabolic energy decoding phonemes. This continuous micro-effort produces auditory fatigue, headaches, and diminished reading comprehension after just thirty minutes of continuous listening.

In contrast, neural and warm concatenative voices preserve micro-intonations, natural pauses, and subtle pitch variations. This natural pacing mimics organic human conversation, allowing the auditory cortex to process information effortlessly.

By offering finely tuned speed adjustments from gentle half-speed narration to rapid skimming, along with responsive sentence highlighting, AccessVision creates an auditory sanctuary tailored for deep focus and comfortable daily reading.`
  },
  {
    id: 'urdu-literature-ai',
    title: 'اردو ادب، جدید ٹیکنالوجی اور مصنوعی ذہانت کا نیا سفر',
    category: 'ادب اور سائنس',
    lang: 'ur',
    author: 'سید دانش علی',
    date: 'ستمبر ۲۰۲۶',
    summary: 'اردو زبان کے تاریخی ادب کو جدید مصنوعی ذہانت اور صوتی ٹیکنالوجی کے ذریعے نابینا افراد کے لیے عام فہم بنانے کا جائزہ۔',
    content: `اردو زبان اپنی شیرینی، وسعت اور ادبی حسن کے لحاظ سے دنیا کی خوبصورت ترین زبانوں میں شمار ہوتی ہے۔ میر، غالب اور اقبال کی شاعری سے لے کر سعادت حسن منٹو اور مشتاق احمد یوسفی کے نثری شاہکاروں تک، اردو ادب فکر و نظر کی دولت سے مالا مال ہے۔

جدید دور میں مصنوعی ذہانت اور ٹیکسٹ ٹو سپیچ ٹیکنالوجی کے امتزاج نے اس ادبی سرمائے کو نابینا افراد کی دسترس میں لا کھڑا کیا ہے۔ نستعلیق رسم الخط کے منفرد اصولوں اور اعراب کو صوتی روپ دینا ایک پیچیدہ مرحلہ تھا، لیکن جدید الگورتھمز نے اسے ممکن بنا دیا ہے۔

اب بصارت سے محروم افراد کسی بھی وقت اپنی پسندیدہ کتاب، مضمون یا خبر کو شائستہ اور قدرتی اردو لہجے میں سن سکتے ہیں۔ صوتی ہدایات کے ذریعے صفحہ پلٹنا، رفتار بڑھانا یا پسندیدہ جملے پر واپس آنا اتنا ہی آسان ہے جتنا کسی ذاتی مددگار سے گفتگو کرنا۔`
  },
  {
    id: 'wcag-quick-reference',
    title: 'WCAG 2.2 AA Practical Reference for Accessible Web Navigation',
    category: 'Developer Guide',
    lang: 'en',
    author: 'W3C Accessibility Working Group Reference',
    date: 'August 2026',
    summary: 'A clear, actionable summary of essential WCAG 2.2 criteria including focus appearance, skip links, contrast ratios, and touch targets.',
    content: `Web Content Accessibility Guidelines version 2.2 introduces refined success criteria specifically aimed at assisting low-vision individuals, cognitive disability users, and mobile device navigators.

Criterion 2.4.11 Focus Appearance mandates that keyboard focus indicators must possess a minimum contrast ratio of 3 to 1 against adjacent colors and span at least a two-pixel thick perimeter around the focused element. This guarantees that motor-impaired and low-vision users never lose track of their keyboard position.

Criterion 2.5.8 Target Size requires interactive controls to occupy an area of at least 24 by 24 CSS pixels, while best practice recommendation for mobile touch interfaces elevates this target to at least 48 by 48 pixels with generous spacing to prevent accidental activations.

Criterion 1.4.3 Contrast (Minimum) requires standard body text to uphold a contrast ratio of at least 4.5 to 1 against its background, with 3 to 1 for large headings. AccessVision goes further by offering high contrast ratios exceeding 15 to 1 in yellow-on-black and cyan-on-black modes.

Implementing these guidelines transforms inaccessible digital mazes into open, welcoming spaces where all people can navigate freely.`
  }
];

export function getArticleById(id) {
  return SAMPLE_ARTICLES.find(a => a.id === id) || SAMPLE_ARTICLES[0];
}

export function saveCustomArticle(title, content, lang = 'en') {
  const newArticle = {
    id: 'custom-' + Date.now(),
    title: title || 'Custom Document (' + new Date().toLocaleDateString() + ')',
    category: 'User Created',
    lang: lang,
    author: 'You',
    date: 'Just now',
    summary: content.slice(0, 120) + '...',
    content: content
  };

  try {
    const existing = JSON.parse(localStorage.getItem('av_custom_articles') || '[]');
    existing.unshift(newArticle);
    localStorage.setItem('av_custom_articles', JSON.stringify(existing));
  } catch (e) {
    console.warn('[sampleLibrary] Failed to persist to localStorage:', e);
  }

  return newArticle;
}

export function getCustomArticles() {
  try {
    return JSON.parse(localStorage.getItem('av_custom_articles') || '[]');
  } catch (e) {
    return [];
  }
}
