import { latinToCyrillic } from '@/lib/uz-cyrillic';
// ─── Occupation & sector taxonomy (EN / UZ / RU) ───────────────────────────
// Foundation: ILO ISCO-08 (International Standard Classification of
// Occupations), unit-group codes in `isco` where the mapping is direct.
// https://www.ilo.org/public/english/bureau/stat/isco/isco08/
// Extended with occupations that matter locally in Fergana, Uzbekistan and
// Central Asia (silk and ikat weaving, Rishton ceramics, sericulture, cotton
// and garment work, oil refining, …). Sectors group occupations for discovery
// and connect them to SkillCast's role categories, interests and skills.
//
// Maintenance: add an entry with o(id, isco, sector, [en, uz, ru], aliases,
// skills). Aliases are extra search terms in any language (partial words
// match). `skills` uses slugs from data/skills.ts.

export type SectorId =
  | 'it' | 'engineering' | 'business' | 'health' | 'education' | 'agriculture'
  | 'construction' | 'creative' | 'tourism' | 'trades' | 'crafts' | 'transport'
  | 'public' | 'social' | 'media' | 'energy' | 'retail';

export interface Sector {
  id: SectorId;
  name: { en: string; uz: string; ru: string; 'uz-cyrl': string };
  /** SkillCast role categories this sector feeds (data/roles.ts `category`). */
  roleCategories: string[];
  /** Interest ids (lib/store INTERESTS). */
  interests: string[];
  aliases: string;
}

export interface Occupation {
  id: string;
  /** ISCO-08 unit group, when the mapping is direct. */
  isco: string | null;
  sector: SectorId;
  name: { en: string; uz: string; ru: string; 'uz-cyrl': string };
  aliases: string;
  skills: string[];
}

const s = (id: SectorId, en: string, uz: string, ru: string, roleCategories: string[], interests: string[], aliases = ''): Sector =>
  ({ id, name: { en, uz, ru, 'uz-cyrl': latinToCyrillic(uz) }, roleCategories, interests, aliases });

export const SECTORS: Sector[] = [
  s('it', 'Information technology & software', 'Axborot texnologiyalari va dasturlash', 'ИТ и разработка ПО', ['Technology', 'AI'], ['technology', 'ai'], 'software computer digital it dasturiy kompyuter программ компьютер цифров'),
  s('engineering', 'Engineering & manufacturing', 'Muhandislik va ishlab chiqarish', 'Инженерия и производство', ['Operations', 'Technology'], ['technology'], 'factory industry plant zavod fabrika sanoat завод производств промышлен'),
  s('business', 'Business, finance & management', 'Biznes, moliya va boshqaruv', 'Бизнес, финансы и управление', ['Business', 'Marketing', 'People', 'Operations'], ['business', 'people'], 'office bank economics iqtisod ofis банк экономик офис'),
  s('health', 'Healthcare & medicine', 'Sog‘liqni saqlash va tibbiyot', 'Здравоохранение и медицина', ['Health'], ['health', 'people'], 'medical hospital clinic tibbiy shifoxona klinika медицин больниц клиник'),
  s('education', 'Education & research', 'Ta’lim va ilmiy tadqiqot', 'Образование и наука', ['Education'], ['education', 'people'], 'school university teaching science maktab universitet fan школ университет наука'),
  s('agriculture', 'Agriculture & environment', 'Qishloq xo‘jaligi va atrof-muhit', 'Сельское хозяйство и экология', ['AgriTech', 'Sustainability', 'Green Energy'], ['green', 'sustainability'], 'farm agro ecology dehqon fermer ekologiya ферм агро эколог'),
  s('construction', 'Construction & architecture', 'Qurilish va arxitektura', 'Строительство и архитектура', ['Operations', 'Green Energy'], ['technology', 'creative'], 'building construction qurilish bino строй здани'),
  s('creative', 'Art, design & creative industries', 'San’at, dizayn va ijodiy sohalar', 'Искусство, дизайн и креативные индустрии', ['Marketing'], ['creative'], 'art design music film san’at dizayn musiqa искусств дизайн музык'),
  s('tourism', 'Tourism & hospitality', 'Turizm va mehmondo‘stlik', 'Туризм и гостеприимство', ['Service'], ['service', 'people'], 'hotel restaurant travel food mehmonxona restoran sayohat гостиниц ресторан путешеств'),
  s('trades', 'Skilled trades & vocational work', 'Kasb-hunar va amaliy kasblar', 'Рабочие профессии и ремёсла', ['Operations', 'Green Energy'], ['technology'], 'vocational repair workshop usta ta’mir hunar мастер ремонт рабоч'),
  s('crafts', 'Traditional crafts & textiles', 'An’anaviy hunarmandchilik va to‘qimachilik', 'Традиционные ремёсла и текстиль', ['Marketing', 'Operations'], ['creative'], 'handicraft textile silk embroidery hunarmand ipak kashta to‘qimachilik ремесл текстил шёлк вышив'),
  s('transport', 'Transport & logistics', 'Transport va logistika', 'Транспорт и логистика', ['Operations'], ['service'], 'driver delivery warehouse haydovchi ombor yetkazib водител склад доставк'),
  s('public', 'Public service, law & security', 'Davlat xizmati, huquq va xavfsizlik', 'Госслужба, право и безопасность', ['Governance'], ['people', 'sustainability'], 'government law police davlat huquq политик государств право'),
  s('social', 'Social care & community', 'Ijtimoiy xizmat va jamoa', 'Социальная работа и сообщество', ['People', 'Health'], ['people', 'service', 'health'], 'care community volunteer g‘amxo‘rlik jamoa ijtimoiy уход сообществ социальн'),
  s('media', 'Media, communication & languages', 'OAV, kommunikatsiya va tillar', 'Медиа, коммуникации и языки', ['Marketing'], ['creative', 'people'], 'journalism translation content jurnalistika tarjima kontent журналист перевод контент'),
  s('energy', 'Energy & utilities', 'Energetika va kommunal xizmatlar', 'Энергетика и коммунальные услуги', ['Green Energy', 'Operations'], ['green', 'technology'], 'electricity oil gas solar elektr neft gaz quyosh электр нефт газ солн'),
  s('retail', 'Retail, sales & personal services', 'Savdo va maishiy xizmatlar', 'Торговля и бытовые услуги', ['Service', 'Marketing'], ['service', 'business'], 'shop store market sales do‘kon bozor savdo магазин рынок продаж'),
];
export const SECTOR_MAP: Record<SectorId, Sector> = Object.fromEntries(SECTORS.map((x) => [x.id, x])) as Record<SectorId, Sector>;

