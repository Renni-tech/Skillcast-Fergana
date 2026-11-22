// ─── SkillCast Fergana: Smart Education copy (EN / UZ / RU) ────────────────
// Product-coherence wording for the Fergana City → Uzbekistan → Global
// edition. Applied last by i18n.ts, so a key listed here is the single source
// of truth for that key in all three languages (it replaces older wording).
// Every entry must have all three languages; i18n.ts enforces key parity.

type Copy = { en: string; uz: string; ru: string };
const c = (en: string, uz: string, ru: string): Copy => ({ en, uz, ru });

const SDG_NAMES: Array<[number, string, string, string]> = [
  [1, 'No Poverty', 'Qashshoqlikka barham berish', 'Ликвидация нищеты'],
  [2, 'Zero Hunger', 'Ochlikka barham berish', 'Ликвидация голода'],
  [3, 'Good Health and Well-being', 'Sog‘liq va farovonlik', 'Хорошее здоровье и благополучие'],
  [4, 'Quality Education', 'Sifatli ta’lim', 'Качественное образование'],
  [5, 'Gender Equality', 'Gender tengligi', 'Гендерное равенство'],
  [6, 'Clean Water and Sanitation', 'Toza suv va sanitariya', 'Чистая вода и санитария'],
  [7, 'Affordable and Clean Energy', 'Arzon va toza energiya', 'Недорогостоящая и чистая энергия'],
  [8, 'Decent Work and Economic Growth', 'Munosib mehnat va iqtisodiy oʻsish', 'Достойная работа и экономический рост'],
  [9, 'Industry, Innovation and Infrastructure', 'Sanoatlashtirish, innovatsiyalar va infratuzilma', 'Индустриализация, инновации и инфраструктура'],
  [10, 'Reduced Inequalities', 'Tengsizlikni kamaytirish', 'Уменьшение неравенства'],
  [11, 'Sustainable Cities and Communities', 'Barqaror shaharlar va aholi punktlari', 'Устойчивые города и населённые пункты'],
  [12, 'Responsible Consumption and Production', 'Mas’uliyatli iste’mol va ishlab chiqarish', 'Ответственное потребление и производство'],
  [13, 'Climate Action', 'Iqlim o‘zgarishiga qarshi kurash', 'Борьба с изменением климата'],
  [14, 'Life Below Water', 'Dengiz ekotizimlarini asrash', 'Сохранение морских экосистем'],
  [15, 'Life on Land', 'Quruqlik ekotizimlarini asrash', 'Сохранение экосистем суши'],
  [16, 'Peace, Justice and Strong Institutions', 'Tinchlik, adolat va samarali institutlar', 'Мир, правосудие и эффективные институты'],
  [17, 'Partnerships for the Goals', 'Maqsadlar yo‘lida hamkorlik', 'Партнёрство в интересах устойчивого развития'],
];

