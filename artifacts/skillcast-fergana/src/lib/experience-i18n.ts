// ─── Learner experience copy (EN / UZ / RU) ────────────────────────────────
// Wind Rose, guidance, accessibility, voice assistant, inclusive
// opportunities and learning sources. Applied by i18n.ts after the Fergana
// copy; every entry must have all three languages (enforced by
// tests/i18n-parity.test.ts).

import { INCLUSIVE_ENTRIES } from '@/data/inclusive';
import { LEARNING_SOURCES } from '@/data/learning-sources';

type Copy = { en: string; uz: string; ru: string };
const c = (en: string, uz: string, ru: string): Copy => ({ en, uz, ru });

const SOURCE_DESCRIPTIONS: Record<string, Copy> = {
  'mehnat-vocational': c(
    'Free vocational training and job-placement support through local employment centres. Ask about current courses near you.',
    'Mahalliy bandlik markazlari orqali bepul kasbiy ta’lim va ishga joylashishda yordam. Yaqiningizdagi joriy kurslar haqida so‘rang.',
    'Бесплатное профобучение и помощь в трудоустройстве через местные центры занятости. Уточните актуальные курсы рядом с вами.',
  ),
  itpark: c(
    'Uzbekistan’s IT park: IT training programmes and digital-inclusion projects with regional training.',
    'O‘zbekiston IT parki: IT bo‘yicha o‘quv dasturlari va hududlarda o‘qitiladigan raqamli inklyuziya loyihalari.',
    'IT-парк Узбекистана: IT-обучение и проекты цифровой инклюзии с обучением в регионах.',
  ),
  elementsofai: c(
    'Free, self-paced introduction to AI for non-specialists, with a free certificate.',
    'Mutaxassis bo‘lmaganlar uchun AI bo‘yicha bepul, mustaqil o‘rganiladigan kirish kursi; sertifikat ham bepul.',
    'Бесплатный вводный курс по ИИ для неспециалистов в своём темпе; сертификат тоже бесплатный.',
  ),
  'w3c-wai': c(
    'Free course from the organisation that writes the web accessibility standards (WCAG).',
    'Veb-qulaylik standartlarini (WCAG) ishlab chiquvchi tashkilotning bepul kursi.',
    'Бесплатный курс от организации, которая разрабатывает стандарты веб-доступности (WCAG).',
  ),
  'ms-learn': c(
    'Free modules and learning paths on AI, cloud, data and security; many pages are available in Russian.',
    'AI, bulut, ma’lumotlar va xavfsizlik bo‘yicha bepul modullar va o‘quv yo‘llari; ko‘p sahifalar rus tilida ham bor.',
    'Бесплатные модули и учебные пути по ИИ, облаку, данным и безопасности; многие страницы есть на русском.',
  ),
  'british-council': c(
    'Free English practice for work and study: listening, reading, grammar and business English.',
    'Ish va o‘qish uchun bepul ingliz tili mashqlari: tinglash, o‘qish, grammatika va biznes ingliz tili.',
    'Бесплатная практика английского для работы и учёбы: аудирование, чтение, грамматика и деловой английский.',
  ),
  khan: c(
    'Free lessons with videos and exercises, including personal finance, statistics and programming.',
    'Video va mashqli bepul darslar, jumladan shaxsiy moliya, statistika va dasturlash.',
    'Бесплатные уроки с видео и упражнениями, в том числе личные финансы, статистика и программирование.',
  ),
  gcfglobal: c(
    'Free step-by-step tutorials on computer basics, office tools, email and online safety.',
    'Kompyuter asoslari, ofis dasturlari, elektron pochta va onlayn xavfsizlik bo‘yicha bepul bosqichma-bosqich darslar.',
    'Бесплатные пошаговые уроки по основам компьютера, офисным программам, почте и безопасности в интернете.',
  ),
  'canva-design': c(
    'Free short courses on visual design, branding and social media graphics.',
    'Vizual dizayn, brending va ijtimoiy tarmoq grafikasi bo‘yicha bepul qisqa kurslar.',
    'Бесплатные короткие курсы по визуальному дизайну, брендингу и графике для соцсетей.',
  ),
  'cisco-netacad': c(
    'Free self-paced courses in cybersecurity, networking, Python and data from Cisco Networking Academy.',
    'Cisco Networking Academy’dan kiberxavfsizlik, tarmoqlar, Python va ma’lumotlar bo‘yicha bepul mustaqil kurslar.',
    'Бесплатные курсы Cisco Networking Academy по кибербезопасности, сетям, Python и данным в своём темпе.',
  ),
  freecodecamp: c(
    'Free coding curriculum with projects and certifications: web development, Python and data analysis.',
    'Loyihalar va sertifikatlarga ega bepul dasturlash o‘quv dasturi: veb-ishlab chiqish, Python va ma’lumotlar tahlili.',
    'Бесплатная программа по программированию с проектами и сертификатами: веб-разработка, Python и анализ данных.',
  ),
  'fao-elearning': c(
    'Free courses from the UN Food and Agriculture Organization on agriculture, food safety and climate.',
    'BMT Oziq-ovqat va qishloq xo‘jaligi tashkilotining qishloq xo‘jaligi, oziq-ovqat xavfsizligi va iqlim bo‘yicha bepul kurslari.',
    'Бесплатные курсы ФАО ООН по сельскому хозяйству, безопасности пищевых продуктов и климату.',
  ),
  openwho: c(
    'Free public-health courses from the World Health Organization, in several languages.',
    'Jahon sog‘liqni saqlash tashkilotining bir necha tildagi bepul sog‘liqni saqlash kurslari.',
    'Бесплатные курсы ВОЗ по общественному здравоохранению на нескольких языках.',
  ),
  coursera: c(
    'University courses; many can be audited for free, certificates are usually paid.',
    'Universitet kurslari; ko‘pini bepul tinglash mumkin, sertifikatlar odatda pullik.',
    'Университетские курсы; многие можно прослушать бесплатно, сертификаты обычно платные.',
  ),
};