const o = (id: string, isco: string | null, sector: SectorId, [en, uz, ru]: [string, string, string], aliases: string, skills: string[]): Occupation =>
  ({ id, isco, sector, name: { en, uz, ru, 'uz-cyrl': latinToCyrillic(uz) }, aliases, skills });

export const OCCUPATIONS: Occupation[] = [
  // IT & software
  o('software-developer', '2512', 'it', ['Software developer', 'Dasturchi (dasturiy ta’minot ishlab chiquvchi)', 'Разработчик программного обеспечения'], 'programmer coder software engineer dasturiy dasturlash программист софт', ['software-engineering', 'python', 'cloud']),
  o('web-developer', '2513', 'it', ['Web developer', 'Veb-dasturchi', 'Веб-разработчик'], 'frontend backend website sayt веб сайт', ['software-engineering', 'digital-literacy']),
  o('mobile-developer', '2514', 'it', ['Mobile app developer', 'Mobil ilova dasturchisi', 'Разработчик мобильных приложений'], 'android ios app ilova приложени', ['software-engineering']),
  o('data-analyst-occ', '2511', 'it', ['Data analyst', 'Ma’lumotlar tahlilchisi', 'Аналитик данных'], 'analytics excel bi tahlil аналитик', ['data-analysis', 'python']),
  o('data-scientist', '2120', 'it', ['Data scientist / ML specialist', 'Ma’lumotlar olimi / ML mutaxassisi', 'Специалист по данным / ML'], 'machine learning ai sun’iy intellekt машинное обучение ии', ['machine-learning', 'python', 'data-analysis']),
  o('sysadmin', '2522', 'it', ['Systems administrator', 'Tizim administratori', 'Системный администратор'], 'admin server tizim сервер', ['cloud', 'devops', 'cybersecurity']),
  o('network-engineer', '2523', 'it', ['Network engineer', 'Tarmoq muhandisi', 'Сетевой инженер'], 'network internet tarmoq сеть', ['cloud', 'cybersecurity']),
  o('cybersecurity-specialist', '2529', 'it', ['Cybersecurity specialist', 'Kiberxavfsizlik mutaxassisi', 'Специалист по кибербезопасности'], 'security hacker xavfsizlik безопасност', ['cybersecurity', 'privacy-compliance']),
  o('it-support', '3512', 'it', ['IT support technician', 'IT texnik yordam mutaxassisi', 'Специалист техподдержки'], 'helpdesk support texnik yordam поддержк', ['digital-literacy', 'customer-experience']),
  o('ux-designer', '2166', 'it', ['UX/UI designer', 'UX/UI dizayner', 'UX/UI-дизайнер'], 'interface product design figma interfeys интерфейс', ['graphic-design', 'product-management']),
  o('qa-tester', '2519', 'it', ['Software tester (QA)', 'Dasturiy ta’minot testeri (QA)', 'Тестировщик ПО (QA)'], 'testing quality test тестир', ['software-engineering', 'critical-thinking']),
  // Engineering & manufacturing
  o('mechanical-engineer', '2144', 'engineering', ['Mechanical engineer', 'Mexanika muhandisi', 'Инженер-механик'], 'machine mexanik механик', ['robotics', 'project-management']),
  o('electrical-engineer', '2151', 'engineering', ['Electrical engineer', 'Elektr muhandisi', 'Инженер-электрик'], 'electric power elektr электрик', ['electrical-maintenance', 'renewable-energy']),
  o('electronics-engineer', '2152', 'engineering', ['Electronics engineer', 'Elektronika muhandisi', 'Инженер-электроник'], 'electronics iot elektronika электроник', ['iot', 'robotics']),
  o('chemical-engineer', '2145', 'engineering', ['Chemical engineer', 'Kimyo muhandisi', 'Инженер-химик'], 'chemistry kimyo хими', ['critical-thinking', 'energy-efficiency']),
  o('industrial-engineer', '2141', 'engineering', ['Industrial / production engineer', 'Ishlab chiqarish muhandisi', 'Инженер-технолог производства'], 'production lean factory ishlab chiqarish производств технолог', ['supply-chain', 'ai-augmented-ops']),
  o('quality-inspector', '7543', 'engineering', ['Quality control inspector', 'Sifat nazoratchisi', 'Контролёр качества'], 'quality control sifat nazorat контроль качеств', ['critical-thinking', 'ai-augmented-ops']),
  o('machine-operator', '8189', 'engineering', ['Factory machine operator', 'Zavod dastgoh operatori', 'Оператор станков на производстве'], 'operator dastgoh станок', ['ai-augmented-ops', 'adaptability']),
  o('textile-machine-operator', '8152', 'engineering', ['Textile & knitting machine operator', 'To‘quv va trikotaj dastgohi operatori', 'Оператор ткацких и трикотажных машин'], 'cotton yarn spinning paxta ip yigiruv хлопок пряж', ['textile-production']),
  o('sewing-machine-operator', '8153', 'engineering', ['Garment factory sewing operator', 'Tikuv fabrikasi tikuvchisi', 'Швея-мотористка'], 'garment factory tikuv fabrika швейн', ['textile-production']),
  o('food-processing-operator', '8160', 'engineering', ['Food processing operator', 'Oziq-ovqat ishlab chiqarish operatori', 'Оператор пищевого производства'], 'food canning fruit oziq-ovqat konserva пищев консерв', ['food-processing']),
  o('refinery-operator', '3134', 'energy', ['Oil refinery operator', 'Neftni qayta ishlash zavodi operatori', 'Оператор нефтеперерабатывающего завода'], 'oil refinery fergana neft zavodi нефтепереработ', ['energy-efficiency', 'ai-augmented-ops']),
  // Business, finance & management
  o('accountant', '2411', 'business', ['Accountant', 'Buxgalter', 'Бухгалтер'], 'accounting bookkeeping buxgalteriya бухгалтерия', ['accounting-finance', 'data-analysis']),
  o('bookkeeper', '4311', 'business', ['Bookkeeping clerk', 'Hisobchi', 'Счетовод'], 'bookkeeping hisob учёт', ['accounting-finance']),
  o('financial-analyst', '2413', 'business', ['Financial analyst', 'Moliyaviy tahlilchi', 'Финансовый аналитик'], 'finance investment moliya инвестиц финанс', ['accounting-finance', 'data-analysis']),
  o('bank-officer', '3312', 'business', ['Bank credit officer', 'Bank kredit mutaxassisi', 'Кредитный специалист банка'], 'bank loan kredit кредит', ['accounting-finance', 'customer-experience']),
  o('bank-teller', '4211', 'business', ['Bank teller', 'Bank kassiri', 'Операционист банка'], 'cashier kassir кассир', ['customer-experience', 'digital-literacy']),
  o('business-analyst-occ', '2421', 'business', ['Business / management analyst', 'Biznes tahlilchi', 'Бизнес-аналитик'], 'consultant process biznes jarayon консультант процесс', ['business-analysis', 'data-analysis']),
  o('project-manager', '1219', 'business', ['Project manager', 'Loyiha menejeri', 'Руководитель проектов'], 'pm manager loyiha проект', ['project-management', 'leadership']),
  o('hr-specialist', '2423', 'business', ['HR / recruitment specialist', 'Kadrlar bo‘yicha mutaxassis (HR)', 'HR-специалист / рекрутер'], 'human resources recruiter kadrlar кадр персонал', ['communication', 'leadership']),
  o('marketing-specialist', '2431', 'business', ['Marketing specialist', 'Marketing mutaxassisi', 'Маркетолог'], 'smm advertising reklama маркетинг реклам', ['digital-marketing', 'ai-content-ops']),
  o('sales-manager', '1221', 'business', ['Sales manager', 'Savdo menejeri', 'Менеджер по продажам'], 'sales savdo продаж', ['sales-negotiation', 'customer-experience']),
  o('office-administrator', '3341', 'business', ['Office administrator', 'Ofis ma’muri', 'Офис-менеджер'], 'secretary admin kotib секретар', ['digital-literacy', 'ai-augmented-ops']),
  o('entrepreneur', '1120', 'business', ['Entrepreneur / small business owner', 'Tadbirkor', 'Предприниматель'], 'startup business owner biznes egasi стартап бизнес', ['entrepreneurship', 'sales-negotiation']),
  o('economist', '2631', 'business', ['Economist', 'Iqtisodchi', 'Экономист'], 'economics iqtisodiyot экономик', ['data-analysis', 'critical-thinking']),
  // Health
  o('doctor-gp', '2211', 'health', ['General practitioner (doctor)', 'Umumiy amaliyot shifokori', 'Врач общей практики'], 'doctor physician shifokor doktor врач доктор', ['telehealth', 'health-informatics']),
  o('doctor-specialist', '2212', 'health', ['Specialist doctor', 'Mutaxassis shifokor', 'Врач-специалист'], 'surgeon cardiologist jarroh хирург', ['health-informatics']),
  o('nurse', '2221', 'health', ['Nurse', 'Hamshira', 'Медсестра / медбрат'], 'nursing hamshira медсестр', ['telehealth', 'eldercare']),
  o('midwife', '2222', 'health', ['Midwife', 'Doya', 'Акушерка'], 'birth maternity doya акушер', ['telehealth']),
  o('pharmacist', '2262', 'health', ['Pharmacist', 'Farmatsevt', 'Фармацевт'], 'pharmacy dorixona аптек', ['health-informatics', 'customer-experience']),
  o('dentist', '2261', 'health', ['Dentist', 'Stomatolog', 'Стоматолог'], 'dental tish зуб', ['health-informatics']),
  o('physiotherapist', '2264', 'health', ['Physiotherapist', 'Fizioterapevt', 'Физиотерапевт'], 'rehabilitation massage reabilitatsiya реабилит', ['eldercare']),
  o('speech-therapist', '2266', 'health', ['Speech therapist', 'Logoped', 'Логопед'], 'logoped speech nutq речь', ['teaching-training', 'mental-health']),
  o('psychologist', '2634', 'health', ['Psychologist', 'Psixolog', 'Психолог'], 'therapy counselling psixologiya терап', ['mental-health', 'communication']),
  o('lab-technician', '3212', 'health', ['Medical laboratory technician', 'Tibbiy laborant', 'Медицинский лаборант'], 'laboratory analysis laboratoriya лаборатор', ['health-informatics', 'data-analysis']),
  // Education & research
  o('school-teacher', '2330', 'education', ['School teacher', 'Maktab o‘qituvchisi', 'Школьный учитель'], 'teacher o‘qituvchi muallim учител педагог', ['teaching-training', 'digital-literacy']),
  o('primary-teacher', '2341', 'education', ['Primary school teacher', 'Boshlang‘ich sinf o‘qituvchisi', 'Учитель начальных классов'], 'elementary boshlang‘ich начальн', ['teaching-training']),
  o('preschool-teacher', '2342', 'education', ['Preschool teacher', 'Bog‘cha tarbiyachisi', 'Воспитатель детского сада'], 'kindergarten bog‘cha tarbiyachi детский сад', ['teaching-training', 'communication']),
  o('university-lecturer', '2310', 'education', ['University lecturer', 'Oliy ta’lim o‘qituvchisi', 'Преподаватель вуза'], 'professor docent dotsent профессор доцент', ['teaching-training', 'critical-thinking']),
  o('vocational-teacher', '2320', 'education', ['Vocational / college teacher', 'Kasb-hunar o‘qituvchisi', 'Преподаватель колледжа (профтехобразования)'], 'technical college texnikum kollej колледж техникум', ['teaching-training']),
  o('language-teacher', '2353', 'education', ['Language teacher (English, Russian…)', 'Til o‘qituvchisi (ingliz, rus…)', 'Преподаватель языков'], 'english ielts tutor ingliz tili английский репетитор', ['english-for-work', 'teaching-training']),
  o('special-needs-teacher', '2352', 'education', ['Special needs teacher', 'Inklyuziv ta’lim o‘qituvchisi', 'Учитель-дефектолог'], 'inclusive defectologist inklyuziv дефектолог', ['teaching-training', 'mental-health']),
  o('it-trainer', '2356', 'education', ['IT / digital skills trainer', 'IT va raqamli ko‘nikmalar treneri', 'Тренер по ИТ и цифровым навыкам'], 'computer courses kompyuter kurslari компьютерные курсы', ['teaching-training', 'digital-literacy']),
  o('researcher', '2131', 'education', ['Researcher / scientist', 'Ilmiy xodim', 'Научный сотрудник'], 'science research ilmiy tadqiqot наук исследован', ['critical-thinking', 'data-analysis']),
  o('librarian', '2622', 'education', ['Librarian', 'Kutubxonachi', 'Библиотекарь'], 'library kutubxona библиотек', ['digital-literacy']),
  // Agriculture & environment
  o('crop-farmer', '6111', 'agriculture', ['Crop & vegetable farmer', 'Dehqon (ekin va sabzavotchilik)', 'Фермер-растениевод'], 'cotton wheat vegetables paxta bug‘doy sabzavot хлопок пшениц овощ', ['smart-agriculture']),
  o('orchard-grower', '6112', 'agriculture', ['Fruit & orchard grower', 'Bog‘bon (mevachilik)', 'Садовод'], 'fruit garden apricot meva bog‘ o‘rik фрукт сад', ['smart-agriculture']),
  o('greenhouse-grower', '6113', 'agriculture', ['Greenhouse & nursery grower', 'Issiqxona yetishtiruvchisi', 'Тепличник'], 'greenhouse issiqxona теплиц', ['smart-agriculture', 'energy-efficiency']),
  o('livestock-farmer', '6121', 'agriculture', ['Livestock & dairy farmer', 'Chorvador', 'Животновод'], 'cattle sheep dairy chorva sut скот молоч', ['smart-agriculture']),
  o('sericulturist', '6123', 'agriculture', ['Silkworm breeder (sericulture)', 'Pillakor (ipak qurti boquvchi)', 'Шелковод'], 'silkworm cocoon ipak qurti pilla шелкопряд кокон', ['smart-agriculture', 'textile-production']),
  o('beekeeper', '6123', 'agriculture', ['Beekeeper', 'Asalarichi', 'Пчеловод'], 'bees honey asal мёд пчёл', ['smart-agriculture', 'entrepreneurship']),
  o('agronomist', '2132', 'agriculture', ['Agronomist', 'Agronom', 'Агроном'], 'agronomy soil tuproq почв', ['smart-agriculture', 'climate-data']),
  o('agri-technician', '3142', 'agriculture', ['Agricultural technician', 'Qishloq xo‘jaligi texnigi', 'Агротехник'], 'irrigation drip sug‘orish полив орошен', ['smart-agriculture', 'iot']),
  o('tractor-operator', '8341', 'agriculture', ['Tractor & farm machinery operator', 'Traktorchi (qishloq xo‘jaligi texnikasi)', 'Тракторист'], 'tractor combine traktor kombayn трактор комбайн', ['smart-agriculture']),
  o('environmental-specialist', '2133', 'agriculture', ['Environmental specialist', 'Ekolog', 'Эколог'], 'ecology environment ekologiya эколог', ['climate-data', 'energy-efficiency']),
  // Construction & architecture
  o('architect', '2161', 'construction', ['Architect', 'Arxitektor (me’mor)', 'Архитектор'], 'architecture me’mor архитектур', ['graphic-design', 'project-management']),
  o('civil-engineer', '2142', 'construction', ['Civil engineer', 'Qurilish muhandisi', 'Инженер-строитель'], 'construction engineer qurilish строител', ['project-management', 'energy-efficiency']),
  o('surveyor', '2165', 'construction', ['Surveyor / cartographer', 'Geodezist', 'Геодезист'], 'survey gis xarita геодез', ['data-analysis']),
  o('construction-supervisor', '3123', 'construction', ['Construction site supervisor', 'Qurilish ustasi (prorab)', 'Прораб'], 'foreman prorab прораб', ['project-management', 'leadership']),
  o('bricklayer', '7112', 'construction', ['Bricklayer / mason', 'G‘isht teruvchi', 'Каменщик'], 'brick mason g‘isht кирпич', ['adaptability']),
  o('carpenter', '7115', 'construction', ['Carpenter / joiner', 'Duradgor', 'Плотник / столяр'], 'wood duradgor дерев плотник', ['adaptability']),
  o('plumber', '7126', 'construction', ['Plumber', 'Santexnik', 'Сантехник'], 'pipes santexnika труб', ['adaptability']),
  o('interior-designer', '3432', 'construction', ['Interior designer', 'Interyer dizayneri', 'Дизайнер интерьеров'], 'interior design decor interyer интерьер', ['graphic-design', 'creative-framing']),
  // Art, design & creative
  o('graphic-designer', '2166', 'creative', ['Graphic designer', 'Grafik dizayner', 'Графический дизайнер'], 'design logo photoshop dizayn логотип дизайн', ['graphic-design', 'ai-content-ops']),
  o('fashion-designer', '2163', 'creative', ['Fashion designer', 'Moda dizayneri', 'Дизайнер одежды'], 'fashion clothes kiyim мода одежд', ['graphic-design', 'textile-production']),
  o('visual-artist', '2651', 'creative', ['Painter / visual artist', 'Rassom', 'Художник'], 'painting art miniature rassomlik miniatyura живопис миниатюр', ['creative-framing', 'graphic-design']),
  o('musician', '2652', 'creative', ['Musician / singer', 'Musiqachi / xonanda', 'Музыкант / певец'], 'music song musiqa qo‘shiq музык песн', ['creative-framing']),
  o('photographer', '3431', 'creative', ['Photographer', 'Fotograf', 'Фотограф'], 'photo camera foto фото', ['creative-framing', 'digital-marketing']),
  o('video-editor', '3521', 'creative', ['Video maker / editor', 'Videograf / montajchi', 'Видеограф / монтажёр'], 'video montage youtube video montaj монтаж видео', ['ai-content-ops', 'digital-marketing']),
  o('animator', '2166', 'creative', ['Animator / 3D artist', 'Animator / 3D rassom', 'Аниматор / 3D-художник'], 'animation 3d multfilm анимац', ['graphic-design']),
  o('actor-performer', '2655', 'creative', ['Actor / performer', 'Aktyor', 'Актёр'], 'theatre teatr театр', ['communication', 'creative-framing']),
  // Tourism & hospitality
  o('hotel-manager', '1411', 'tourism', ['Hotel manager', 'Mehmonxona menejeri', 'Управляющий гостиницей'], 'hotel guesthouse mehmonxona гостиниц', ['tourism-hospitality', 'leadership']),
  o('receptionist', '4224', 'tourism', ['Hotel receptionist', 'Mehmonxona administratori', 'Администратор гостиницы'], 'front desk reception ресепшен', ['tourism-hospitality', 'english-for-work']),
  o('tour-guide', '5113', 'tourism', ['Tour guide', 'Gid (ekskursovod)', 'Гид-экскурсовод'], 'guide excursion ekskursiya экскурс', ['tourism-hospitality', 'english-for-work']),
  o('travel-agent', '4221', 'tourism', ['Travel consultant', 'Sayohat agenti', 'Турагент'], 'travel agency turagent тур', ['tourism-hospitality', 'sales-negotiation']),
  o('chef', '3434', 'tourism', ['Chef', 'Oshpaz (bosh oshpaz)', 'Шеф-повар'], 'kitchen plov oshxona osh кухн плов', ['tourism-hospitality', 'food-processing']),
  o('cook', '5120', 'tourism', ['Cook', 'Oshpaz', 'Повар'], 'cooking ovqat пищ готов', ['food-processing']),
  o('waiter', '5131', 'tourism', ['Waiter / waitress', 'Ofitsiant', 'Официант'], 'restaurant cafe kafe кафе', ['customer-experience']),
  o('baker', '7512', 'tourism', ['Baker / pastry cook', 'Novvoy / qandolatchi', 'Пекарь / кондитер'], 'bread non tandir pastry хлеб кондитер', ['food-processing', 'entrepreneurship']),
  // Skilled trades
  o('electrician', '7411', 'trades', ['Electrician', 'Elektrik (elektromontyor)', 'Электрик (электромонтёр)'], 'wiring elektr montaj проводк', ['electrical-maintenance']),
  o('solar-installer', '7411', 'trades', ['Solar panel installer', 'Quyosh panellari o‘rnatuvchisi', 'Монтажник солнечных панелей'], 'solar pv quyosh солнечн', ['renewable-energy', 'electrical-maintenance']),
  o('welder', '7212', 'trades', ['Welder', 'Payvandchi', 'Сварщик'], 'welding payvand сварк', ['adaptability']),
  o('auto-mechanic', '7231', 'trades', ['Car mechanic', 'Avtomexanik (avtousta)', 'Автомеханик'], 'car repair mashina ta’mir авто ремонт', ['ev-mobility']),
  o('hvac-technician', '7127', 'trades', ['Air-conditioning & refrigeration technician', 'Konditsioner va sovutgich ustasi', 'Мастер по кондиционерам и холодильникам'], 'air conditioner fridge konditsioner кондиционер холодильн', ['energy-efficiency', 'electrical-maintenance']),
  o('phone-repair', '7422', 'trades', ['Phone & computer repair technician', 'Telefon va kompyuter ustasi', 'Мастер по ремонту телефонов и ПК'], 'repair smartphone telefon ta’mir ремонт телефон', ['digital-literacy', 'electrical-maintenance']),
  o('furniture-maker', '7522', 'trades', ['Furniture maker', 'Mebel ustasi', 'Мебельщик'], 'furniture mebel мебел', ['entrepreneurship']),
  o('hairdresser', '5141', 'trades', ['Hairdresser / barber', 'Sartarosh', 'Парикмахер'], 'barber hair soch парикмахер', ['customer-experience', 'entrepreneurship']),
  o('beautician', '5142', 'trades', ['Beautician', 'Kosmetolog / vizajist', 'Косметолог / визажист'], 'makeup nails pardoz макияж маникюр', ['customer-experience', 'entrepreneurship']),
  // Traditional crafts & textiles
  o('tailor', '7531', 'crafts', ['Tailor / dressmaker', 'Tikuvchi (chevar)', 'Портной / швея'], 'sewing tikish chevar шить шве', ['textile-production', 'entrepreneurship']),
  o('embroiderer', '7533', 'crafts', ['Embroiderer (suzani, gold embroidery)', 'Kashtachi (so‘zana, zardo‘zlik)', 'Вышивальщица (сюзане, золотое шитьё)'], 'embroidery suzani zardozi kashta so‘zana вышивк сюзане', ['textile-production', 'creative-framing']),
  o('knitter', '7318', 'crafts', ['Knitter', 'To‘quvchi (trikotaj, qo‘lda to‘qish)', 'Вязальщица'], 'knitting crochet to‘qish вязан', ['textile-production', 'entrepreneurship']),
  o('silk-weaver', '7318', 'crafts', ['Silk & ikat (atlas, adras) weaver', 'Ipak to‘quvchi (atlas, adras)', 'Ткач шёлка (атлас, адрас)'], 'ikat atlas adras margilan marg‘ilon ipak шёлк икат', ['textile-production', 'creative-framing']),
  o('carpet-weaver', '7318', 'crafts', ['Carpet weaver', 'Gilam to‘quvchi', 'Ковровщица'], 'carpet rug gilam ковёр', ['textile-production']),
  o('potter', '7314', 'crafts', ['Potter / ceramicist (Rishton)', 'Kulol (Rishton kulolchiligi)', 'Гончар / керамист (Риштан)'], 'ceramics pottery rishton kulolchilik керамик гончар риштан', ['creative-framing', 'entrepreneurship']),
  o('wood-carver', '7317', 'crafts', ['Wood carver', 'Yog‘och o‘ymakori', 'Резчик по дереву'], 'carving o‘ymakorlik резьб', ['creative-framing']),
  o('jeweller', '7313', 'crafts', ['Jeweller', 'Zargar', 'Ювелир'], 'jewelry gold zargarlik ювелир', ['creative-framing', 'entrepreneurship']),
  o('leather-craftsman', '7536', 'crafts', ['Leather craftsman / shoemaker', 'Charm ustasi / etikdo‘z', 'Мастер по коже / обувщик'], 'leather shoes charm poyabzal кож обув', ['entrepreneurship']),
  o('miniature-painter', '7316', 'crafts', ['Decorative painter / miniaturist', 'Naqqosh / miniatyurachi', 'Мастер росписи / миниатюрист'], 'ganch naqsh painting naqqoshlik роспис ганч', ['creative-framing', 'graphic-design']),
  // Transport & logistics
  o('driver', '8322', 'transport', ['Driver (taxi, car, van)', 'Haydovchi (taksi, yengil avtomobil)', 'Водитель (такси, легковой)'], 'taxi yandex haydovchi такси', ['customer-experience', 'ev-mobility']),
  o('truck-driver', '8332', 'transport', ['Truck driver', 'Yuk mashinasi haydovchisi', 'Водитель грузовика'], 'lorry freight yuk фур груз', ['supply-chain']),
  o('logistics-coordinator', '3331', 'transport', ['Logistics coordinator', 'Logistika koordinatori', 'Координатор по логистике'], 'logistics shipping export logistika экспорт логист', ['supply-chain', 'data-analysis']),
  o('warehouse-worker', '4321', 'transport', ['Warehouse & stock clerk', 'Omborchi', 'Кладовщик'], 'warehouse stock ombor склад', ['supply-chain', 'digital-literacy']),
  o('courier', '9621', 'transport', ['Courier / delivery worker', 'Kuryer', 'Курьер'], 'delivery yetkazib berish доставк', ['customer-experience']),
  // Public service, law & security
  o('lawyer', '2611', 'public', ['Lawyer', 'Yurist (huquqshunos)', 'Юрист'], 'law advokat юрист адвокат', ['privacy-compliance', 'critical-thinking']),
  o('civil-servant', '2422', 'public', ['Civil servant / policy specialist', 'Davlat xizmatchisi', 'Госслужащий'], 'government hokimiyat государствен', ['privacy-compliance', 'communication']),
  o('police-officer', '5412', 'public', ['Police officer', 'Politsiya xodimi', 'Полицейский'], 'police ichki ishlar полиц', ['communication']),
  o('security-guard', '5414', 'public', ['Security guard', 'Qo‘riqchi', 'Охранник'], 'guard qo‘riqlash охран', ['adaptability']),
  // Social care
  o('social-worker', '2635', 'social', ['Social worker', 'Ijtimoiy xodim', 'Социальный работник'], 'social care ijtimoiy ish социальн', ['mental-health', 'communication']),
  o('caregiver', '5322', 'social', ['Home care worker', 'Uyda parvarish qiluvchi', 'Сиделка / работник по уходу'], 'elderly care keksalar parvarish уход пожил', ['eldercare']),
  o('childcare-worker', '5311', 'social', ['Childcare worker / nanny', 'Enaga', 'Няня'], 'nanny babysitter enaga няня', ['teaching-training']),
  // Media & languages
  o('journalist', '2642', 'media', ['Journalist', 'Jurnalist', 'Журналист'], 'news reporter muxbir репортёр', ['ai-content-ops', 'communication']),
  o('translator', '2643', 'media', ['Translator / interpreter', 'Tarjimon', 'Переводчик'], 'translation tarjima перевод', ['english-for-work', 'communication']),
  o('copywriter', '2641', 'media', ['Copywriter / content writer', 'Kopirayter', 'Копирайтер'], 'writing content blog matn копирайт текст', ['ai-content-ops', 'digital-marketing']),
  o('smm-specialist', '2432', 'media', ['Social media manager (SMM)', 'SMM mutaxassisi', 'SMM-специалист'], 'smm instagram telegram ijtimoiy tarmoq соцсет', ['digital-marketing', 'ai-content-ops']),
  // Energy & utilities
  o('energy-engineer', '2151', 'energy', ['Energy / power engineer', 'Energetik', 'Энергетик'], 'power plant energetika энергет', ['renewable-energy', 'energy-efficiency']),
  o('utility-technician', '7413', 'energy', ['Electrical line & utility technician', 'Elektr tarmoqlari montyori', 'Электромонтёр линий'], 'power lines elektr tarmoq ЛЭП', ['electrical-maintenance']),
  // Retail & services
  o('shop-assistant', '5223', 'retail', ['Shop assistant', 'Sotuvchi', 'Продавец'], 'seller store sotuvchi продав', ['customer-experience', 'sales-negotiation']),
  o('cashier', '5230', 'retail', ['Cashier', 'Kassir', 'Кассир'], 'checkout kassa касс', ['customer-experience', 'digital-literacy']),
  o('market-trader', '5211', 'retail', ['Market trader', 'Bozor savdogari', 'Торговец на рынке'], 'bazaar bozor базар', ['sales-negotiation', 'entrepreneurship']),
  o('ecommerce-seller', '5244', 'retail', ['Online seller (e-commerce)', 'Onlayn sotuvchi (e-commerce)', 'Онлайн-продавец'], 'uzum ozon marketplace onlayn do‘kon маркетплейс', ['digital-marketing', 'entrepreneurship']),
  o('call-center', '4222', 'retail', ['Call-centre operator', 'Call-markaz operatori', 'Оператор колл-центра'], 'contact centre operator оператор', ['customer-experience', 'communication']),
];

