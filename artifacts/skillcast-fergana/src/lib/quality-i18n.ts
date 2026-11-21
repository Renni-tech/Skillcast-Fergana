// ─── Product-quality pass copy (EN / UZ / RU) ──────────────────────────────
// Wind Rose interpretation, motivating badges, demand and SDG hierarchy,
// empty-state guidance and learning-source labels. Applied by i18n.ts after
// the experience copy. Written natively for each language (idioms are
// equivalents, not word-for-word translations). Every entry must have all
// three languages (enforced by tests/i18n-parity.test.ts).

type Copy = { en: string; uz: string; ru: string };
const c = (en: string, uz: string, ru: string): Copy => ({ en, uz, ru });

export const QUALITY_COPY: Record<string, Copy> = {
  // Weekly study availability (1–168 h)
  'onb.budget.q': c('How many hours per week can you dedicate to learning?', 'Haftasiga o‘qishga necha soat ajrata olasiz?', 'Сколько часов в неделю вы можете уделять учёбе?'),
  'onb.budget.hint': c(
    'Count your free time for learning across the whole week (up to 168 hours, the full week). Your plan’s timeline is based on it.',
    'O‘qish uchun butun hafta davomidagi bo‘sh vaqtingizni hisoblang (168 soatgacha, ya’ni to‘liq hafta). Rejangiz muddati shunga qarab tuziladi.',
    'Посчитайте свободное для учёбы время за всю неделю (до 168 часов, то есть вся неделя). По нему строятся сроки плана.',
  ),
  'onb.budget.presets': c('Quick choices', 'Tezkor tanlov', 'Быстрый выбор'),
  'onb.budget.high': c(
    '{n} hours a week is more than full-time study. We keep your selection, but pace your plan at {cap} hours a week so it stays realistic and leaves time for rest.',
    'Haftasiga {n} soat to‘liq kunlik o‘qishdan ko‘p. Tanlovingiz saqlanadi, lekin reja real va dam olishga vaqt qolishi uchun haftasiga {cap} soat hisobida tuziladi.',
    '{n} часов в неделю — больше, чем очная учёба. Мы сохраним ваш выбор, но построим план из расчёта {cap} часов в неделю, чтобы он был реалистичным и оставлял время на отдых.',
  ),

  // Skill progression after a completed course
  'prog.title': c('Nice work! Update your skill levels?', 'Barakalla! Ko‘nikma darajalaringizni yangilaymizmi?', 'Отлично! Обновить уровни навыков?'),
  'prog.lede': c(
    'You finished “{course}”. A completed course can raise each skill it teaches by one level, up to {cap}/5 for a {level} course. Untick anything you don’t feel ready for.',
    '“{course}” kursini tugatdingiz. Tugallangan kurs o‘zi o‘rgatadigan har bir ko‘nikmani bir darajaga, {level} kurs uchun ko‘pi bilan {cap}/5 gacha oshirishi mumkin. Tayyor emasman deb hisoblaganingizni belgidan chiqaring.',
    'Вы завершили «{course}». Пройденный курс может повысить каждый навык, которому он учит, на один уровень — до {cap}/5 для курса уровня «{level}». Снимите отметку, если не чувствуете уверенности.',
  ),
  'prog.level.beginner': c('beginner', 'boshlang‘ich', 'начальный'),
  'prog.level.intermediate': c('intermediate', 'o‘rta', 'средний'),
  'prog.level.advanced': c('advanced', 'yuqori', 'продвинутый'),
  'prog.to': c('to', 'gacha', 'до'),
  'prog.honest': c(
    'Levels are your own estimate. Un-marking the course later undoes these changes.',
    'Darajalar sizning shaxsiy bahoingiz. Keyinroq kurs belgisini olib tashlasangiz, bu o‘zgarishlar bekor qilinadi.',
    'Уровни — ваша собственная оценка. Если позже снять отметку с курса, эти изменения отменятся.',
  ),
  'prog.confirm': c('Update my levels', 'Darajalarni yangilash', 'Обновить уровни'),
  'prog.notNow': c('Not now', 'Hozir emas', 'Не сейчас'),
  'prog.done.title': c('Your profile is updated. The Wind Rose, matches and next steps now use your new levels.', 'Profilingiz yangilandi. Shamol guli, mosliklar va keyingi qadamlar endi yangi darajalaringiz asosida.', 'Профиль обновлён. Роза ветров, подбор и следующие шаги теперь учитывают новые уровни.'),
  'prog.done.fit': c('Fit for {role}: {before} → {after}', '{role} uchun moslik: {before} → {after}', 'Соответствие роли «{role}»: {before} → {after}'),

  // Reset and returning users
  'reset.title': c('Reset all your SkillCast data?', 'SkillCast’dagi barcha ma’lumotlaringiz o‘chirilsinmi?', 'Сбросить все ваши данные SkillCast?'),
  'reset.body': c(
    'This deletes your profile, skills, chosen pathway, completed courses, badges and roadmap progress from this browser. It cannot be undone.',
    'Bu profilingiz, ko‘nikmalaringiz, tanlangan yo‘nalish, tugallangan kurslar, nishonlar va yo‘l xaritasi jarayonini ushbu brauzerdan o‘chiradi. Buni qaytarib bo‘lmaydi.',
    'Будут удалены профиль, навыки, выбранная траектория, пройденные курсы, значки и прогресс дорожной карты в этом браузере. Отменить нельзя.',
  ),
  'reset.confirm': c('Yes, reset', 'Ha, o‘chirish', 'Да, сбросить'),
  'reset.cancel': c('Keep my data', 'Ma’lumotlarni saqlash', 'Оставить данные'),
  'save.local': c('Saved automatically in this browser on this device. Nothing is uploaded; there is no cloud sync.', 'Ushbu qurilmadagi brauzerda avtomatik saqlanadi. Hech narsa yuklanmaydi, bulutli sinxronlash yo‘q.', 'Сохраняется автоматически в этом браузере на этом устройстве. Ничего не загружается, облачной синхронизации нет.'),
  'welcome.back': c('Welcome back! Your plan is saved.', 'Xush kelibsiz! Rejangiz saqlangan.', 'С возвращением! Ваш план сохранён.'),
  'welcome.continue': c('Continue where you left off', 'Qolgan joyingizdan davom eting', 'Продолжить с того места, где остановились'),

  // Empty states that name the real tab, with a button to it
  'empty.choosePath': c(
    'Choose a pathway in “{tab}” first. This view then fills in for that pathway.',
    'Avval “{tab}” bo‘limida yo‘nalish tanlang. Shundan so‘ng bu bo‘lim o‘sha yo‘nalish bo‘yicha to‘ladi.',
    'Сначала выберите траекторию в разделе «{tab}». После этого здесь появятся данные по ней.',
  ),
  'empty.choosePath.title': c('Pick a pathway to begin', 'Boshlash uchun yo‘nalish tanlang', 'Выберите траекторию, чтобы начать'),
  // Overrides older copy that named a tab ("Matches") which no longer exists
  'sdg.notchosen': c(
    'Choose a pathway in “Learning & career pathways” to see this view.',
    'Bu bo‘limni ko‘rish uchun “O‘quv va kasbiy yo‘nalishlar” bo‘limida yo‘nalish tanlang.',
    'Выберите траекторию в разделе «Учебные и карьерные траектории», чтобы увидеть этот раздел.',
  ),
  'empty.go': c('Go to {tab}', '“{tab}” bo‘limiga o‘tish', 'Перейти в «{tab}»'),

  // Overview hierarchy
  'ov.nextStep': c('Your next step', 'Keyingi qadamingiz', 'Ваш следующий шаг'),
  'ov.details': c('Data sources and update history', 'Ma’lumot manbalari va yangilanishlar tarixi', 'Источники данных и история обновлений'),
  'ov.details.hint': c(
    'Where the numbers come from, when they were checked, and what changed.',
    'Raqamlar qayerdan olingani, qachon tekshirilgani va nima o‘zgargani.',
    'Откуда цифры, когда их проверяли и что изменилось.',
  ),

  // Wind Rose: how to read it, and what it means
  'wr.read.title': c('How to read it', 'Qanday o‘qiladi', 'Как читать'),
  'wr.read.1': c('Blue area: where you are now.', 'Ko‘k maydon: hozir qayerdasiz.', 'Синяя область: где вы сейчас.'),
  'wr.read.2': c('Violet line: where demand is heading.', 'Binafsha chiziq: talab qayerga yo‘nalmoqda.', 'Фиолетовая линия: куда движется спрос.'),
  'wr.read.3': c('The space between them: what to learn next.', 'Ular orasidagi bo‘shliq: keyingi o‘rganadiganingiz.', 'Пространство между ними: что изучать дальше.'),
  'wr.q.directions': c('Promising directions', 'Istiqbolli yo‘nalishlar', 'Перспективные направления'),
  'wr.q.directions.d': c(
    'Skills on this map with the strongest market direction.',
    'Ushbu xaritada bozor yo‘nalishi eng kuchli ko‘nikmalar.',
    'Навыки на этой карте с самым сильным рыночным направлением.',
  ),
  'wr.q.meaning': c('What this means for you', 'Bu siz uchun nimani anglatadi', 'Что это значит для вас'),
  'wr.meaning.aligned': c(
    'You are at or ahead of the market on {n} of {total} skills shown.',
    'Ko‘rsatilgan {total} ta ko‘nikmadan {n} tasida bozor darajasidasiz yoki undan oldindasiz.',
    'По {n} из {total} показанных навыков вы на уровне рынка или впереди.',
  ),
  'wr.meaning.focus': c(
    'Biggest opportunity: {skill}, with {n} points to grow.',
    'Eng katta imkoniyat: {skill} — {n} ball o‘sish imkoni bor.',
    'Главная возможность: {skill}, рост на {n} баллов.',
  ),
  'wr.q.why': c('Why am I seeing this?', 'Nega aynan shu ko‘rsatilmoqda?', 'Почему я это вижу?'),
  'wr.why.body': c(
    'Each spoke is a skill: your pathway’s skills first, then skills you rated, then the market’s strongest. Market direction uses SkillCast’s periodic signals where they exist, otherwise a labelled baseline. “Improve next” lists the largest gaps, pathway skills first. The same inputs always give the same result.',
    'Har bir o‘q — bitta ko‘nikma: avval yo‘nalishingiz ko‘nikmalari, so‘ng siz baholaganlar, keyin bozordagi eng kuchlilari. Bozor yo‘nalishi mavjud bo‘lsa SkillCast davriy signallaridan, aks holda belgilangan bazaviy qiymatdan olinadi. “Keyingi navbatda yaxshilang” eng katta bo‘shliqlarni ko‘rsatadi, avval yo‘nalish ko‘nikmalari. Bir xil ma’lumot har doim bir xil natija beradi.',
    'Каждая ось — навык: сначала навыки вашей траектории, затем оценённые вами, затем самые сильные на рынке. Направление рынка берётся из периодических сигналов SkillCast, а где их нет — из помеченной базовой оценки. «Улучшить в первую очередь» — самые большие разрывы, сначала навыки траектории. Одинаковые данные всегда дают одинаковый результат.',
  ),
  'wr.select.hint': c('Tap a skill for details.', 'Tafsilot uchun ko‘nikmani bosing.', 'Нажмите на навык, чтобы увидеть детали.'),
  'wr.detail.title': c('Skill details', 'Ko‘nikma tafsiloti', 'Детали навыка'),
  'wr.detail.strong': c('Strong market direction', 'Bozor yo‘nalishi kuchli', 'Сильное рыночное направление'),
  'wr.detail.steady': c('Steady market direction', 'Bozor yo‘nalishi barqaror', 'Устойчивое рыночное направление'),
  'wr.detail.softer': c('Softer market direction', 'Bozor yo‘nalishi sustroq', 'Более слабое рыночное направление'),
  'wr.detail.gap': c(
    'Worth learning next: it closes a {n}-point gap.',
    'Keyingi o‘rganishga arziydi: {n} ballik bo‘shliqni yopadi.',
    'Стоит изучить следующим: закроет разрыв в {n} баллов.',
  ),
  'wr.detail.strength': c('One of your strengths. Keep it current with practice.', 'Kuchli tomoningiz. Amaliyot bilan uni yangilab boring.', 'Ваша сильная сторона. Поддерживайте её практикой.'),
  'wr.detail.close': c('Close to the market. A short refresher is enough.', 'Bozorga yaqin. Qisqa takrorlash yetarli.', 'Близко к рынку. Достаточно короткого повторения.'),
  'wr.detail.dismiss': c('Close details', 'Tafsilotni yopish', 'Закрыть детали'),

  // Badges (Nishonlar): encouraging, not childish
  'nb.title': c('Your badges', 'Nishonlaringiz', 'Ваши значки'),
  'nb.msg.zero': c(
    'Your first badge is just one course away. Finished a course? Mark it as done.',
    'Birinchi nishoningiz bir kurs narida. Kursni tugatdingizmi? Uni bajarildi deb belgilang.',
    'Первый значок — всего в одном курсе. Завершили курс? Отметьте его.',
  ),
  'nb.msg.some': c('Great pace! Next up: {name}.', 'Zo‘r ketyapsiz! Navbatdagisi: {name}.', 'Отличный темп! Следующий: {name}.'),
  'nb.msg.all': c('You did it: every badge is yours!', 'Barakalla! Barcha nishonlar sizniki.', 'Браво! Все значки ваши.'),
  'nb.msg.noCourses': c(
    'This pathway has no linked course yet, so badges stay locked for now. Start with the practice tasks in your Harada roadmap.',
    'Bu yo‘nalishga hali kurs biriktirilmagan, shuning uchun nishonlar hozircha yopiq. Harada yo‘l xaritangizdagi amaliy vazifalardan boshlang.',
    'К этой траектории пока не привязаны курсы, поэтому значки закрыты. Начните с практических задач в дорожной карте Харада.',
  ),
  'nb.proverb': c('Little by little, a little becomes a lot.', 'Oz-oz o‘rganib dono bo‘lur.', 'Дорогу осилит идущий.'),
  'nb.next': c('Next', 'Navbatdagi', 'Следующий'),
  'nb.courses': c('{done} of {total} courses done', '{total} ta kursdan {done} tasi tugallandi', 'Пройдено курсов: {done} из {total}'),

  // Demand tab hierarchy
  'demand.verdict.high': c('Strong outlook', 'Kuchli istiqbol', 'Сильные перспективы'),
  'demand.verdict.mid': c('Moderate outlook', 'O‘rtacha istiqbol', 'Умеренные перспективы'),
  'demand.verdict.low': c('Softer outlook', 'Sustroq istiqbol', 'Более слабые перспективы'),
  'demand.how': c('How to read these numbers', 'Bu raqamlar qanday o‘qiladi', 'Как читать эти цифры'),
  'demand.how.body': c(
    'Each index compares pathways inside SkillCast on a 0–100 scale under one scenario. Higher means stronger expected demand. They are scenario estimates, not job counts or salaries.',
    'Har bir indeks SkillCast ichidagi yo‘nalishlarni bitta ssenariy bo‘yicha 0–100 shkalada solishtiradi. Qanchalik yuqori bo‘lsa, kutilayotgan talab shunchalik kuchli. Bu ssenariy taxminlari, ish o‘rinlari soni yoki maosh emas.',
    'Каждый индекс сравнивает траектории SkillCast по шкале 0–100 в одном сценарии. Чем выше, тем сильнее ожидаемый спрос. Это сценарные оценки, а не число вакансий или зарплаты.',
  ),
  'demand.details': c('Calculation details', 'Hisob-kitob tafsilotlari', 'Детали расчёта'),
  'demand.cols.help': c(
    'Posting frequency: share of sampled postings that mention the skill. Trend: recent versus earlier postings. Research horizon: cited research baseline. Momentum: the blended score shown above.',
    'E’lonlar chastotasi: ko‘nikma tilga olingan e’lonlar ulushi. Trend: so‘nggi va avvalgi e’lonlar solishtiruvi. Tadqiqot davri: iqtibos keltirilgan tadqiqot bazasi. Dinamika: yuqoridagi umumlashgan ball.',
    'Частота: доля вакансий в выборке, где упоминается навык. Тренд: свежие вакансии против ранних. Исследовательский горизонт: цитируемая исследовательская база. Импульс: итоговый балл выше.',
  ),

  // SDG tab
  'sdg.summary': c(
    'You already have {have} of the skills linked to these goals. Your pathway adds {learn} more.',
    'Bu maqsadlar bilan bog‘liq ko‘nikmalardan {have} tasi sizda allaqachon bor. Yo‘nalishingiz yana {learn} tasini qo‘shadi.',
    'У вас уже есть навыков, связанных с этими целями: {have}. Траектория добавит ещё {learn}.',
  ),
  'sdg.more': c('All goals this pathway touches', 'Bu yo‘nalish daxldor barcha maqsadlar', 'Все цели, которых касается траектория'),

  // Learning sources
  'ls.badge.top': c('Recommended for you', 'Siz uchun tavsiya', 'Рекомендуем вам'),
  'ls.badge.official': c('Official provider', 'Rasmiy provayder', 'Официальный провайдер'),
  'ls.badge.beginner': c('Beginner-friendly', 'Boshlovchilar uchun', 'Для начинающих'),
  'ls.checked': c('Link checked {date}', 'Havola {date} da tekshirilgan', 'Ссылка проверена {date}'),
};