const INCLUSIVE_DESCRIPTIONS: Record<string, Copy> = {
  'mehnat-fergana': c(
    'An official report from Fergana District describes vocational training, employment quotas and the national labour platform. Ask your local employment centre whether quota places and training support apply to you.',
    'Farg‘ona tumanidan rasmiy hisobotda kasbiy ta’lim, ish o‘rinlari kvotalari va milliy mehnat platformasi tasvirlangan. Kvota o‘rinlari va o‘qishdagi yordam sizga tegishli-yo‘qligini mahalliy bandlik markazidan so‘rang.',
    'Официальный отчёт Ферганского района описывает профобучение, квоты рабочих мест и национальную платформу занятости. Уточните в местном центре занятости, распространяются ли на вас квотные места и поддержка в обучении.',
  ),
  ishmehnat: c(
    'Search national vacancies (login required). The database does not confirm accessibility features for each vacancy, so ask the employer about workplace adjustments.',
    'Milliy vakansiyalarni qidiring (tizimga kirish kerak). Bazada har bir vakansiyaning qulayliklari tasdiqlanmagan, shuning uchun ish joyidagi moslashuvlar haqida ish beruvchidan so‘rang.',
    'Поиск вакансий по всей стране (нужен вход). База не подтверждает условия доступности для каждой вакансии, поэтому уточняйте у работодателя возможные адаптации рабочего места.',
  ),
  'uz-law': c(
    'Uzbekistan’s 2020 law sets out the rights of persons with disabilities, including education and employment. Search for it by name on lex.uz, the official legislation database.',
    'O‘zbekistonning 2020-yildagi qonuni nogironligi bo‘lgan shaxslarning huquqlarini, jumladan ta’lim va bandlikni belgilaydi. Uni rasmiy qonunchilik bazasi lex.uz’da nomi bo‘yicha qidiring.',
    'Закон Узбекистана 2020 года закрепляет права лиц с инвалидностью, в том числе на образование и труд. Найдите его по названию на lex.uz, официальной базе законодательства.',
  ),
  'un-crpd': c(
    'The international standard for inclusive education (Article 24) and for work and employment (Article 27).',
    'Inklyuziv ta’lim (24-modda) hamda mehnat va bandlik (27-modda) bo‘yicha xalqaro standart.',
    'Международный стандарт инклюзивного образования (статья 24) и труда и занятости (статья 27).',
  ),
  'ilo-gbdn': c(
    'A network of companies and employer organisations working on disability inclusion, with guides and good-practice examples.',
    'Nogironligi bo‘lgan shaxslarni ishga jalb qilish ustida ishlaydigan kompaniyalar va ish beruvchilar tashkilotlari tarmog‘i; qo‘llanmalar va ijobiy tajriba namunalari mavjud.',
    'Сеть компаний и объединений работодателей, работающих над инклюзией людей с инвалидностью; есть руководства и примеры хорошей практики.',
  ),
  'w3c-wai': c(
    'The web accessibility standards (WCAG). Useful to check whether an online course or job portal works with assistive technology.',
    'Veb-qulaylik standartlari (WCAG). Onlayn kurs yoki vakansiyalar portali yordamchi texnologiyalar bilan ishlashini tekshirish uchun foydali.',
    'Стандарты веб-доступности (WCAG). Помогают проверить, работает ли онлайн-курс или портал вакансий со вспомогательными технологиями.',
  ),
  'w3c-course': c(
    'A free introduction to digital accessibility; also a first step towards accessibility-related careers.',
    'Raqamli qulaylik bo‘yicha bepul kirish kursi; qulaylik bilan bog‘liq kasblarga ham birinchi qadam.',
    'Бесплатное введение в цифровую доступность; также первый шаг к профессиям в сфере доступности.',
  ),
  'demo-employer': c(
    'Example of how a verified employer entry would look: step-free entrance, flexible hours and screen-reader-ready software. Fictional — not a real company or job offer.',
    'Tasdiqlangan ish beruvchi yozuvi qanday ko‘rinishiga misol: zinapoyasiz kirish, moslashuvchan ish vaqti va ekran o‘quvchi dasturlarga mos dasturiy ta’minot. To‘qima — haqiqiy kompaniya yoki vakansiya emas.',
    'Пример того, как выглядела бы проверенная запись о работодателе: вход без ступеней, гибкий график и ПО, совместимое со скринридером. Вымышленный пример — не реальная компания и не вакансия.',
  ),
};

// Names: descriptive names are translated; proper names stay identical.
const SOURCE_NAMES: Record<string, Copy> = {
  'mehnat-vocational': c('Vocational training and employment programmes', 'Kasbiy ta’lim va bandlik dasturlari', 'Программы профобучения и занятости'),
  itpark: c('IT Park Uzbekistan training and digital inclusion', 'IT Park Uzbekistan: o‘qitish va raqamli inklyuziya', 'IT Park Uzbekistan: обучение и цифровая инклюзия'),
  elementsofai: c('Elements of AI', 'Elements of AI', 'Elements of AI'),
  'w3c-wai': c('Digital Accessibility Foundations', 'Digital Accessibility Foundations', 'Digital Accessibility Foundations'),
  'ms-learn': c('Microsoft Learn training paths', 'Microsoft Learn o‘quv yo‘llari', 'Учебные пути Microsoft Learn'),
  'british-council': c('LearnEnglish', 'LearnEnglish', 'LearnEnglish'),
  khan: c('Khan Academy', 'Khan Academy', 'Khan Academy'),
  gcfglobal: c('GCFGlobal digital skills tutorials', 'GCFGlobal raqamli ko‘nikmalar darslari', 'Уроки цифровых навыков GCFGlobal'),
  'canva-design': c('Canva Design School', 'Canva Design School', 'Canva Design School'),
  'cisco-netacad': c('Skills for All', 'Skills for All', 'Skills for All'),
  freecodecamp: c('freeCodeCamp curriculum', 'freeCodeCamp o‘quv dasturi', 'Программа freeCodeCamp'),
  'fao-elearning': c('FAO eLearning Academy', 'FAO eLearning Academy', 'FAO eLearning Academy'),
  openwho: c('OpenWHO courses', 'OpenWHO kurslari', 'Курсы OpenWHO'),
  coursera: c('Coursera (many courses can be audited free)', 'Coursera (ko‘p kurslarni bepul tinglash mumkin)', 'Coursera (многие курсы можно прослушать бесплатно)'),
};