export const OCCUPATION_MAP: Record<string, Occupation> = Object.fromEntries(OCCUPATIONS.map((x) => [x.id, x]));

/** Sentinel for "my profession is not listed" (free text is kept separately). */
export const OTHER_OCCUPATION = 'other';

type Lang = 'en' | 'uz' | 'ru' | 'uz-cyrl';

/** Lower-cases and folds apostrophe variants so "o'qituvchi" finds "o‘qituvchi". */
export function fold(text: string): string {
  return text.toLowerCase().replace(/[‘’ʻʼ`´']/g, "'").replace(/ё/g, 'е').trim();
}

export interface SearchHit<T> { item: T; score: number }

function scoreText(query: string, haystacks: string[]): number {
  const q = fold(query);
  if (!q) return 1;
  let best = 0;
  for (const h of haystacks) {
    const text = fold(h);
    if (!text) continue;
    if (text === q) best = Math.max(best, 100);
    else if (text.startsWith(q)) best = Math.max(best, 80);
    else if (text.split(/[\s/(),.-]+/).some((w) => w.startsWith(q))) best = Math.max(best, 60);
    else if (text.includes(q)) best = Math.max(best, 40);
  }
  return best;
}

/**
 * Searches occupations by name (current language first, then all languages),
 * ISCO code, aliases and sector names. Partial words match ("soft", "emb").
 */
export function searchOccupations(query: string, lang: Lang, sector?: SectorId | null, limit = 50): SearchHit<Occupation>[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const pool = sector ? OCCUPATIONS.filter((x) => x.sector === sector) : OCCUPATIONS;
  if (words.length === 0) {
    return pool.map((item) => ({ item, score: 1 }))
      .sort((a, b) => a.item.name[lang].localeCompare(b.item.name[lang], lang)).slice(0, limit);
  }
  // Direct matches: every word matches the occupation's own names, aliases or ISCO code.
  const direct = pool.map((item) => {
    let total = 0;
    for (const w of words) {
      const sc = Math.max(scoreText(w, [item.name[lang]]) * 1.2,
        scoreText(w, [item.name.en, item.name.uz, item.name.ru, item.name['uz-cyrl'], item.isco ?? '', item.aliases]));
      if (sc === 0) return { item, score: 0 };
      total += sc;
    }
    return { item, score: total };
  }).filter((h) => h.score > 0);
  direct.sort((a, b) => b.score - a.score || a.item.name[lang].localeCompare(b.item.name[lang], lang));
  // Few direct hits ("emb", "kash"): add related occupations from the same or a matching sector.
  if (direct.length <= 2) {
    const sectors = new Set<SectorId>([
      ...direct.map((h) => h.item.sector),
      ...SECTORS.filter((sec) => words.every((w) => scoreText(w, [sec.name[lang], sec.name.en, sec.name.uz, sec.name.ru, sec.aliases]) > 0)).map((sec) => sec.id),
    ]);
    const seen = new Set(direct.map((h) => h.item.id));
    const related = pool.filter((x) => sectors.has(x.sector) && !seen.has(x.id))
      .map((item) => ({ item, score: 10 }))
      .sort((a, b) => a.item.name[lang].localeCompare(b.item.name[lang], lang));
    return [...direct, ...related].slice(0, limit);
  }
  return direct.slice(0, limit);
}

export function searchSectors(query: string, lang: Lang): SearchHit<Sector>[] {
  return SECTORS.map((item) => ({ item, score: scoreText(query, [item.name[lang], item.name.en, item.name.uz, item.name.ru, item.aliases]) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** English keywords for an occupation/sector, used by role matching. */
export function occupationKeywords(id: string | undefined): string {
  const occ = id ? OCCUPATION_MAP[id] : undefined;
  if (!occ) return '';
  const sec = SECTOR_MAP[occ.sector];
  return [occ.name.en, occ.aliases, sec.name.en, sec.roleCategories.join(' ')].join(' ');
}
