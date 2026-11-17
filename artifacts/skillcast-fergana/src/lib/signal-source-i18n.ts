import { useSkillCast } from '@/lib/store';
import type { Lang } from '@/lib/types';

// ─── Signal source copy (EN / UZ / RU) ─────────────────────────────────────
// Main i18n merges these into the strict dictionaries. Components use
// useSourceT(), which reads this table directly so a missing merge never crashes.

type Copy = { en: string; uz: string; ru: string };
const c = (en: string, uz: string, ru: string): Copy => ({ en, uz, ru });

export const SOURCE_COPY: Record<string, Copy> = {
  // Page
  'src.page.title': c('Signal sources', 'Signal manbalari', 'Источники сигналов'),
  'src.page.lede': c(
    'Where every number comes from, when it was checked, and what it can and cannot tell a learner in Fergana City.',
    'Har bir raqam qayerdan olingani, qachon tekshirilgani va u Farg‘ona shahridagi o‘quvchiga nimani ayta olishi va ayta olmasligi.',
    'Откуда взято каждое число, когда оно проверено и что оно может и не может сказать учащемуся в Фергане.',
  ),
  'src.refresh': c('Check sources', 'Manbalarni tekshirish', 'Проверить источники'),
  'src.refreshing': c('Checking sources…', 'Manbalar tekshirilmoqda…', 'Проверка источников…'),
  'src.refreshLimited': c(
    'Checks are rate-limited: Remotive at most four times a day; statistics are cached between scheduled checks. A refresh may return the cached result.',
    'Tekshiruvlar cheklangan: Remotive kuniga ko‘pi bilan to‘rt marta; statistika rejalashtirilgan tekshiruvlar orasida keshda saqlanadi. Yangilash keshdagi natijani qaytarishi mumkin.',
    'Проверки ограничены: Remotive не чаще четырёх раз в день; статистика кешируется между плановыми проверками. Обновление может вернуть кешированный результат.',
  ),
  'src.error.title': c('Signal data could not be loaded', 'Signal ma’lumotlarini yuklab bo‘lmadi', 'Не удалось загрузить данные сигналов'),
  'src.error.body': c(
    'The SkillCast API did not respond. Official source links below still work.',
    'SkillCast API javob bermadi. Quyidagi rasmiy manba havolalari ishlashda davom etadi.',
    'API SkillCast не ответил. Официальные ссылки на источники ниже по-прежнему доступны.',
  ),
  'src.retry': c('Try again', 'Qayta urinish', 'Повторить'),

  // Modes and statuses
  'src.mode.periodic': c('Periodic check', 'Davriy tekshiruv', 'Периодическая проверка'),
  'src.mode.cached': c('Cached result', 'Keshdagi natija', 'Кешированный результат'),
  'src.mode.demo': c('Demo baseline', 'Demo bazaviy qiymat', 'Демо-база'),
  'src.mode.demo.note': c(
    'Demo baseline: no Remotive aggregate is available, so skill momentum uses curated seed values. Posting count is 0.',
    'Demo bazaviy qiymat: Remotive yig‘indisi mavjud emas, shuning uchun ko‘nikma dinamikasi tanlangan boshlang‘ich qiymatlardan foydalanadi. E’lonlar soni 0.',
    'Демо-база: агрегат Remotive недоступен, поэтому динамика навыков основана на подобранных исходных значениях. Число вакансий 0.',
  ),
  'src.mode.actual.note': c(
    '{n} global remote postings from Remotive counted (listings delayed 24 hours). Not Fergana vacancies.',
    'Remotive’dan {n} ta global masofaviy e’lon hisoblandi (e’lonlar 24 soat kechikadi). Bu Farg‘ona vakansiyalari emas.',
    'Учтено {n} глобальных удалённых вакансий Remotive (задержка 24 часа). Это не вакансии Ферганы.',
  ),
  'src.status.periodic': c('Updated periodically', 'Davriy yangilanadi', 'Обновляется периодически'),
  'src.status.cached': c('Cached', 'Keshda', 'Из кеша'),
  'src.status.unavailable': c('Unavailable', 'Mavjud emas', 'Недоступен'),
  'src.status.reference': c('Reference source', 'Ma’lumotnoma manbasi', 'Справочный источник'),
  'src.status.planned': c('Planned integration', 'Rejalashtirilgan integratsiya', 'Планируемая интеграция'),
  'src.status.keyRequired': c('Planned · API key required', 'Rejalashtirilgan · API kaliti kerak', 'Планируется · нужен ключ API'),
  'src.notRealtime': c('Not real-time', 'Real vaqtda emas', 'Не в реальном времени'),
  'src.unavailable.generic': c(
    'This source could not be reached at the last check. The last good snapshot is used if one exists.',
    'Oxirgi tekshiruvda bu manbaga ulanib bo‘lmadi. Agar mavjud bo‘lsa, oxirgi yaroqli nusxa ishlatiladi.',
    'При последней проверке источник был недоступен. Используется последний удачный снимок, если он есть.',
  ),

  // Field labels
  'src.f.scope': c('Scope', 'Qamrov', 'Охват'),
  'src.f.type': c('Type', 'Turi', 'Тип'),
  'src.f.tier': c('Tier', 'Daraja', 'Уровень'),
  'src.f.frequency': c('Update frequency', 'Yangilanish chastotasi', 'Частота обновления'),
  'src.f.lastUpdated': c('Last updated', 'Oxirgi yangilanish', 'Последнее обновление'),
  'src.f.licence': c('Licence', 'Litsenziya', 'Лицензия'),
  'src.f.checked': c('Checked', 'Tekshirilgan', 'Проверено'),
  'src.f.fetched': c('Retrieved', 'Olingan', 'Получено'),
  'src.f.sourceUpdated': c('Publisher update', 'Nashriyot yangilanishi', 'Обновление издателя'),
  'src.f.period': c('Data period', 'Ma’lumot davri', 'Период данных'),
  'src.f.nextCheck': c('Next check', 'Keyingi tekshiruv', 'Следующая проверка'),
  'src.f.calculated': c('Calculated', 'Hisoblangan', 'Рассчитано'),
  'src.f.postings': c('Postings counted', 'Hisoblangan e’lonlar', 'Учтено вакансий'),
  'src.unknown': c('Unknown', 'Noma’lum', 'Неизвестно'),
  'src.notVerified': c('Not verified', 'Tasdiqlanmagan', 'Не подтверждено'),
  'src.licence.unverified': c('Unverified · check publisher terms', 'Tasdiqlanmagan · nashriyot shartlarini tekshiring', 'Не подтверждена · см. условия издателя'),
  'src.licence.attribution': c('Attribution required by publisher terms', 'Nashriyot shartlariga ko‘ra manba ko‘rsatilishi shart', 'По условиям издателя нужна ссылка на источник'),
  'src.link.official': c('Official source', 'Rasmiy manba', 'Официальный источник'),
  'src.link.docs': c('Documentation', 'Hujjatlar', 'Документация'),
  'src.newTab': c('opens in a new tab', 'yangi oynada ochiladi', 'откроется в новой вкладке'),

  // Scopes
  'src.scope.city': c('City', 'Shahar', 'Город'),
  'src.scope.district': c('District', 'Tuman', 'Район'),
  'src.scope.region': c('Fergana Region', 'Farg‘ona viloyati', 'Ферганская область'),
  'src.scope.valley': c('Ferghana Valley', 'Farg‘ona vodiysi', 'Ферганская долина'),
  'src.scope.national': c('Uzbekistan (national)', 'O‘zbekiston (milliy)', 'Узбекистан (национальный)'),
  'src.scope.global': c('Global', 'Global', 'Глобальный'),
  'src.scope.globalRemote': c('Global remote demand', 'Global masofaviy talab', 'Глобальный удалённый спрос'),
  'src.scope.eu': c('European Union', 'Yevropa Ittifoqi', 'Европейский союз'),
  'src.scope.us': c('United States', 'AQSH', 'США'),
  'src.scope.noCity': c(
    'No source in this catalogue publishes Fergana City data. Regional figures describe Fergana Region.',
    'Ushbu katalogdagi hech bir manba Farg‘ona shahri ma’lumotlarini e’lon qilmaydi. Hududiy ko‘rsatkichlar Farg‘ona viloyatiga tegishli.',
    'Ни один источник каталога не публикует данные по городу Фергана. Региональные показатели относятся к Ферганской области.',
  ),

  // Types
  'src.type.statistics': c('Official statistics', 'Rasmiy statistika', 'Официальная статистика'),
  'src.type.api': c('Statistics API', 'Statistika API', 'API статистики'),
  'src.type.jobs': c('Job listings', 'Vakansiya e’lonlari', 'Вакансии'),
  'src.type.portal': c('Government portal', 'Davlat portali', 'Госпортал'),
  'src.type.report': c('Report', 'Hisobot', 'Отчёт'),
  'src.type.framework': c('Framework', 'Asos hujjat', 'Рамочный документ'),
  'src.type.taxonomy': c('Skills taxonomy', 'Ko‘nikmalar tasnifi', 'Таксономия навыков'),
  'src.type.course': c('Free course', 'Bepul kurs', 'Бесплатный курс'),
  'src.type.academic': c('Academic research', 'Ilmiy tadqiqot', 'Научное исследование'),
  'src.tier.1': c('Tier 1 · official/primary', '1-daraja · rasmiy/birlamchi', 'Уровень 1 · официальный', ),
  'src.tier.2': c('Tier 2 · international organisation', '2-daraja · xalqaro tashkilot', 'Уровень 2 · международная организация'),
  'src.tier.3': c('Tier 3 · academic', '3-daraja · akademik', 'Уровень 3 · академический'),
  'src.tier.4': c('Tier 4 · secondary', '4-daraja · ikkilamchi', 'Уровень 4 · вторичный'),
  'src.freq.weekly': c('Bulk files weekly (Sundays)', 'Yig‘ma fayllar har hafta (yakshanba)', 'Массовые файлы еженедельно (воскресенье)'),
  'src.freq.remotive': c('Listings delayed 24 hours; checked at most 4 times a day', 'E’lonlar 24 soat kechikadi; kuniga ko‘pi bilan 4 marta tekshiriladi', 'Задержка 24 часа; проверка не чаще 4 раз в день'),

  // Groups
  'src.group.integrated': c('Retrieved periodically', 'Davriy olinadigan manbalar', 'Периодически получаемые'),
  'src.group.integrated.d': c('The backend downloads these on a schedule. None is real-time.', 'Backend ularni jadval bo‘yicha yuklaydi. Hech biri real vaqtda emas.', 'Сервер загружает их по расписанию. Ни один не работает в реальном времени.'),
  'src.group.uzbekistan': c('Uzbekistan and Fergana references', 'O‘zbekiston va Farg‘ona manbalari', 'Источники по Узбекистану и Фергане'),
  'src.group.uzbekistan.d': c('Linked for context. Not retrieved by SkillCast.', 'Kontekst uchun havola. SkillCast tomonidan olinmaydi.', 'Ссылки для контекста. SkillCast их не загружает.'),
  'src.group.global': c('Global data · planned', 'Global ma’lumotlar · rejalashtirilgan', 'Глобальные данные · планируется'),
  'src.group.global.d': c('Not integrated yet. Some require API keys stored server-side.', 'Hali integratsiya qilinmagan. Ba’zilari serverda saqlanadigan API kalitini talab qiladi.', 'Пока не интегрированы. Некоторым нужны ключи API на сервере.'),
  'src.group.reports': c('Reports and frameworks · static citations', 'Hisobotlar va asoslar · statik iqtiboslar', 'Отчёты и рамки · статичные ссылки'),
  'src.group.reports.d': c('Published documents. They inform design choices and cannot provide live data.', 'Nashr etilgan hujjatlar. Ular dizayn qarorlariga asos bo‘ladi, jonli ma’lumot bermaydi.', 'Опубликованные документы. Они обосновывают решения, но не дают живых данных.'),
  'src.group.academic': c('Academic research · optional', 'Ilmiy tadqiqotlar · ixtiyoriy', 'Научные работы · опционально'),
  'src.group.academic.d': c('Peer-reviewed or preprint background reading.', 'Taqrizlangan yoki preprint asosiy adabiyot.', 'Рецензируемые статьи или препринты для справки.'),
  'src.filter.all': c('All', 'Barchasi', 'Все'),
  'src.filter.label': c('Filter by scope', 'Qamrov bo‘yicha saralash', 'Фильтр по охвату'),
  'src.catalogue.title': c('Approved source catalogue', 'Tasdiqlangan manbalar katalogi', 'Каталог одобренных источников'),
  'src.catalogue.count': c('{n} sources', '{n} ta manba', 'Источников: {n}'),
  'src.excluded': c(
    'Removed: single-employer job boards (Greenhouse and companies hosted on it, Ashby), Arbeitnow, Cloudflare (careers board and Radar traffic data) and obsolete Malaysian sources. They do not describe the Fergana or Uzbek labour market.',
    'Olib tashlandi: bitta ish beruvchi e’lon taxtalari (Greenhouse va undagi kompaniyalar, Ashby), Arbeitnow, Cloudflare (karyera sahifasi va Radar trafik ma’lumotlari) hamda eskirgan Malayziya manbalari. Ular Farg‘ona yoki O‘zbekiston mehnat bozorini tavsiflamaydi.',
    'Удалены: доски вакансий отдельных работодателей (Greenhouse и компании на нём, Ashby), Arbeitnow, Cloudflare (карьерная страница и данные трафика Radar) и устаревшие малайзийские источники. Они не описывают рынок труда Ферганы или Узбекистана.',
  ),

  // Source descriptions
  'src.desc.siat': c('Employment rate of the working-age population for Fergana Region and Uzbekistan, downloaded as JSON.', 'Farg‘ona viloyati va O‘zbekiston bo‘yicha mehnatga layoqatli aholi bandlik darajasi, JSON ko‘rinishida yuklanadi.', 'Уровень занятости трудоспособного населения Ферганской области и Узбекистана, загрузка в JSON.'),
  'src.desc.worldbank': c('Modelled ILO labour force participation rate, population 15+, for Uzbekistan via the v2 API (no key).', 'O‘zbekiston uchun 15+ yoshdagi aholining modellashtirilgan XMT ishchi kuchi ishtiroki darajasi, v2 API orqali (kalitsiz).', 'Модельная оценка МОТ участия в рабочей силе населения 15+ для Узбекистана через API v2 (без ключа).'),
  'src.desc.remotive': c('Global remote job listings, used only to count skill keywords. Jobs are not republished.', 'Global masofaviy ish e’lonlari, faqat ko‘nikma kalit so‘zlarini sanash uchun. E’lonlar qayta nashr etilmaydi.', 'Глобальные удалённые вакансии, используются только для подсчёта навыков. Вакансии не публикуются повторно.'),
  'src.desc.dataegov': c('National government datasets. The API requires an access key; not configured.', 'Milliy davlat ma’lumotlar to‘plamlari. API kirish kalitini talab qiladi; sozlanmagan.', 'Государственные наборы данных. API требует ключ доступа; не настроен.'),
  'src.desc.mehnat': c('Employment programmes, vocational training and quotas. The Fergana District report is a programme example, not city data.', 'Bandlik dasturlari, kasbiy ta’lim va kvotalar. Farg‘ona tumani hisoboti dastur namunasi, shahar ma’lumoti emas.', 'Программы занятости, профобучение и квоты. Отчёт Ферганского района — пример программы, не данные города.'),
  'src.desc.ishmehnat': c('National vacancy database. No public API found; login required. Not retrieved.', 'Milliy vakansiyalar bazasi. Ochiq API topilmadi; kirish talab qilinadi. Olinmaydi.', 'Национальная база вакансий. Публичный API не найден; нужен вход. Не загружается.'),
  'src.desc.civilservice': c('Public-sector vacancies. No API. Linked for learners only.', 'Davlat sektori vakansiyalari. API yo‘q. Faqat o‘quvchilar uchun havola.', 'Вакансии госсектора. API нет. Ссылка для учащихся.'),
  'src.desc.itpark': c('Digital inclusion project news, including regional training. Secondary context.', 'Raqamli inklyuziya loyihasi yangiliklari, jumladan hududiy treninglar. Ikkilamchi kontekst.', 'Новости проекта цифровой инклюзии, включая региональное обучение. Вторичный контекст.'),
  'src.desc.undpvalley': c('Evaluation of vocational and digital skills training across the Ferghana Valley, not Fergana City.', 'Farg‘ona vodiysi bo‘ylab kasbiy va raqamli ko‘nikmalar treningi baholanishi, Farg‘ona shahri emas.', 'Оценка профессионального и цифрового обучения в Ферганской долине, не в городе Фергана.'),
  'src.desc.ilostat': c('Labour statistics with SDMX API and weekly bulk files. Uzbek series not yet confirmed or integrated.', 'SDMX API va haftalik yig‘ma fayllarga ega mehnat statistikasi. O‘zbekiston qatorlari hali tasdiqlanmagan va integratsiya qilinmagan.', 'Статистика труда с API SDMX и еженедельными файлами. Ряды по Узбекистану ещё не подтверждены и не интегрированы.'),
  'src.desc.uis': c('SDG 4 education indicators. Current Data API not configured; the old SDMX API is retired.', 'SDG 4 ta’lim ko‘rsatkichlari. Joriy Data API sozlanmagan; eski SDMX API to‘xtatilgan.', 'Показатели образования ЦУР 4. Текущий Data API не настроен; старый SDMX API закрыт.'),
  'src.desc.sdg': c('National SDG indicator series via SDMX. Not integrated. No Fergana-level SDG coverage.', 'SDMX orqali milliy SDG ko‘rsatkichlari. Integratsiya qilinmagan. Farg‘ona darajasida SDG qamrovi yo‘q.', 'Национальные ряды ЦУР через SDMX. Не интегрированы. Данных ЦУР по Фергане нет.'),
  'src.desc.itu': c('ICT skills data collection began in 2024 with limited country reporting.', 'AKT ko‘nikmalari ma’lumotlarini yig‘ish 2024-yilda cheklangan mamlakatlar bilan boshlangan.', 'Сбор данных о навыках ИКТ начат в 2024 году при ограниченном числе стран.'),
  'src.desc.esco': c('European skills and occupations vocabulary. EU framework, no Uzbek data.', 'Yevropa ko‘nikmalar va kasblar lug‘ati. YI asosi, O‘zbekiston ma’lumotlari yo‘q.', 'Европейский словарь навыков и профессий. Рамка ЕС, данных по Узбекистану нет.'),
  'src.desc.onet': c('US occupation skills, tasks and technologies. Key required; attribution required.', 'AQSH kasblari bo‘yicha ko‘nikmalar, vazifalar va texnologiyalar. Kalit va manba ko‘rsatish talab qilinadi.', 'Навыки, задачи и технологии профессий США. Нужны ключ и указание источника.'),
  'src.desc.adzuna': c('Job postings and salary analytics. Key required; Uzbekistan not covered.', 'Vakansiyalar va maosh tahlili. Kalit talab qilinadi; O‘zbekiston qamrab olinmagan.', 'Вакансии и аналитика зарплат. Нужен ключ; Узбекистан не охвачен.'),
  'src.desc.wef': c('Global employer survey on skills and roles to 2030. Inspires skill selection; its figures are not used as weights.', '2030-yilgacha ko‘nikmalar va lavozimlar bo‘yicha global ish beruvchilar so‘rovi. Ko‘nikma tanloviga ilhom beradi; raqamlari vazn sifatida ishlatilmaydi.', 'Глобальный опрос работодателей о навыках до 2030 года. Вдохновляет выбор навыков; его цифры не используются как веса.'),
  'src.desc.ilowp140': c('Task-level GenAI exposure. Exposure is not job loss.', 'Vazifa darajasida GenAI ta’siri. Ta’sir ish o‘rnini yo‘qotish degani emas.', 'Подверженность задач влиянию GenAI. Подверженность не означает потерю работы.'),
  'src.desc.unescoiite': c('Uzbekistan-specific ICT skills report. National scope.', 'O‘zbekistonga oid AKT ko‘nikmalari hisoboti. Milliy qamrov.', 'Отчёт о навыках ИКТ в Узбекистане. Национальный охват.'),
  'src.desc.oecd': c('Digital skills and private-sector competitiveness in Uzbekistan. National scope.', 'O‘zbekistonda raqamli ko‘nikmalar va xususiy sektor raqobatbardoshligi. Milliy qamrov.', 'Цифровые навыки и конкурентоспособность частного сектора Узбекистана. Национальный охват.'),
  'src.desc.undpgdd': c('Gender digital divide assessment for Uzbekistan (SDG 5 context).', 'O‘zbekiston uchun raqamli gender tafovuti baholanishi (SDG 5 konteksti).', 'Оценка гендерного цифрового разрыва в Узбекистане (контекст ЦУР 5).'),
  'src.desc.undphdr': c('AI and human development; national ranking context only.', 'Sun’iy intellekt va inson taraqqiyoti; faqat milliy reyting konteksti.', 'ИИ и человеческое развитие; только контекст национального рейтинга.'),
  'src.desc.unescoai': c('AI competencies for students and teachers. Structures AI-literacy skills.', 'Talabalar va o‘qituvchilar uchun SI kompetensiyalari. SI savodxonligi ko‘nikmalarini tuzadi.', 'Компетенции ИИ для учащихся и учителей. Структурирует навыки ИИ-грамотности.'),
  'src.desc.elementsofai': c('Free self-paced introduction to AI. Linked out, not embedded.', 'SI bo‘yicha bepul mustaqil kirish kursi. Havola orqali, joylashtirilmagan.', 'Бесплатный вводный курс по ИИ. Только ссылка, без встраивания.'),
  'src.desc.zawacki': c('Systematic review of AI applications in higher education.', 'Oliy ta’limda SI qo‘llanilishi bo‘yicha tizimli sharh.', 'Систематический обзор применения ИИ в высшем образовании.'),
  'src.desc.eloundou': c('Task exposure of US occupations to language models. US-only.', 'AQSH kasblarining til modellariga vazifaviy ta’siri. Faqat AQSH.', 'Подверженность задач профессий США языковым моделям. Только США.'),

  // Metrics
  'src.metric.employment-fergana': c('Employment rate, Fergana Region (working-age population)', 'Bandlik darajasi, Farg‘ona viloyati (mehnatga layoqatli aholi)', 'Уровень занятости, Ферганская область (трудоспособное население)'),
  'src.metric.employment-uzbekistan': c('Employment rate, Uzbekistan (working-age population)', 'Bandlik darajasi, O‘zbekiston (mehnatga layoqatli aholi)', 'Уровень занятости, Узбекистан (трудоспособное население)'),
  'src.metric.participation-uzbekistan': c('Labour force participation, Uzbekistan (modelled ILO, 15+)', 'Ishchi kuchi ishtiroki, O‘zbekiston (modellashtirilgan XMT, 15+)', 'Участие в рабочей силе, Узбекистан (модель МОТ, 15+)'),
  'src.metric.notComparable': c(
    'SIAT employment uses the working-age population; World Bank participation is a modelled ILO estimate for ages 15+. They are different indicators and must not be compared.',
    'SIAT bandligi mehnatga layoqatli aholiga asoslanadi; Jahon banki ishtiroki 15+ yosh uchun modellashtirilgan XMT bahosi. Bular turli ko‘rsatkichlar, ularni solishtirib bo‘lmaydi.',
    'Занятость SIAT считается от трудоспособного населения; участие Всемирного банка — модельная оценка МОТ для 15+. Это разные показатели, их нельзя сравнивать.',
  ),
  'src.metric.preliminary': c(
    'SIAT flags 2025 figures as preliminary; they can be revised by the Statistics Committee.',
    'SIAT 2025-yil ko‘rsatkichlarini dastlabki deb belgilaydi; ular Statistika qo‘mitasi tomonidan qayta ko‘rib chiqilishi mumkin.',
    'SIAT помечает данные за 2025 год как предварительные; Комитет по статистике может их пересмотреть.',
  ),
  'src.metric.prelimTag': c('preliminary', 'dastlabki', 'предварительно'),
  'src.metric.none': c('No observations retrieved at the last check.', 'Oxirgi tekshiruvda kuzatuvlar olinmadi.', 'При последней проверке наблюдения не получены.'),

  // Method
  'src.method.title': c('How the signal becomes a forecast', 'Signal qanday qilib prognozga aylanadi', 'Как сигнал становится прогнозом'),
  'src.method.step1': c('Source', 'Manba', 'Источник'),
  'src.method.step1.d': c('Remotive global remote listings, delayed 24 hours.', 'Remotive global masofaviy e’lonlari, 24 soat kechikish bilan.', 'Глобальные удалённые вакансии Remotive с задержкой 24 часа.'),
  'src.method.step2': c('Period', 'Davr', 'Период'),
  'src.method.step2.d': c('Each check is dated; statistics carry their own data period.', 'Har bir tekshiruv sanalangan; statistika o‘z ma’lumot davriga ega.', 'Каждая проверка датирована; статистика имеет свой период данных.'),
  'src.method.step3': c('Signal', 'Signal', 'Сигнал'),
  'src.method.step3.d': c('Skill keyword frequency and trend, computed deterministically.', 'Ko‘nikma kalit so‘zlari chastotasi va tendensiyasi, deterministik hisoblanadi.', 'Частота и тренд ключевых слов навыков, детерминированный расчёт.'),
  'src.method.step4': c('Forecast view', 'Prognoz ko‘rinishi', 'Вид прогноза'),
  'src.method.step4.d': c('Blended with a designer-set horizon weight per skill.', 'Har bir ko‘nikma uchun dizayner belgilagan ufq vazni bilan aralashtiriladi.', 'Смешивается с весом горизонта, заданным разработчиком для каждого навыка.'),
  'src.method.heuristic': c(
    'Horizon weights are a research-inspired, designer-set heuristic. They are not numeric weights measured by WEF and the result is not a validated forecast.',
    'Ufq vaznlari tadqiqotlardan ilhomlangan, dizayner belgilagan evristika. Ular WEF tomonidan o‘lchangan raqamli vaznlar emas va natija tasdiqlangan prognoz emas.',
    'Веса горизонта — эвристика, заданная разработчиком на основе исследований. Это не измеренные WEF числовые веса, и результат не является проверенным прогнозом.',
  ),
  'src.method.context': c(
    'National and regional statistics are shown for context only. They do not change skill matching or momentum.',
    'Milliy va hududiy statistika faqat kontekst uchun ko‘rsatiladi. Ular ko‘nikma moslashuvi yoki dinamikasini o‘zgartirmaydi.',
    'Национальная и региональная статистика показана только для контекста. Она не меняет подбор навыков и динамику.',
  ),
  'src.method.noCityVacancy': c(
    'No live Fergana or Uzbek vacancy feed exists in this app. Remotive measures global remote demand only.',
    'Ushbu ilovada Farg‘ona yoki O‘zbekiston vakansiyalarining jonli oqimi yo‘q. Remotive faqat global masofaviy talabni o‘lchaydi.',
    'В приложении нет живого потока вакансий Ферганы или Узбекистана. Remotive отражает только глобальный удалённый спрос.',
  ),
  'src.provenance.title': c('Evidence and provenance', 'Dalillar va kelib chiqishi', 'Данные и происхождение'),
  'src.provenance.waiting': c('Source status is not available yet. Method and official links are shown below.', 'Manba holati hali mavjud emas. Usul va rasmiy havolalar quyida.', 'Статус источников пока недоступен. Метод и официальные ссылки ниже.'),
  'src.provenance.more': c('Show source details', 'Manba tafsilotlarini ko‘rsatish', 'Показать детали источников'),
  'src.provenance.less': c('Hide source details', 'Manba tafsilotlarini yashirish', 'Скрыть детали источников'),

  // Changelog
  'src.history.title': c('Forecast changelog', 'Prognoz o‘zgarishlar jurnali', 'Журнал изменений прогноза'),
  'src.history.desc': c(
    'Each entry is a calculation: when it ran, which sources fed it, and which skills moved.',
    'Har bir yozuv bitta hisob-kitob: qachon bajarilgani, qaysi manbalar ishlatilgani va qaysi ko‘nikmalar o‘zgargani.',
    'Каждая запись — один расчёт: когда выполнен, какие источники использованы и какие навыки изменились.',
  ),
  'src.history.empty': c('No calculations recorded yet. Run a source check to create the first entry.', 'Hali hisob-kitoblar qayd etilmagan. Birinchi yozuv uchun manbalarni tekshiring.', 'Расчётов пока нет. Запустите проверку источников, чтобы создать первую запись.'),
  'src.history.movers': c('Skills that moved', 'O‘zgargan ko‘nikmalar', 'Изменившиеся навыки'),
  'src.history.noMovers': c('No skill momentum changed.', 'Ko‘nikma dinamikasi o‘zgarmadi.', 'Динамика навыков не изменилась.'),
  'src.history.sources': c('Sources used', 'Ishlatilgan manbalar', 'Использованные источники'),
  'src.history.legacy': c('Source details were not recorded for this older entry.', 'Ushbu eski yozuv uchun manba tafsilotlari saqlanmagan.', 'Для этой старой записи детали источников не сохранены.'),
  'evidence.history.summary': c('{n} global remote postings analysed', '{n} ta global masofaviy e’lon tahlil qilindi', 'Проанализировано глобальных удалённых вакансий: {n}'),

  // Skill counts
  'src.skills.title': c('Skill keyword counts from Remotive', 'Remotive’dagi ko‘nikma kalit so‘zlari soni', 'Счётчики навыков по Remotive'),
  'src.skills.desc': c(
    'Aggregated counts only. Individual jobs are not republished; open Remotive for listings.',
    'Faqat yig‘ma sonlar. Alohida e’lonlar qayta nashr etilmaydi; e’lonlar uchun Remotive’ni oching.',
    'Только агрегированные счётчики. Вакансии не публикуются повторно; списки смотрите на Remotive.',
  ),
  'src.skills.empty': c('No skill counts in demo baseline mode.', 'Demo rejimida ko‘nikma sonlari yo‘q.', 'В демо-режиме счётчиков навыков нет.'),
};

const LOCALE: Record<Lang, string> = { en: 'en-GB', uz: 'uz-Latn-UZ', ru: 'ru-RU' };

export type SourceT = (key: string, vars?: Record<string, string | number>) => string;

export function makeSourceT(lang: Lang): SourceT {
  return (key, vars) => {
    const entry = SOURCE_COPY[key];
    let s = entry ? entry[lang] ?? entry.en : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

export function useSourceT() {
  const lang = useSkillCast((s) => s.lang);
  const fmt = (iso: string | null | undefined, withTime = true) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    try {
      return d.toLocaleString(LOCALE[lang], withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
    } catch {
      return d.toISOString().slice(0, withTime ? 16 : 10).replace('T', ' ');
    }
  };
  return { st: makeSourceT(lang), lang, fmt };
}