const INCLUSIVE_NAMES: Record<string, Copy> = {
  'mehnat-fergana': c('Employment quotas and vocational training (Fergana District report)', 'Ish o‘rinlari kvotalari va kasbiy ta’lim (Farg‘ona tumani hisoboti)', 'Квоты рабочих мест и профобучение (отчёт Ферганского района)'),
  ishmehnat: c('National vacancy database', 'Milliy vakansiyalar bazasi', 'Национальная база вакансий'),
  'uz-law': c('Law “On the rights of persons with disabilities” (2020)', '“Nogironligi bo‘lgan shaxslarning huquqlari to‘g‘risida”gi Qonun (2020)', 'Закон «О правах лиц с инвалидностью» (2020)'),
  'un-crpd': c('Convention on the Rights of Persons with Disabilities (Articles 24 and 27)', 'Nogironlar huquqlari to‘g‘risidagi konvensiya (24- va 27-moddalar)', 'Конвенция о правах инвалидов (статьи 24 и 27)'),
  'ilo-gbdn': c('Global Business and Disability Network', 'Global Business and Disability Network', 'Global Business and Disability Network'),
  'w3c-wai': c('Web accessibility standards (WCAG)', 'Veb-qulaylik standartlari (WCAG)', 'Стандарты веб-доступности (WCAG)'),
  'w3c-course': c('Digital Accessibility Foundations (free course)', 'Digital Accessibility Foundations (bepul kurs)', 'Digital Accessibility Foundations (бесплатный курс)'),
  'demo-employer': c('Fergana Smart Manufacturing', 'Fergana Smart Manufacturing', 'Fergana Smart Manufacturing'),
};