export const FERGANA_UI_COPY: Record<string, Copy> = {
  ...Object.fromEntries(SDG_NAMES.map(([n, en, uz, ru]) => [`sdg.name.${n}`, c(en, uz, ru)])),
  'SDG {goal}': c('SDG {goal}', 'BRM {goal}', 'ЦУР {goal}'),
  'Sustainable Development Goal {goal}': c('Sustainable Development Goal {goal}', 'Barqaror rivojlanish maqsadi {goal}', 'Цель устойчивого развития {goal}'),
  'sdg.list.title': c(
    'Sustainable Development Goals (SDGs) for the Aiversecity — Future-Ready Workforce track:',
    'Aiversecity — Kelajakka tayyor ishchi kuchi yoʻnalishi bo‘yicha Barqaror rivojlanish maqsadlari (BRM) roʻyxati:',
    'Список Целей устойчивого развития (ЦУР) для направления Aiversecity — Рабочая сила, готовая к будущему:',
  ),
  'sdg.core4': c(
    'SDG 4 is the core: every pathway is a learning plan first.',
    'BRM 4 — asosiy maqsad: har bir yo‘nalish avvalo o‘quv rejasidir.',
    'ЦУР 4 — основа: каждая траектория прежде всего учебный план.',
  ),
  'hr.footer.statement': c(
    'Aiversecity — Future-Ready Workforce · Human-in-command: AI supports learning and career decisions; people make them.',
    'Aiversecity — Kelajakka tayyor ishchi kuchi · Inson nazorati: AI o‘qish va karyera qarorlarini qo‘llab-quvvatlaydi, qarorni esa insonlar qabul qiladi.',
    'Aiversecity — Рабочая сила, готовая к будущему · Решает человек: ИИ помогает в учебных и карьерных решениях, но принимает их человек.',
  ),

  // Landing: Smart Education positioning, Fergana City → Uzbekistan → Global
  'landing.badge': c(
    'Smart Education · Fergana City → Uzbekistan → Global',
    'Aqlli ta’lim · Farg‘ona shahri → O‘zbekiston → Dunyo',
    'Умное образование · Фергана → Узбекистан → мир',
  ),
  // Simplified hero: one headline, one subtitle, one action (plain words)
  'hero.badge': c(
    'Free demo · sample profiles only',
    'Bepul demo · faqat namunaviy profillar',
    'Бесплатное демо · только примерные профили',
  ),
  'hero.title': c(
    'See which skills your next job needs',
    'Keyingi ishingiz uchun qaysi ko‘nikmalar kerakligini bilib oling',
    'Узнайте, какие навыки нужны для вашей следующей работы',
  ),
  'hero.subtitle': c(
    'Answer a few short questions and get a step-by-step learning plan with real courses in Fergana, across Uzbekistan and online.',
    'Bir nechta qisqa savolga javob bering va Farg‘onada, butun O‘zbekistonda hamda onlayn mavjud haqiqiy kurslar bilan bosqichma-bosqich o‘quv rejasini oling.',
    'Ответьте на несколько коротких вопросов и получите пошаговый план обучения с реальными курсами в Фергане, по всему Узбекистану и онлайн.',
  ),
  'hero.cta': c('Build my skill plan', 'Ko‘nikma rejamni tuzish', 'Составить мой план навыков'),
  'landing.kicker': c(
    'An AI-assisted Smart Education and future-skills platform. Proof of concept with synthetic demo profiles only.',
    'Sun’iy intellekt yordamidagi aqlli ta’lim va kelajak ko‘nikmalari platformasi. Faqat sintetik demo profillar bilan ishlaydigan prototip.',
    'Платформа умного образования и навыков будущего с поддержкой ИИ. Прототип только с синтетическими демо-профилями.',
  ),
  'landing.steps.title': c(
    'Your learning journey: from who you are today to what you learn next',
    'O‘quv yo‘lingiz: bugungi holatingizdan keyingi o‘rganadigan narsangizgacha',
    'Ваш учебный путь: от того, кто вы сегодня, к тому, что изучать дальше',
  ),
  'landing.step1': c('Understand yourself', 'O‘zingizni tushuning', 'Поймите себя'),
  'landing.step1d': c(
    'Build a learner profile: study or work field, skills, interests and goals. A CV is optional; the raw file stays in your browser.',
    'O‘quvchi profilini yarating: o‘qish yoki ish sohasi, ko‘nikmalar, qiziqishlar va maqsadlar. Rezyume ixtiyoriy; asl fayl brauzeringizda qoladi.',
    'Создайте профиль учащегося: сфера учёбы или работы, навыки, интересы и цели. Резюме необязательно; исходный файл остаётся в браузере.',
  ),
  'landing.step2': c('Understand future skills', 'Kelajak ko‘nikmalarini tushuning', 'Поймите навыки будущего'),
  'landing.step2d': c(
    'See which skills employers are asking for more often. Every number shows its source and date. It is a guide, not a promise.',
    'Ish beruvchilar qaysi ko‘nikmalarni ko‘proq so‘rayotganini ko‘ring. Har bir raqamning manbasi va sanasi ko‘rsatilgan. Bu yo‘l-yo‘riq, va’da emas.',
    'Посмотрите, какие навыки работодатели просят всё чаще. У каждой цифры указаны источник и дата. Это ориентир, а не обещание.',
  ),
  'landing.step3': c('Find your gaps and pathways', 'Bo‘shliqlar va yo‘nalishlarni toping', 'Найдите пробелы и траектории'),
  'landing.step3d': c(
    'See which skills you already have, which ones a job needs, and what is missing. Grow in your current field or move to a new one.',
    'Qaysi ko‘nikmalaringiz borligini, ish uchun qaysilari kerakligini va nima yetishmayotganini ko‘ring. Hozirgi sohangizda o‘sing yoki yangisiga o‘ting.',
    'Узнайте, какие навыки у вас уже есть, какие нужны для работы и чего не хватает. Растите в своей сфере или переходите в новую.',
  ),
  'landing.step4': c('Build and track your roadmap', 'Yo‘l xaritangizni tuzing va kuzating', 'Постройте маршрут и следите за прогрессом'),
  'landing.step4d': c(
    'Get a step-by-step plan with real courses — many of them free — and small weekly goals. Tick off each step as you go.',
    'Haqiqiy kurslar (ko‘pchiligi bepul) va kichik haftalik maqsadlar bilan bosqichma-bosqich reja oling. Har bir qadamni bajargach, belgilab boring.',
    'Получите пошаговый план с реальными курсами (многие бесплатны) и небольшими целями на неделю. Отмечайте каждый пройденный шаг.',
  ),
  'landing.sdg.title': c('Learning first: SDG 4 at the core', 'Avvalo ta’lim: markazda BRM 4', 'Сначала обучение: ЦУР 4 в основе'),
  'landing.sdg.desc': c(
    'Every skill and pathway explains WHY it supports a specific SDG target, starting with quality education (4.4) and decent work (8.5). These are mechanisms, not measured impact.',
    'Har bir ko‘nikma va yo‘nalish u qaysi BRM maqsadini NIMA UCHUN qo‘llab-quvvatlashini tushuntiradi — sifatli ta’lim (4.4) va munosib mehnatdan (8.5) boshlab. Bu o‘lchangan ta’sir emas, mexanizm.',
    'Каждый навык и траектория объясняют, ПОЧЕМУ они поддерживают конкретную задачу ЦУР, начиная с качественного образования (4.4) и достойной работы (8.5). Это механизмы, а не измеренное воздействие.',
  ),

  // Dashboard tabs and flow hints (education-first naming)
  'tab.sdg': c('SDG impact', 'BRM ta’siri', 'Вклад в ЦУР'),
  'tab.matches': c('Learning & career pathways', 'O‘quv va kasbiy yo‘nalishlar', 'Учебные и карьерные траектории'),
  'tab.learn': c('What to learn', 'Nimani o‘rganish kerak', 'Что изучать'),
  'tab.harada': c('Harada-inspired roadmap', 'Harada usulidagi yo‘l xaritasi', 'Маршрут по методу Харада'),
  'flow.overview': c(
    'Start with your learner snapshot, then explore pathways to choose what to learn next.',
    'O‘quv holatingizdan boshlang, so‘ng keyin nimani o‘rganishni tanlash uchun yo‘nalishlarni ko‘rib chiqing.',
    'Начните со своего учебного среза, затем изучите траектории и выберите, чему учиться дальше.',
  ),
  'flow.matches': c(
    'Compare learning & career pathways using your skills, interests, experience and goals. Each pathway shows the skills you still need to learn.',
    'Ko‘nikmalaringiz, qiziqishlaringiz, tajribangiz va maqsadlaringiz asosida o‘quv va kasbiy yo‘nalishlarni solishtiring. Har bir yo‘nalish hali o‘rganishingiz kerak bo‘lgan ko‘nikmalarni ko‘rsatadi.',
    'Сравнивайте учебные и карьерные траектории по своим навыкам, интересам, опыту и целям. Каждая траектория показывает навыки, которые ещё нужно освоить.',
  ),
  'flow.radar': c(
    'See which skills are rising and where your learning priorities are. Scenarios are indicative demos, not guaranteed predictions.',
    'Qaysi ko‘nikmalar o‘sib borayotganini va o‘quv ustuvorliklaringizni ko‘ring. Ssenariylar taxminiy demo, kafolatlangan bashorat emas.',
    'Посмотрите, какие навыки растут и каковы ваши приоритеты обучения. Сценарии — ориентировочные демо, а не гарантированные прогнозы.',
  ),
  'flow.harada': c(
    'Turn your long-term goal into skill areas, actions and learning tasks you can measure. Task status is saved in this browser and shared with Progress.',
    'Uzoq muddatli maqsadingizni ko‘nikma sohalari, harakatlar va o‘lchanadigan o‘quv vazifalariga aylantiring. Vazifa holati shu brauzerda saqlanadi va Jarayon bo‘limida ko‘rinadi.',
    'Превратите долгосрочную цель в области навыков, действия и измеримые учебные задачи. Статус задач сохраняется в этом браузере и виден в разделе «Прогресс».',
  ),

  // Learner snapshot (My Forecast → Overview): same structure in every language
  'snap.title': c('Your learning snapshot', 'O‘quv holatingiz', 'Ваш учебный срез'),
  'snap.fallback': c('Your future-ready learning plan', 'Kelajakka tayyor o‘quv rejangiz', 'Ваш учебный план, готовый к будущему'),
  'snap.skills': c('Skills in profile', 'Profildagi ko‘nikmalar', 'Навыков в профиле'),
  'snap.hours': c('Learning hours / week', 'Haftalik o‘quv soatlari', 'Часов учёбы в неделю'),
  'snap.completed': c('Courses completed', 'Yakunlangan kurslar', 'Пройдено курсов'),
  'snap.pathway': c('Leading pathway', 'Asosiy yo‘nalish', 'Ведущая траектория'),
  'snap.fit': c('{n}% fit with your profile', 'Profilingizga {n}% mos', 'Соответствие профилю: {n}%'),
  'snap.exposure': c('AI task exposure', 'AI vazifalarga ta’siri', 'Влияние ИИ на задачи'),
  'snap.exposure.note': c(
    'Describes how tasks change, not the chance of a job being replaced.',
    'Vazifalar qanday o‘zgarishini anglatadi, ish o‘rni almashtirilishi ehtimolini emas.',
    'Описывает изменение задач, а не вероятность замены рабочего места.',
  ),
  'snap.next': c('Next to learn', 'Keyingi o‘rganish', 'Изучить далее'),
  'snap.next.none': c('Choose a pathway to get a course', 'Kurs olish uchun yo‘nalish tanlang', 'Выберите траекторию, чтобы получить курс'),
  'snap.none': c('Not chosen yet', 'Hali tanlanmagan', 'Пока не выбрано'),

  // Future Skills Radar chart
  'radar.you': c('You', 'Siz', 'Вы'),
  'radar.market': c('Market demand', 'Bozor talabi', 'Спрос рынка'),
  'ov.radar.desc': c(
    'Your skill levels (blue) compared with indicative market momentum (violet). Sources and dates: Signal sources.',
    'Ko‘nikma darajalaringiz (ko‘k) taxminiy bozor dinamikasi (binafsha) bilan solishtirilgan. Manbalar va sanalar: Signal manbalari.',
    'Ваш уровень навыков (синий) в сравнении с ориентировочной динамикой рынка (фиолетовый). Источники и даты — в разделе «Источники сигналов».',
  ),
  'ov.refreshing': c('Checking sources…', 'Manbalar tekshirilmoqda…', 'Проверка источников…'),
  'ov.refresh': c('Check sources', 'Manbalarni tekshirish', 'Проверить источники'),

  // Harada-inspired learning roadmap (8 skill areas × 8 tasks = 64, as built)
  'Harada Method · Open Window 64': c(
    'Harada-inspired learning roadmap · 64 tasks',
    'Harada usuliga asoslangan o‘quv yo‘l xaritasi · 64 vazifa',
    'Учебный маршрут по методу Харада · 64 задачи',
  ),
  'Harada Method Roadmap · Open Window 64': c(
    'Harada-inspired roadmap: goal → 8 skill areas → 64 learning tasks',
    'Harada usulidagi yo‘l xaritasi: maqsad → 8 ko‘nikma sohasi → 64 o‘quv vazifasi',
    'Маршрут по методу Харада: цель → 8 областей навыков → 64 учебные задачи',
  ),

  // Radar time-horizon axis (demo interpolation) and pathway badges
  'horizon.now': c('Now · demo baseline', 'Hozir · demo bazaviy qiymat', 'Сейчас · демо-база'),
  'horizon.3to5': c('3–5 years', '3–5 yil', '3–5 лет'),
  'horizon.5to10': c('5–10 years', '5–10 yil', '5–10 лет'),
  'badge.first': c('First step', 'Birinchi qadam', 'Первый шаг'),
  'badge.halfway': c('Halfway', 'Yarim yo‘l', 'Половина пути'),
  'badge.ai': c('AI explorer', 'AI tadqiqotchisi', 'Исследователь ИИ'),
  'badge.green': c('Green skill', 'Yashil ko‘nikma', 'Зелёный навык'),
  'badge.complete': c('Path complete', 'Yo‘l yakunlandi', 'Путь пройден'),

  // Skill picker: browse every field, not only AI
  'skills.browse': c('Browse skills by field', 'Ko‘nikmalarni soha bo‘yicha ko‘rish', 'Навыки по сферам'),
  'skills.all': c('All fields', 'Barcha sohalar', 'Все сферы'),
  'skills.suggested': c('Suggested from your background and courses', 'Tajribangiz va kurslaringiz asosida tavsiya', 'Рекомендуем по вашему опыту и курсам'),
  'skills.suggested.none': c(
    'Add a field of work or study to get suggestions.',
    'Tavsiyalar olish uchun ish yoki o‘qish sohasini kiriting.',
    'Укажите сферу работы или учёбы, чтобы получить рекомендации.',
  ),
  'skills.noResults': c('No skills match this search.', 'Bu qidiruvga mos ko‘nikma topilmadi.', 'По этому запросу навыки не найдены.'),
  'skills.taughtIn': c('Taught in {n} catalogue courses', 'Katalogdagi {n} ta kursda o‘rgatiladi', 'Изучается в курсах каталога: {n}'),
  'skills.notTracked': c('Not signal-tracked', 'Signal bilan kuzatilmaydi', 'Сигналы не отслеживаются'),
  'skills.add': c('Add {skill}', '{skill} qo‘shish', 'Добавить: {skill}'),

  // Personalised recommendation reasons (onboarding radar)
  'reason.gap': c(
    'A skill gap for {role}, one of your strongest pathway matches.',
    '{role} uchun ko‘nikma bo‘shlig‘i — eng mos yo‘nalishlaringizdan biri.',
    'Пробел в навыках для траектории «{role}» — одной из самых подходящих вам.',
  ),
  'reason.related': c(
    'Related to your {field} background and interests.',
    '{field} bo‘yicha tajribangiz va qiziqishlaringizga bog‘liq.',
    'Связан с вашим опытом в сфере «{field}» и интересами.',
  ),
  'reason.related.generic': c(
    'Related to your background and interests.',
    'Tajribangiz va qiziqishlaringizga bog‘liq.',
    'Связан с вашим опытом и интересами.',
  ),
  'reason.builds': c('Builds on your current {n}/5 level.', 'Joriy {n}/5 darajangizni rivojlantiradi.', 'Развивает ваш текущий уровень {n}/5.'),
  'reason.explore': c('A useful capability to explore in {category}.', '{category} sohasida o‘rganishga arziydigan ko‘nikma.', 'Полезный навык для изучения в сфере «{category}».'),

  // Employer view: Education → Skills → Workforce readiness
  'emp.bridge': c(
    'Education → Skills → Workforce readiness: this view turns team skill gaps into learning priorities, training needs and reskilling plans.',
    'Ta’lim → Ko‘nikmalar → Ishchi kuchining tayyorligi: bu bo‘lim jamoadagi ko‘nikma bo‘shliqlarini o‘quv ustuvorliklari, o‘qitish ehtiyojlari va qayta tayyorlash rejalariga aylantiradi.',
    'Образование → Навыки → Готовность кадров: этот раздел превращает пробелы в навыках команды в учебные приоритеты, потребности в обучении и планы переподготовки.',
  ),
  'emp.title': c('Team learning priorities and skill gaps', 'Jamoaning o‘quv ustuvorliklari va ko‘nikma bo‘shliqlari', 'Учебные приоритеты и пробелы в навыках команды'),
  'emp.demo.org': c(
    'Fergana Smart Manufacturing (fictional demo)',
    'Fergana Smart Manufacturing (to‘qima demo tashkilot)',
    'Fergana Smart Manufacturing (вымышленная демо-организация)',
  ),
  'inst.demo.name': c(
    'Fergana Future Skills Center (fictional demo)',
    'Fergana Future Skills Center (to‘qima demo markaz)',
    'Fergana Future Skills Center (вымышленный демо-центр)',
  ),

  // Signal wording: periodic global remote postings, never "live" or local vacancies
  'demand.desc': c(
    'Demand index under both scenarios, and the momentum of the role’s key skills from periodically counted global remote postings. All values are estimates with visible sources.',
    'Har ikki ssenariy bo‘yicha talab indeksi hamda davriy hisoblanadigan global masofaviy e’lonlardagi asosiy ko‘nikmalar dinamikasi. Barcha qiymatlar manbasi ko‘rsatilgan taxminlardir.',
    'Индекс спроса в обоих сценариях и динамика ключевых навыков роли по периодически подсчитываемым глобальным удалённым вакансиям. Все значения — оценки с указанием источников.',
  ),
  'hr.role.ai-ops-specialist.signals': c(
    'Outlook blends keyword momentum for workflow automation / RPA in global remote postings with the WEF Future of Jobs 2025 growth direction for AI-augmented roles.',
    'Istiqbol global masofaviy e’lonlardagi ish jarayonlarini avtomatlashtirish / RPA kalit so‘zlari dinamikasini WEF Future of Jobs 2025 hisobotidagi AI bilan boyitilgan rollar o‘sish yo‘nalishi bilan birlashtiradi.',
    'Перспектива сочетает динамику ключевых слов автоматизации процессов и RPA в глобальных удалённых вакансиях с направлением роста ролей с ИИ из WEF Future of Jobs 2025.',
  ),
  'hr.role.esg-analyst.signals': c(
    'ESG and carbon-accounting keywords are a steady theme in global remote postings; disclosure rules drive demand independently of AI trends.',
    'ESG va uglerod hisobi kalit so‘zlari global masofaviy e’lonlarda barqaror uchraydi; oshkor qilish qoidalari talabni AI trendlaridan qat’i nazar oshiradi.',
    'Ключевые слова ESG и учёта выбросов стабильно встречаются в глобальных удалённых вакансиях; требования к раскрытию поддерживают спрос независимо от трендов ИИ.',
  ),
  'hr.role.cyber-analyst.signals': c(
    'Cybersecurity keywords are among the most frequent skills in the global remote postings SkillCast counts, with a positive trend in both scenarios.',
    'Kiberxavfsizlik kalit so‘zlari SkillCast hisoblaydigan global masofaviy e’lonlardagi eng ko‘p uchraydigan ko‘nikmalardan biri; ikkala ssenariyda ham tendensiya ijobiy.',
    'Кибербезопасность — среди самых частых навыков в глобальных удалённых вакансиях, которые учитывает SkillCast; в обоих сценариях тренд положительный.',
  ),
  'hr.role.prompt-workflow-designer.signals': c(
    'Generative-AI and prompt keywords became common in global remote postings within two years — the clearest emerging-skill signal SkillCast tracks.',
    'Generativ AI va prompt kalit so‘zlari ikki yil ichida global masofaviy e’lonlarda keng tarqaldi — SkillCast kuzatadigan eng aniq yangi ko‘nikma signali.',
    'Ключевые слова генеративного ИИ и промптов за два года стали обычными в глобальных удалённых вакансиях — самый явный сигнал нового навыка, который отслеживает SkillCast.',
  ),
  'hr.role.ml-engineer.signals': c(
    'Consistently among the most frequent and fastest-rising keywords in global remote postings; a high entry barrier keeps supply limited.',
    'Global masofaviy e’lonlarda doimo eng ko‘p uchraydigan va tez o‘sayotgan kalit so‘zlar qatorida; yuqori kirish to‘sig‘i mutaxassislar sonini cheklaydi.',
    'Стабильно среди самых частых и быстрорастущих ключевых слов в глобальных удалённых вакансиях; высокий порог входа ограничивает число специалистов.',
  ),
  'onb.emp.company.ph': c(
    'e.g. Fergana Smart Manufacturing (fictional)',
    'masalan, Fergana Smart Manufacturing (to‘qima)',
    'напр., Fergana Smart Manufacturing (вымышленная)',
  ),
};
