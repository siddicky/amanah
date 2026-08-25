import type { DetectorId, Lang } from "./types";

export const DETECTOR_ORDER: DetectorId[] = [
  "injection",
  "replay",
  "liveness",
  "lighting",
  "temporal",
  "document",
];

export const copy = {
  en: {
    product: "Amanah",
    tagline: "Onboarding you can trust",
    tenant: "Noor Wallet",
    track: "Financial inclusion · Pakistan",
    scoreLabel: "Resilience score",
    lastAssessed: "Last assessed",
    run: "Run assessment",
    viewReport: "View report",
    threats: "Threat model",
    pitch: "Judge walkthrough",
    home: "Home",
    assess: "Assess",
    disclaimer:
      "Defensive scoring only. Amanah does not generate synthetic faces, forged documents, or camera-injection payloads.",
    scenarios: {
      "inclusion-field": {
        name: "Field capture",
        blurb: "Android Go, open shade, Karachi. The inclusion case — keep the door open without lowering KYC.",
        context: "Noor Wallet · low-end Android",
      },
      "lab-control": {
        name: "Lab control",
        blurb: "Even light, native camera, operator present. Baseline for a healthy capture channel.",
        context: "Controlled environment",
      },
      "hostile-channel": {
        name: "Hostile channel",
        blurb: "Capture path exhibits virtual-camera signals. A defender must fail closed.",
        context: "Injection suspected",
      },
    },
    modeSim: "Simulated suite",
    modeLive: "Live camera",
    begin: "Begin eight-second suite",
    beginLive: "Open camera and score",
    scanning: "Scoring capture channel",
    done: "Assessment complete",
    overall: "Overall",
    findings: "Findings",
    harden: "Hardening actions",
    notes: "Inclusion note",
    noCam:
      "Camera is unavailable in this environment. The simulated suite is the judge-safe path and scores the same detectors.",
    camDenied: "Camera permission denied. Falling back to the simulated suite.",
    liveHint: "Your face stays on this device. Nothing is uploaded. No synthetic media is produced.",
    detectors: {
      injection: {
        name: "Injection channel",
        short: "Virtual camera / media insert",
        defend: "Detects virtual or substituted capture devices from the channel itself — labels, capabilities, and transport — without emitting an injector.",
      },
      replay: {
        name: "Replay / still",
        short: "Looped video or printed photo",
        defend: "Looks for missing micro-motion and periodic frame correlation that a live person almost never produces.",
      },
      lighting: {
        name: "Illumination",
        short: "Lighting manipulation",
        defend: "Scores exposure flatness, sudden luma jumps, and torch-less outdoor shade — common on inclusion-grade phones.",
      },
      temporal: {
        name: "Temporal integrity",
        short: "Frame-rate tamper",
        defend: "Measures delivered FPS against the native camera clock. Stretched or dropped streams lose score.",
      },
      document: {
        name: "Document bind",
        short: "Selfie vs ID consistency",
        defend: "Checks capture quality and bind readiness. Does not generate or alter identity documents.",
      },
      liveness: {
        name: "Passive liveness",
        short: "Presence and micro-movement",
        defend: "Confirms a live subject from natural motion and photometric flicker — no challenge-response circus.",
      },
    } satisfies Record<DetectorId, { name: string; short: string; defend: string }>,
    bands: { strong: "Hold", watch: "Watch", fail: "Fail closed" },
    pitchSlides: [
      {
        kicker: "The problem",
        title: "Digital onboarding is now the fraud door.",
        body: "Branchless wallets are how Pakistan banks the underserved. The same selfie+CNIC flow is being hit by injection and replay at industrial scale. Tighten blindly and you lock out Android Go. Loosen blindly and you onboard ghosts.",
      },
      {
        kicker: "The constraint",
        title: "Inclusion cannot mean weaker KYC.",
        body: "A rural capture in open shade is not an attack. A virtual camera on a rooted handset is. Amanah separates those two so Noor Wallet can keep the door open.",
      },
      {
        kicker: "The product",
        title: "Score the channel. Never build the weapon.",
        body: "Six defensive detectors — injection, replay, liveness, lighting, temporal integrity, document bind. No synthetic faces. No forged IDs. No camera-feed injectors. A hardening report the operator can act on.",
      },
      {
        kicker: "The proof",
        title: "Eight seconds. A number the judge can trust.",
        body: "Run the field-capture suite. Read the weakest control. If lighting is the gap, assist the user. If injection is the gap, fail closed. That is the whole product.",
      },
      {
        kicker: "The ask",
        title: "Amanah for every NADRA-linked wallet.",
        body: "A resilience layer Pakistani fintechs can drop in front of onboarding — cheap enough for inclusion, strict enough for synthetic identity.",
      },
    ],
    nav: { home: "Home", assess: "Assess", threats: "Threats", pitch: "Pitch" },
    recsTitle: "What a defender should do",
    emptyScan: "No assessment yet. Run the field-capture suite — it is the inclusion case.",
    weakest: "Weakest control",
    simulated: "Simulated",
    live: "Live",
    secondsAgo: "just now",
    suiteHint: "Choose the capture you want scored. Nothing here generates an attack.",
    skipLive: "Use simulated suite instead",
    captureLocal: "Capture stays on-device",
    threatsTitle: "How a defender sees the channel",
    threatsLead:
      "Each card is a detection class — not a recipe. Amanah scores whether the onboarding path would survive that class. It never emits the attack.",
    inclusionAside:
      "Financial inclusion fails when banks treat every poor capture as fraud, or every smiling selfie as a person. Score lighting separately from injection. Assist the user on the first. Fail closed on the second.",
    prev: "Prev",
    next: "Next",
    holdNative: "Hold native capture, keep the two-second motion window, no upload fallback.",
  },
  ur: {
    product: "امانت",
    tagline: "آن بورڈنگ جس پر بھروسہ ہو",
    tenant: "نور والیٹ",
    track: "مالی شمولیت · پاکستان",
    scoreLabel: "اسکورِ تحفظ",
    lastAssessed: "آخری جائزہ",
    run: "جائزہ لیں",
    viewReport: "رپورٹ دیکھیں",
    threats: "ماڈلِ خطرہ",
    pitch: "جج واک تھرو",
    home: "ہوم",
    assess: "جائزہ",
    disclaimer:
      "صرف دفاعی اسکورنگ۔ امانت جعلی چہرے، جعلی دستاویز، یا کیمرہ انجیکشن نہیں بناتی۔",
    scenarios: {
      "inclusion-field": {
        name: "میدانی کیپچر",
        blurb: "اینڈرائیڈ گو، کھلی چھاؤں، کراچی۔ شمولیت کا کیس — دروازہ کھلا رکھیں، کے وائی سی کمزور نہ کریں۔",
        context: "نور والیٹ · کمزور اینڈرائیڈ",
      },
      "lab-control": {
        name: "لیب کنٹرول",
        blurb: "یکساں روشنی، اصلی کیمرہ، آپریٹر موجود۔ صحت مند چینل کی بنیاد۔",
        context: "کنٹرولڈ ماحول",
      },
      "hostile-channel": {
        name: "مخالف چینل",
        blurb: "کیپچر پاتھ پر ورچوئل کیمرہ کے اشارے۔ مدافع کو بند کرنا چاہیے۔",
        context: "انجیکشن کا شبہ",
      },
    },
    modeSim: "مثالی سوٹ",
    modeLive: "لائیو کیمرہ",
    begin: "بارہ سیکنڈ کا سوٹ شروع کریں",
    beginLive: "کیمرہ کھولیں اور اسکور کریں",
    scanning: "کیپچر چینل اسکور ہو رہا ہے",
    done: "جائزہ مکمل",
    overall: "کل",
    findings: "نتائج",
    harden: "مضبوطی کے اقدامات",
    notes: "شمولیت کا نوٹ",
    noCam:
      "اس ماحول میں کیمرہ دستیاب نہیں۔ مثالی سوٹ جج کے لیے محفوظ راستہ ہے اور وہی ڈیٹیکٹر چلاتا ہے۔",
    camDenied: "کیمرہ کی اجازت نہیں ملی۔ مثالی سوٹ چل رہا ہے۔",
    liveHint: "آپ کا چہرہ اسی ڈیوائس پر رہتا ہے۔ کچھ اپ لوڈ نہیں ہوتا۔ کوئی جعلی میڈیا نہیں بنتا۔",
    detectors: {
      injection: {
        name: "چینلِ انجیکشن",
        short: "ورچوئل کیمرہ / میڈیا داخلہ",
        defend: "چینل کے لیبل، صلاحیت اور ٹرانسپورٹ سے بدلے ہوئے کیپچر کا پتا چلاتا ہے — انجیکٹر بنائے بغیر۔",
      },
      replay: {
        name: "ری پلے / ساکن",
        short: "لوپ ویڈیو یا چھپی تصویر",
        defend: "مائیکرو حرکت کی کمی اور دہرے فریموں کو دیکھتا ہے جو ایک زندہ شخص شاذ و نادر پیدا کرتا ہے۔",
      },
      lighting: {
        name: "روشنی",
        short: "روشنی میں ہیرا پھیری",
        defend: "ایکسپوژر کی ہمواری، اچانک چمک، اور ٹارچ کے بغیر باہری چھاؤں — شمولیتی فونز پر عام۔",
      },
      temporal: {
        name: "وقتی سالمیت",
        short: "فریم ریٹ میں رد و بدل",
        defend: "حقیقی کیمرہ کلاک کے مقابل فریم ریٹ ناپتا ہے۔ کھینچی یا گری ہوئی سٹریم اسکور کھوتی ہے۔",
      },
      document: {
        name: "دستاویز کا بندھن",
        short: "سیلفی اور شناختی مطابقت",
        defend: "کیپچر کوالٹی اور بائنڈ کی تیاری چیک کرتا ہے۔ شناختی دستاویز نہیں بناتا۔",
      },
      liveness: {
        name: "غیر فعال زندگی",
        short: "موجودگی اور مائیکرو حرکت",
        defend: "قدرتی حرکت اور روشنی کی لرزش سے زندہ موضوع کی تصدیق — چیلنج سرکس نہیں۔",
      },
    } satisfies Record<DetectorId, { name: string; short: string; defend: string }>,
    bands: { strong: "برقرار", watch: "نگرانی", fail: "بند کریں" },
    pitchSlides: [
      {
        kicker: "مسئلہ",
        title: "ڈیجیٹل آن بورڈنگ اب فراڈ کا دروازہ ہے۔",
        body: "برانچ لیس والیٹ پاکستان میں محروم طبقات کو بینک کرتے ہیں۔ وہی سیلفی اور شناختی کارڈ اب انجیکشن اور ری پلے کی زد میں ہے۔ اندھا دھند سختی اینڈرائیڈ گو کو باہر کرتی ہے؛ نرمی جعلی شناخت اندر لاتی ہے۔",
      },
      {
        kicker: "پابندی",
        title: "شمولیت کا مطلب کمزور کے وائی سی نہیں۔",
        body: "کھلی چھاؤں میں دیہی کیپچر حملہ نہیں۔ روٹڈ فون پر ورچوئل کیمرہ حملہ ہے۔ امانت ان دونوں کو الگ کرتی ہے تاکہ نور والیٹ دروازہ کھلا رکھے۔",
      },
      {
        kicker: "پروڈکٹ",
        title: "چینل اسکور کریں۔ ہتھیار نہ بنائیں۔",
        body: "چھ دفاعی ڈیٹیکٹر۔ کوئی جعلی چہرہ نہیں، کوئی جعلی شناخت نہیں، کوئی انجیکٹر نہیں۔ ایک رپورٹ جس پر آپریٹر عمل کر سکے۔",
      },
      {
        kicker: "ثبوت",
        title: "آٹھ سیکنڈ۔ ایک عدد جس پر جج بھروسہ کرے۔",
        body: "میدانی سوٹ چلائیں۔ سب سے کمزور کنٹرول پڑھیں۔ روشنی کا خلا ہو تو صارف کی مدد کریں۔ انجیکشن ہو تو بند کر دیں۔ یہی پورا پروڈکٹ ہے۔",
      },
      {
        kicker: "گزارش",
        title: "ہر نادرا سے جڑے والیٹ کے لیے امانت۔",
        body: "ایک تہہِ تحفظ جو پاکستانی فن ٹیک آن بورڈنگ کے آگے لگا سکیں — شمولیت کے لیے سستی، جعلی شناخت کے خلاف سخت۔",
      },
    ],
    nav: { home: "ہوم", assess: "جائزہ", threats: "خطرات", pitch: "پیشکش" },
    recsTitle: "مدافع کو کیا کرنا چاہیے",
    emptyScan: "ابھی کوئی جائزہ نہیں۔ میدانی سوٹ چلائیں — یہ شمولیت کا کیس ہے۔",
    weakest: "سب سے کمزور کنٹرول",
    simulated: "مثالی",
    live: "لائیو",
    secondsAgo: "ابھی",
    suiteHint: "جس کیپچر کا اسکور چاہیے وہ چنیں۔ یہاں کوئی حملہ نہیں بنتا۔",
    skipLive: "مثالی سوٹ استعمال کریں",
    captureLocal: "کیپچر ڈیوائس پر رہتا ہے",
    threatsTitle: "مدافع چینل کو کیسے دیکھتا ہے",
    threatsLead:
      "ہر کارڈ ایک کلاسِ شناخت ہے — ترکیب نہیں۔ امانت یہ اسکور کرتی ہے کہ آن بورڈنگ اس کلاس سے بچے گی یا نہیں۔ حملہ پیدا نہیں کرتی۔",
    inclusionAside:
      "مالی شمولیت اس وقت ناکام ہوتی ہے جب بینک ہر کمزور کیپچر کو فراڈ سمجھیں، یا ہر مسکراتی سیلفی کو انسان۔ روشنی کو انجیکشن سے الگ اسکور کریں۔ پہلے پر صارف کی مدد، دوسرے پر بند۔",
    prev: "پیچھے",
    next: "آگے",
    holdNative: "اصلی کیپچر برقرار رکھیں، دو سیکنڈ کی حرکت، اپ لوڈ کا متبادل نہیں۔",
  },
} as const;

export type Copy = (typeof copy)[Lang];

export function useCopy(lang: Lang): Copy {
  return copy[lang];
}