export const EXPERIENCE_COPY: Record<string, Copy> = {
  ...Object.fromEntries(LEARNING_SOURCES.map((s) => [`ls.${s.id}.name`, SOURCE_NAMES[s.id]])),
  ...Object.fromEntries(INCLUSIVE_ENTRIES.map((e) => [`inc.${e.id}.name`, INCLUSIVE_NAMES[e.id]])),
  ...Object.fromEntries(LEARNING_SOURCES.map((s) => [`ls.${s.id}.d`, SOURCE_DESCRIPTIONS[s.id]])),
  ...Object.fromEntries(INCLUSIVE_ENTRIES.map((e) => [`inc.${e.id}.d`, INCLUSIVE_DESCRIPTIONS[e.id]])),

  // Accurate signal wording (periodic global remote postings, not live data)
  'onb.inst.focus.entry.d': c(
    'Periodically updated market signals rank the roles each student is closest to.',
    'Davriy yangilanadigan bozor signallari har bir talabaga eng yaqin lavozimlarni tartiblaydi.',
    'Периодически обновляемые рыночные сигналы ранжируют роли, наиболее близкие каждому студенту.',
  ),
  'hr.role.data-analyst.signals': c(
    'The most frequent skill cluster in the global remote postings SkillCast counts. Routine dashboarding is being automated while demand for interpretation grows.',
    'SkillCast hisoblaydigan global masofaviy e’lonlardagi eng ko‘p uchraydigan ko‘nikmalar guruhi. Oddiy hisobot panellari avtomatlashmoqda, ma’lumotlarni talqin qilishga talab esa o‘smoqda.',
    'Самая частая группа навыков в глобальных удалённых вакансиях, которые учитывает SkillCast. Типовые дашборды автоматизируются, а спрос на интерпретацию данных растёт.',
  ),
  'hr.role.ai-marketing-strategist.signals': c(
    'Compares the periodic momentum of digital-marketing and AI-content keywords; the gap between them shows whether marketers manage the tools or are replaced by them.',
    'Raqamli marketing va AI-kontent kalit so‘zlarining davriy dinamikasini solishtiradi; ular orasidagi farq marketologlar vositalarni boshqarishi yoki ular bilan almashtirilishini ko‘rsatadi.',
    'Сравнивает периодическую динамику ключевых слов цифрового маркетинга и ИИ-контента; разрыв между ними показывает, управляют ли маркетологи инструментами или инструменты заменяют их.',
  ),

  // Progressive-disclosure guidance
  'guide.what': c('What this means', 'Bu nimani anglatadi', 'Что это значит'),
  'guide.next': c('What to do next', 'Keyingi qadam', 'Что делать дальше'),

  // Tabs: short labels keep the tab bar on one line per row in every language
  'tab.radar.short': c('Wind Rose', 'Shamol guli', 'Роза ветров'),

  // Wind Rose
  'wr.title': c('Your career direction map', 'Karyera yo‘nalishi xaritangiz', 'Карта вашего карьерного направления'),
  'wr.kicker': c('Wind Rose', 'Shamol guli', 'Роза ветров'),
  'wr.lede': c(
    'Where you are now, where demand is moving, and what to improve next.',
    'Hozir qayerdasiz, talab qayerga siljimoqda va keyin nimani yaxshilash kerak.',
    'Где вы сейчас, куда движется спрос и что улучшить дальше.',
  ),
  'wr.you': c('You now', 'Hozirgi holatingiz', 'Вы сейчас'),
  'wr.market': c('Market direction', 'Bozor yo‘nalishi', 'Направление рынка'),
  'wr.target': c('Pathway target', 'Yo‘nalish talabi', 'Цель траектории'),
  'wr.legend.you': c('Filled blue area: your current level (self-rated).', 'Ko‘k to‘ldirilgan maydon: hozirgi darajangiz (o‘zingiz baholagan).', 'Синяя заливка: ваш текущий уровень (ваша самооценка).'),
  'wr.legend.market': c('Solid violet line: indicative market momentum.', 'Binafsha chiziq: bozorning taxminiy dinamikasi.', 'Сплошная фиолетовая линия: ориентировочная динамика рынка.'),
  'wr.legend.target': c('Dashed amber line: the level your chosen pathway needs.', 'Sariq uzuq chiziq: tanlangan yo‘nalishingiz talab qiladigan daraja.', 'Жёлтая пунктирная линия: уровень, нужный вашей траектории.'),
  'wr.how': c(
    'Read it like a compass: where the violet or amber line reaches further than the blue area, that skill is a gap worth learning.',
    'Uni kompas kabi o‘qing: binafsha yoki sariq chiziq ko‘k maydondan uzoqroqqa chiqqan joyda o‘sha ko‘nikma o‘rganishga arziydigan bo‘shliqdir.',
    'Читайте как компас: там, где фиолетовая или жёлтая линия выходит дальше синей области, навык стоит подтянуть.',
  ),
  'wr.priorities': c('Improve next', 'Keyingi navbatda yaxshilang', 'Улучшить в первую очередь'),
  'wr.priorities.none': c('No large gaps on this map. Keep practising your strongest skills.', 'Bu xaritada katta bo‘shliq yo‘q. Eng kuchli ko‘nikmalaringizni mashq qilishda davom eting.', 'Больших пробелов нет. Продолжайте развивать сильные навыки.'),
  'wr.strengths': c('Your strengths', 'Kuchli tomonlaringiz', 'Ваши сильные стороны'),
  'wr.strengths.none': c('Rate your skills in your profile to see your strengths.', 'Kuchli tomonlaringizni ko‘rish uchun profilingizda ko‘nikmalaringizni baholang.', 'Оцените навыки в профиле, чтобы увидеть сильные стороны.'),
  'wr.strengths.growing': c('No skill is at level 3 or above yet. Each course you finish moves the blue area outward.', 'Hali birorta ko‘nikma 3-darajaga yetmagan. Har bir yakunlangan kurs ko‘k maydonni kengaytiradi.', 'Пока нет навыков уровня 3 и выше. Каждый пройденный курс расширяет синюю область.'),
  'wr.gap': c('{n} points to grow', '{n} ball o‘sish imkoni', 'Рост на {n} баллов'),
  'wr.find': c('Find courses', 'Kurslarni topish', 'Найти курсы'),
  'wr.table.show': c('Show values as a table', 'Qiymatlarni jadvalda ko‘rsatish', 'Показать значения таблицей'),
  'wr.table.hide': c('Hide table', 'Jadvalni yashirish', 'Скрыть таблицу'),
  'wr.col.skill': c('Skill', 'Ko‘nikma', 'Навык'),
  'wr.col.gap': c('Gap', 'Bo‘shliq', 'Разрыв'),
  'wr.baseline': c('baseline, not signal-tracked', 'bazaviy qiymat, signal kuzatilmaydi', 'базовое значение, без сигналов'),
  'wr.tracked': c('from periodic signals', 'davriy signallardan', 'по периодическим сигналам'),
  'wr.inPathway': c('in your pathway', 'yo‘nalishingizda', 'в вашей траектории'),
  'wr.aria': c(
    'Wind Rose chart comparing your level, market direction and pathway target for {n} skills. The same values are in the table and lists below.',
    '{n} ta ko‘nikma bo‘yicha darajangiz, bozor yo‘nalishi va yo‘nalish talabini solishtiruvchi Shamol guli diagrammasi. Xuddi shu qiymatlar quyidagi jadval va ro‘yxatlarda bor.',
    'Диаграмма «роза ветров»: ваш уровень, направление рынка и цель траектории по {n} навыкам. Те же значения приведены в таблице и списках ниже.',
  ),
  'wr.disclaimer': c(
    'Indicative: market values are deterministic estimates from periodic signals or baselines, not a validated forecast.',
    'Taxminiy: bozor qiymatlari davriy signallar yoki bazaviy qiymatlardan olingan deterministik baholar, tasdiqlangan prognoz emas.',
    'Ориентировочно: рыночные значения — детерминированные оценки по периодическим сигналам или базовым значениям, а не проверенный прогноз.',
  ),
  'wr.ask': c('Explain with the voice assistant', 'Ovozli yordamchi bilan tushuntirish', 'Объяснить голосовым помощником'),
  'wr.point': c('{skill}: you {you}, market {market}', '{skill}: siz {you}, bozor {market}', '{skill}: вы {you}, рынок {market}'),

  // Market demand (HTML bars, robust to long role titles)
  'md.index': c('Demand index', 'Talab indeksi', 'Индекс спроса'),
  'md.fit': c('{n}% fit', '{n}% mos', 'соответствие {n}%'),
  'md.what': c(
    'Longer bar = more demand expected for this pathway in the selected scenario. Indicative, 0–100.',
    'Chiziq qanchalik uzun bo‘lsa, tanlangan ssenariyda bu yo‘nalishga talab shuncha yuqori kutiladi. Taxminiy, 0–100.',
    'Чем длиннее полоса, тем выше ожидаемый спрос на траекторию в выбранном сценарии. Ориентировочно, 0–100.',
  ),
  'chart.index': c('Illustrative index', 'Taxminiy indeks', 'Ориентировочный индекс'),
  'chart.outlook': c('Demo outlook index', 'Demo istiqbol indeksi', 'Демо-индекс перспектив'),

  // Demand tab
  'demand.zeroNote': c(
    'Frequency and trend are 0 when no posting sample is available (demo baseline). Momentum then comes from the cited research horizon.',
    'E’lonlar namunasi bo‘lmaganda (demo bazaviy qiymat) chastota va trend 0 bo‘ladi. Bunda dinamika keltirilgan tadqiqot ufqidan olinadi.',
    'Частота и тренд равны 0, когда выборки вакансий нет (демо-база). Тогда динамика берётся из цитируемого исследовательского горизонта.',
  ),
  'demand.choose': c('Pathway', 'Yo‘nalish', 'Траектория'),

  // SDG tab
  'sdg.whyRole': c('Why {role} connects to the SDGs', 'Nima uchun {role} BRM bilan bog‘liq', 'Как траектория «{role}» связана с ЦУР'),
  'sdg.linked': c('Skills in this pathway that support each goal', 'Har bir maqsadni qo‘llab-quvvatlaydigan ushbu yo‘nalish ko‘nikmalari', 'Навыки траектории, поддерживающие каждую цель'),
  'sdg.have': c('You have', 'Sizda bor', 'Уже есть'),
  'sdg.learning': c('You will learn', 'O‘rganasiz', 'Предстоит изучить'),

  // Pathway: skill gaps and achievements
  'pw.gap.now': c('Now {n}/5', 'Hozir {n}/5', 'Сейчас {n}/5'),
  'pw.gap.need': c('Needed {n}/5', 'Kerak {n}/5', 'Нужно {n}/5'),
  'pw.badges.count': c('{n} of {total} earned', '{total} tadan {n} tasi olindi', 'Получено {n} из {total}'),
  'pw.badges.lede': c('Small milestones that mark real progress on your pathway.', 'Yo‘nalishingizdagi haqiqiy yutuqlarni belgilovchi kichik bosqichlar.', 'Небольшие вехи, отмечающие реальный прогресс на вашей траектории.'),
  'badge.first.d': c('Complete your first course', 'Birinchi kursingizni yakunlang', 'Пройдите первый курс'),
  'badge.halfway.d': c('Finish half of your pathway', 'Yo‘nalishingizning yarmini yakunlang', 'Пройдите половину траектории'),
  'badge.ai.d': c('Complete a course with AI skills', 'AI ko‘nikmalari bo‘yicha kursni yakunlang', 'Пройдите курс по навыкам ИИ'),
  'badge.green.d': c('Complete a green-skills course', '“Yashil” ko‘nikmalar kursini yakunlang', 'Пройдите курс по «зелёным» навыкам'),
  'badge.complete.d': c('Finish every course in your pathway', 'Yo‘nalishdagi barcha kurslarni yakunlang', 'Пройдите все курсы траектории'),
  'badge.earned': c('Earned', 'Olindi', 'Получен'),
  'badge.locked': c('Not yet', 'Hali emas', 'Пока нет'),

  // Learning sources
  'ls.title': c('Best places to learn your priority skills', 'Ustuvor ko‘nikmalarni o‘rganish uchun eng yaxshi manbalar', 'Где лучше изучать приоритетные навыки'),
  'ls.lede': c(
    'Ranked by your language, accessibility needs, cost and local relevance. Links open the provider’s official site.',
    'Tilingiz, qulaylik ehtiyojlaringiz, narx va mahalliy ahamiyat bo‘yicha tartiblangan. Havolalar provayderning rasmiy saytini ochadi.',
    'Отсортировано по языку, потребностям доступности, стоимости и местной значимости. Ссылки ведут на официальный сайт провайдера.',
  ),
  'ls.for': c('For {skill}', '{skill} uchun', 'Для навыка «{skill}»'),
  'ls.none': c('No provider in the catalogue covers this skill yet.', 'Katalogda bu ko‘nikmani qamraydigan provayder hali yo‘q.', 'В каталоге пока нет провайдера для этого навыка.'),
  'ls.note': c(
    'SkillCast lists providers, not guaranteed places or certificates. Check the current offer on the provider’s site.',
    'SkillCast provayderlarni ko‘rsatadi, kafolatlangan o‘rin yoki sertifikatni emas. Joriy taklifni provayder saytida tekshiring.',
    'SkillCast указывает провайдеров, а не гарантированные места или сертификаты. Проверяйте актуальное предложение на сайте провайдера.',
  ),
  'ls.why': c('Why here', 'Nima uchun bu yer', 'Почему здесь'),
  'ls.why.language': c('In your language', 'Sizning tilingizda', 'На вашем языке'),
  'ls.why.access': c('Fits your accessibility needs', 'Qulaylik ehtiyojlaringizga mos', 'Подходит под ваши потребности доступности'),
  'ls.why.free': c('Free', 'Bepul', 'Бесплатно'),
  'ls.why.local': c('In Uzbekistan', 'O‘zbekistonda', 'В Узбекистане'),
  'ls.why.official': c('Official or university provider', 'Rasmiy yoki universitet provayderi', 'Официальный или университетский провайдер'),
  'ls.cost.free': c('Free', 'Bepul', 'Бесплатно'),
  'ls.cost.freemium': c('Free to start', 'Boshlash bepul', 'Начать бесплатно'),
  'ls.cost.paid': c('Paid', 'Pullik', 'Платно'),
  'ls.region.uzbekistan': c('Uzbekistan', 'O‘zbekiston', 'Узбекистан'),
  'ls.region.international': c('International', 'Xalqaro', 'Международный'),
  'ls.ver.approved': c('From the approved source list', 'Tasdiqlangan manbalar ro‘yxatidan', 'Из утверждённого списка источников'),
  'ls.ver.curated': c('Curated · link not re-checked', 'Tanlangan · havola qayta tekshirilmagan', 'Подобран вручную · ссылка не перепроверена'),
  'ls.langs': c('Languages: {list}', 'Tillar: {list}', 'Языки: {list}'),
  'ls.lang.uz': c('Uzbek', 'O‘zbek', 'узбекский'),
  'ls.lang.ru': c('Russian', 'Rus', 'русский'),
  'ls.lang.en': c('English', 'Ingliz', 'английский'),
  'ls.open': c('Open official site', 'Rasmiy saytni ochish', 'Открыть официальный сайт'),

  // Inclusive opportunities
  'inc.title': c('Accessible and inclusive opportunities', 'Qulay va inklyuziv imkoniyatlar', 'Доступные и инклюзивные возможности'),
  'inc.lede': c(
    'Rights, programmes and standards that support learning and work for people with disabilities — part of every learner’s journey.',
    'Nogironligi bo‘lgan shaxslarning o‘qishi va ishlashini qo‘llab-quvvatlaydigan huquqlar, dasturlar va standartlar — har bir o‘quvchi yo‘lining bir qismi.',
    'Права, программы и стандарты, поддерживающие учёбу и работу людей с инвалидностью, — часть пути каждого учащегося.',
  ),
  'inc.work.title': c('Work options in your top pathways', 'Eng mos yo‘nalishlaringizdagi ish shartlari', 'Условия работы в ваших главных траекториях'),
  'inc.work.lede': c(
    'Indicative: options the typical tasks of each pathway often allow, based on SkillCast’s task profile, not employer data. Confirm adjustments with each employer.',
    'Taxminiy: har bir yo‘nalishning odatiy vazifalari ko‘pincha imkon beradigan shartlar; ish beruvchi ma’lumotlariga emas, SkillCast vazifalar profiliga asoslangan. Moslashuvlarni har bir ish beruvchi bilan aniqlang.',
    'Ориентировочно: условия, которые обычно допускают типичные задачи траектории; основано на профиле задач SkillCast, а не на данных работодателей. Уточняйте адаптации у каждого работодателя.',
  ),
  'inc.work.match': c('Matches your preferences', 'Afzalliklaringizga mos', 'Совпадает с вашими предпочтениями'),
  'inc.sources.title': c('Where to find rights, support and opportunities', 'Huquqlar, yordam va imkoniyatlarni qayerdan topish mumkin', 'Где найти права, поддержку и возможности'),
  'inc.noEmployers': c(
    'No verified list of disability-inclusive employers in Fergana is available yet. Employers are added only with a source and a check date.',
    'Farg‘onada nogironligi bo‘lgan shaxslarni ishga oladigan tasdiqlangan ish beruvchilar ro‘yxati hozircha yo‘q. Ish beruvchilar faqat manba va tekshiruv sanasi bilan qo‘shiladi.',
    'Проверенного списка инклюзивных работодателей в Фергане пока нет. Работодатели добавляются только с источником и датой проверки.',
  ),
  'inc.kind.rights': c('Rights', 'Huquqlar', 'Права'),
  'inc.kind.employment': c('Employment support', 'Bandlikka ko‘mak', 'Содействие занятости'),
  'inc.kind.vacancies': c('Vacancies', 'Vakansiyalar', 'Вакансии'),
  'inc.kind.employers': c('Employer network', 'Ish beruvchilar tarmog‘i', 'Сеть работодателей'),
  'inc.kind.standard': c('Accessibility standard', 'Qulaylik standarti', 'Стандарт доступности'),
  'inc.kind.training': c('Training', 'O‘qitish', 'Обучение'),
  'inc.kind.demo': c('Example', 'Misol', 'Пример'),
  'inc.scope.district': c('Fergana District', 'Farg‘ona tumani', 'Ферганский район'),
  'inc.scope.national': c('Uzbekistan', 'O‘zbekiston', 'Узбекистан'),
  'inc.scope.global': c('International', 'Xalqaro', 'Международный'),
  'inc.ver.approved': c('Approved source list', 'Tasdiqlangan manbalar ro‘yxati', 'Утверждённый список источников'),
  'inc.ver.official': c('Official publisher · page not re-checked', 'Rasmiy nashriyotchi · sahifa qayta tekshirilmagan', 'Официальный издатель · страница не перепроверена'),
  'inc.ver.curated': c('Curated · not re-checked', 'Tanlangan · qayta tekshirilmagan', 'Подобрано вручную · не перепроверено'),
  'inc.ver.demo': c('Fictional demo', 'To‘qima demo', 'Вымышленный пример'),
  'inc.open': c('Open source', 'Manbani ochish', 'Открыть источник'),
  'common.newTab': c('opens in a new tab', 'yangi oynada ochiladi', 'откроется в новой вкладке'),
  'inc.noLink': c('No link: fictional example', 'Havola yo‘q: to‘qima misol', 'Без ссылки: вымышленный пример'),
  'inc.yourNeeds': c('From your profile', 'Profilingizdan', 'Из вашего профиля'),

  // Accessibility settings
  'a11y.title': c('Accessibility', 'Qulaylik sozlamalari', 'Доступность'),
  'a11y.lede': c(
    'SkillCast works with a keyboard, screen readers and voice. Adjust the display to suit you; settings are saved in this browser.',
    'SkillCast klaviatura, ekran o‘quvchi dasturlar va ovoz bilan ishlaydi. Ko‘rinishni o‘zingizga moslang; sozlamalar shu brauzerda saqlanadi.',
    'SkillCast работает с клавиатурой, скринридерами и голосом. Настройте отображение под себя; настройки сохраняются в этом браузере.',
  ),
  'a11y.text': c('Text size', 'Matn o‘lchami', 'Размер текста'),
  'a11y.text.normal': c('Standard', 'Odatiy', 'Обычный'),
  'a11y.text.large': c('Large', 'Katta', 'Крупный'),
  'a11y.text.larger': c('Largest', 'Eng katta', 'Очень крупный'),
  'a11y.contrast': c('High contrast', 'Yuqori kontrast', 'Высокий контраст'),
  'a11y.motion': c('Reduce motion', 'Harakatni kamaytirish', 'Меньше анимации'),
  'a11y.links': c('Underline links', 'Havolalarni tagiga chizish', 'Подчёркивать ссылки'),
  'a11y.spacing': c('Easier reading spacing', 'O‘qish uchun qulay oraliq', 'Удобные для чтения интервалы'),
  'a11y.voice': c('Open voice assistant', 'Ovozli yordamchini ochish', 'Открыть голосового помощника'),
  'a11y.reset': c('Reset display settings', 'Ko‘rinish sozlamalarini tiklash', 'Сбросить настройки отображения'),
  'a11y.skip': c('Skip to main content', 'Asosiy mazmunga o‘tish', 'Перейти к основному содержанию'),
  'a11y.button': c('Accessibility and voice', 'Qulaylik va ovoz', 'Доступность и голос'),
  'landing.a11y.title': c('Accessible by design', 'Hamma uchun qulay', 'Доступность по умолчанию'),
  'landing.a11y.desc': c(
    'Keyboard and screen-reader support, adjustable text and contrast, and a voice assistant in Uzbek, Russian and English. Inclusive work and study options sit inside every learner’s journey.',
    'Klaviatura va ekran o‘quvchi dasturlarni qo‘llab-quvvatlash, matn va kontrastni sozlash hamda o‘zbek, rus va ingliz tillarida ovozli yordamchi. Inklyuziv ish va o‘qish imkoniyatlari har bir o‘quvchi yo‘liga kiritilgan.',
    'Поддержка клавиатуры и скринридеров, настройка текста и контраста, голосовой помощник на узбекском, русском и английском. Инклюзивные варианты работы и учёбы встроены в путь каждого учащегося.',
  ),

  // Voice assistant
  'va.title': c('Voice assistant', 'Ovozli yordamchi', 'Голосовой помощник'),
  'va.scope': c(
    'Ask by voice or by typing. I can open sections, explain skills and your Wind Rose, suggest what to learn next, recommend pathways, read recommendations aloud, and search pathways, courses, learning sources and inclusive opportunities. I don’t browse the internet or list live vacancies.',
    'Ovoz yoki matn orqali so‘rang. Men bo‘limlarni ochaman, ko‘nikmalar va Shamol gulingizni tushuntiraman, keyin nimani o‘rganishni maslahat beraman, yo‘nalishlarni tavsiya qilaman, tavsiyalarni ovoz chiqarib o‘qiyman hamda yo‘nalishlar, kurslar, o‘quv manbalari va inklyuziv imkoniyatlarni qidiraman. Internetni ko‘rib chiqmayman va jonli vakansiyalarni ko‘rsatmayman.',
    'Спрашивайте голосом или текстом. Я открываю разделы, объясняю навыки и вашу розу ветров, подсказываю, что изучать дальше, рекомендую траектории, читаю рекомендации вслух и ищу траектории, курсы, учебные ресурсы и инклюзивные возможности. Я не ищу в интернете и не показываю актуальные вакансии.',
  ),
  'va.mic.start': c('Start speaking', 'Gapirishni boshlash', 'Начать говорить'),
  'va.mic.stop': c('Stop listening', 'Tinglashni to‘xtatish', 'Остановить прослушивание'),
  'va.listening': c('Listening…', 'Tinglayapman…', 'Слушаю…'),
  'va.mic.unsupported': c(
    'Voice input isn’t available in this browser (it works in Chrome and Edge). You can type instead; answers can still be read aloud.',
    'Bu brauzerda ovozli kiritish mavjud emas (Chrome va Edge’da ishlaydi). Uning o‘rniga yozishingiz mumkin; javoblarni baribir ovoz chiqarib o‘qish mumkin.',
    'Голосовой ввод в этом браузере недоступен (работает в Chrome и Edge). Можно печатать; ответы всё равно можно слушать.',
  ),
  'va.mic.denied': c('Microphone access was blocked. Allow it in your browser, or type your question.', 'Mikrofonga ruxsat berilmagan. Brauzerda ruxsat bering yoki savolingizni yozing.', 'Доступ к микрофону запрещён. Разрешите его в браузере или напишите вопрос.'),
  'va.mic.error': c('Voice input stopped. Try again or type your question.', 'Ovozli kiritish to‘xtadi. Qayta urinib ko‘ring yoki savolingizni yozing.', 'Голосовой ввод остановлен. Попробуйте снова или напишите вопрос.'),
  'va.input': c('Type a question or command', 'Savol yoki buyruq yozing', 'Напишите вопрос или команду'),
  'va.send': c('Ask', 'So‘rash', 'Спросить'),
  'va.speak': c('Read answers aloud', 'Javoblarni ovoz chiqarib o‘qish', 'Читать ответы вслух'),
  'va.stop': c('Stop reading', 'O‘qishni to‘xtatish', 'Остановить чтение'),
  'va.noVoice': c(
    'This device has no {lang} voice installed, so answers are shown as text. You can add a voice in your system’s speech settings.',
    'Bu qurilmada {lang} ovozi o‘rnatilmagan, shuning uchun javoblar matn sifatida ko‘rsatiladi. Ovozni tizimning nutq sozlamalarida qo‘shishingiz mumkin.',
    'На устройстве не установлен голос ({lang}), поэтому ответы показаны текстом. Голос можно добавить в настройках речи системы.',
  ),
  'va.noSpeech': c('Reading aloud is not available in this browser.', 'Bu brauzerda ovoz chiqarib o‘qish mavjud emas.', 'Чтение вслух в этом браузере недоступно.'),
  'va.examples': c('Try asking', 'Masalan, so‘rang', 'Попробуйте спросить'),
  'va.ex.next': c('What should I learn next?', 'Keyingi nima o‘rganishim kerak?', 'Что мне изучать дальше?'),
  'va.ex.radar': c('Explain my Wind Rose', 'Shamol gulimni tushuntir', 'Объясни мою розу ветров'),
  'va.ex.careers': c('Which careers suit me?', 'Qaysi kasblar menga mos?', 'Какие профессии мне подходят?'),
  'va.ex.read': c('Read my recommendations aloud', 'Tavsiyalarimni o‘qib ber', 'Прочитай мои рекомендации'),
  'va.ex.search': c('Find courses for English', 'Ingliz tili uchun kurslarni qidir', 'Найди курсы по английскому'),
  'va.ex.inclusive': c('Show inclusive opportunities', 'Inklyuziv imkoniyatlarni ko‘rsat', 'Покажи инклюзивные возможности'),
  'va.you': c('You', 'Siz', 'Вы'),
  'va.assistant': c('Assistant', 'Yordamchi', 'Помощник'),
  'va.r.help': c(
    'You can ask me what to learn next, which careers suit you, what a skill means, to explain your Wind Rose, to read your recommendations aloud, to search for courses or inclusive opportunities, or to open a section.',
    'Mendan keyin nimani o‘rganish, qaysi kasblar sizga mos, biror ko‘nikma nimani anglatishi haqida so‘rashingiz, Shamol gulingizni tushuntirish, tavsiyalaringizni ovoz chiqarib o‘qish, kurslar yoki inklyuziv imkoniyatlarni qidirish yoki biror bo‘limni ochishni so‘rashingiz mumkin.',
    'Спросите меня, что изучать дальше, какие профессии вам подходят, что означает навык; попросите объяснить розу ветров, прочитать рекомендации вслух, найти курсы или инклюзивные возможности или открыть раздел.',
  ),
  'va.r.nav': c('Opened: {section}.', 'Ochildi: {section}.', 'Открыт раздел: {section}.'),
  'va.r.skill': c(
    '{skill} belongs to {category}. Market momentum: {market} of 100 ({source}). Your level: {level} of 5. It appears in {roles} SkillCast pathways and {courses} catalogue courses.',
    '{skill} — {category} sohasiga kiradi. Bozor dinamikasi: 100 dan {market} ({source}). Sizning darajangiz: 5 dan {level}. U SkillCast’ning {roles} ta yo‘nalishida va katalogdagi {courses} ta kursda uchraydi.',
    '{skill} относится к сфере «{category}». Динамика рынка: {market} из 100 ({source}). Ваш уровень: {level} из 5. Встречается в {roles} траекториях SkillCast и {courses} курсах каталога.',
  ),
  'va.r.next': c(
    'Next to learn: {course} from {provider}. It builds {skills}. I opened “What to learn” so you can start.',
    'Keyingi o‘rganish: “{course}” ({provider}). U quyidagi ko‘nikmalarni rivojlantiradi: {skills}. Boshlashingiz uchun “Nimani o‘rganish kerak” bo‘limini ochdim.',
    'Изучить далее: «{course}» от {provider}. Курс развивает навыки: {skills}. Я открыл раздел «Что изучать», чтобы вы могли начать.',
  ),
  'va.r.next.none': c('Choose a pathway first, then I can suggest your next course. I opened your pathways.', 'Avval yo‘nalish tanlang, keyin keyingi kursni tavsiya qila olaman. Yo‘nalishlaringizni ochdim.', 'Сначала выберите траекторию, тогда я подскажу следующий курс. Я открыл ваши траектории.'),
  'va.r.careers': c(
    'Your strongest pathways: {list}. I opened Learning & career pathways so you can compare them.',
    'Eng mos yo‘nalishlaringiz: {list}. Ularni solishtirishingiz uchun “O‘quv va kasbiy yo‘nalishlar”ni ochdim.',
    'Самые подходящие траектории: {list}. Я открыл «Учебные и карьерные траектории», чтобы вы их сравнили.',
  ),
  'va.r.careers.none': c('Complete your learner profile to get pathway recommendations.', 'Yo‘nalish tavsiyalarini olish uchun o‘quvchi profilingizni to‘ldiring.', 'Заполните профиль учащегося, чтобы получить рекомендации по траекториям.'),
  'va.r.read': c(
    'Your learning snapshot. Leading pathway: {role}, {fit} percent fit. Improve next: {gaps}. Next course: {course}.',
    'O‘quv holatingiz. Asosiy yo‘nalish: {role}, moslik {fit} foiz. Keyingi navbatda yaxshilang: {gaps}. Keyingi kurs: {course}.',
    'Ваш учебный срез. Ведущая траектория: {role}, соответствие {fit} процентов. Улучшить в первую очередь: {gaps}. Следующий курс: {course}.',
  ),
  'va.r.radar': c(
    'Your Wind Rose compares three things for each skill: the blue area is your current level, the violet line is where market demand is moving, and the amber dashed line is what your pathway needs. Where violet or amber reach further than blue, that is a gap. Improve next: {gaps}.',
    'Shamol gulingiz har bir ko‘nikma bo‘yicha uch narsani solishtiradi: ko‘k maydon — hozirgi darajangiz, binafsha chiziq — bozor talabi qayerga siljiyotgani, sariq uzuq chiziq — yo‘nalishingiz talab qiladigan daraja. Binafsha yoki sariq chiziq ko‘k maydondan uzoqroqqa chiqqan joy — bo‘shliq. Keyingi navbatda yaxshilang: {gaps}.',
    'Роза ветров сравнивает по каждому навыку три вещи: синяя область — ваш текущий уровень, фиолетовая линия — куда движется спрос, жёлтая пунктирная — что нужно вашей траектории. Где фиолетовая или жёлтая линия выходит дальше синей области, там пробел. Улучшить в первую очередь: {gaps}.',
  ),
  'va.r.noGaps': c('no large gaps', 'katta bo‘shliqlar yo‘q', 'больших пробелов нет'),
  'va.r.none': c('not chosen yet', 'hali tanlanmagan', 'пока не выбрано'),
  'va.r.search': c('I found: {list}.', 'Topdim: {list}.', 'Нашёл: {list}.'),
  'va.r.search.none': c(
    'Nothing in SkillCast matches “{q}”. For live vacancies, use the national vacancy database ish.mehnat.uz.',
    'SkillCast’da “{q}” ga mos narsa topilmadi. Jonli vakansiyalar uchun milliy vakansiyalar bazasi ish.mehnat.uz’dan foydalaning.',
    'В SkillCast нет совпадений для «{q}». Актуальные вакансии ищите в национальной базе ish.mehnat.uz.',
  ),
  'va.r.search.jobs': c('SkillCast does not list live vacancies; for those, use ish.mehnat.uz.', 'SkillCast jonli vakansiyalarni ko‘rsatmaydi; ular uchun ish.mehnat.uz’dan foydalaning.', 'SkillCast не показывает актуальные вакансии; для этого используйте ish.mehnat.uz.'),
  'va.r.a11y': c('Opened accessibility settings: text size, contrast, motion and link underlines.', 'Qulaylik sozlamalari ochildi: matn o‘lchami, kontrast, harakat va havolalar tagidagi chiziq.', 'Открыты настройки доступности: размер текста, контраст, анимация и подчёркивание ссылок.'),
  'va.r.unknown': c(
    'I didn’t understand that. Try “What should I learn next?”, “Explain my Wind Rose” or “Open SDG impact”.',
    'Tushunmadim. “Keyingi nima o‘rganishim kerak?”, “Shamol gulimni tushuntir” yoki “BRM ta’sirini och” deb ko‘ring.',
    'Не понял. Попробуйте: «Что мне изучать дальше?», «Объясни мою розу ветров» или «Открой вклад в ЦУР».',
  ),
  'va.type.role': c('pathway', 'yo‘nalish', 'траектория'),
  'va.type.course': c('course', 'kurs', 'курс'),
  'va.type.source': c('learning source', 'o‘quv manbasi', 'учебный ресурс'),
  'va.type.inclusive': c('inclusive opportunity', 'inklyuziv imkoniyat', 'инклюзивная возможность'),
  'va.type.skill': c('skill', 'ko‘nikma', 'навык'),
};
