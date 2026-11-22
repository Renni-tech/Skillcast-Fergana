// ─── Demo-day copy (EN / UZ / RU) ──────────────────────────────────────────
// Demo learner, badge previews, the Wind Rose explanation and SkillCast's
// warmer voice. Applied last by i18n.ts, so a key here also refreshes the
// wording of an existing key. Uzbek Cyrillic is converted from Uzbek (Latin).
// Every entry must have all three languages (tests/i18n-parity.test.ts).

type Copy = { en: string; uz: string; ru: string };
const c = (en: string, uz: string, ru: string): Copy => ({ en, uz, ru });

export const POLISH_COPY: Record<string, Copy> = {
  // ── Demo learner ────────────────────────────────────────────────────────
  'demo.try': c('Try Demo Profile', 'Demo profilni sinash', 'Демо-профиль'),
  'demo.try.hint': c(
    'In a hurry? Meet Malika, our synthetic learner, in one click.',
    'Shoshyapsizmi? Sintetik o‘quvchimiz Malika bilan bir bosishda tanishing.',
    'Спешите? Познакомьтесь с Маликой, нашим синтетическим учеником, в один клик.',
  ),
  'demo.confirm.title': c('Swap in the demo learner?', 'Demo o‘quvchini yuklaymizmi?', 'Загрузить демо-ученика?'),
  'demo.confirm.d': c(
    'Your own answers and progress are set aside safely on this device. Choose “Leave demo” at any time and they come straight back.',
    'Sizning javoblaringiz va natijalaringiz shu qurilmada xavfsiz saqlab qo‘yiladi. Istalgan payt “Demodan chiqish”ni bosing — ular darhol qaytadi.',
    'Ваши ответы и прогресс бережно сохранятся на этом устройстве. Нажмите «Выйти из демо» в любой момент — и всё вернётся.',
  ),
  'demo.confirm.go': c('Load the demo', 'Demoni yuklash', 'Загрузить демо'),
  'demo.confirm.cancel': c('Keep my profile', 'Profilim qolsin', 'Оставить мой профиль'),
  'demo.banner.label': c('Demo data.', 'Demo ma’lumotlar.', 'Демо-данные.'),
  'demo.banner': c(
    'You are exploring Malika, a synthetic office administrator in Fergana who is moving into AI-augmented business analysis. She is part-way there: some goals done, some in progress, real gaps left. Nothing here is a real person.',
    'Siz Malika — Farg‘onadagi sintetik ofis ma’muri profilini ko‘ryapsiz. U sun’iy intellekt yordamidagi biznes tahliliga o‘tmoqda va yo‘lning yarmida: ba’zi maqsadlar bajarilgan, ba’zilari jarayonda, haqiqiy bo‘shliqlar hali bor. Bu haqiqiy inson emas.',
    'Вы смотрите профиль Малики — синтетического офис-менеджера из Ферганы, которая переходит в бизнес-анализ с ИИ. Она на полпути: часть целей достигнута, часть в процессе, реальные пробелы остаются. Это не реальный человек.',
  ),
  'demo.banner.review': c('See her answers', 'Javoblarini ko‘rish', 'Её ответы'),
  'demo.banner.exit': c('Leave demo', 'Demodan chiqish', 'Выйти из демо'),
  // ── Wind Rose explained by the assistant (uses the chart's own numbers) ──
  'va.r.radar.intro': c(
    'Here is your Wind Rose: {n} skills on one map. Each spoke is a skill on a 0–100 scale, where 100 is expert; your self-rated level counts 20 points per level, so level 3 of 5 shows as 60. The filled area is you today, the solid violet line is where market demand is heading, and the dashed teal line is what {role} needs. You are level with or ahead of the market on {aligned} of {n}.',
    'Mana Shamol gulingiz: bitta xaritada {n} ta ko‘nikma. Har bir o‘q — 0 dan 100 gacha shkaladagi ko‘nikma, 100 — ekspert darajasi; o‘zingiz baholagan har bir daraja 20 ballga teng, ya’ni 5 dan 3-daraja 60 bo‘lib ko‘rinadi. To‘ldirilgan maydon — bugungi siz, binafsha chiziq — bozor talabi qayerga ketayotgani, teal rangli uzuq chiziq — {role} uchun kerakli daraja. {n} tadan {aligned} ta ko‘nikmada bozor bilan tengsiz yoki undan oldindasiz.',
    'Вот ваша Роза ветров: {n} навыков на одной карте. Каждый луч — навык по шкале от 0 до 100, где 100 — эксперт; каждый уровень вашей самооценки — 20 баллов, так что уровень 3 из 5 — это 60. Закрашенная область — вы сегодня, сплошная фиолетовая линия — куда движется спрос, бирюзовая пунктирная — что нужно для роли «{role}». На {aligned} из {n} навыков вы наравне с рынком или впереди.',
  ),
  'va.r.radar.intro.noRole': c(
    'Here is your Wind Rose: {n} skills on one map. Each spoke is a skill on a 0–100 scale; your self-rated level counts 20 points per level, so level 3 of 5 shows as 60. The filled area is you today and the violet line is where market demand is heading. You are level with or ahead of the market on {aligned} of {n}. Choose a pathway and I will add its target line.',
    'Mana Shamol gulingiz: bitta xaritada {n} ta ko‘nikma. Har bir o‘q — 0 dan 100 gacha shkaladagi ko‘nikma; o‘zingiz baholagan har bir daraja 20 ballga teng, ya’ni 5 dan 3-daraja 60 bo‘lib ko‘rinadi. To‘ldirilgan maydon — bugungi siz, binafsha chiziq — bozor talabi yo‘nalishi. {n} tadan {aligned} ta ko‘nikmada bozor bilan tengsiz yoki oldindasiz. Yo‘nalish tanlang — uning maqsad chizig‘ini qo‘shaman.',
    'Вот ваша Роза ветров: {n} навыков на одной карте. Каждый луч — навык по шкале от 0 до 100; каждый уровень вашей самооценки — 20 баллов, так что уровень 3 из 5 — это 60. Закрашенная область — вы сегодня, фиолетовая линия — куда движется спрос. На {aligned} из {n} навыков вы наравне с рынком или впереди. Выберите траекторию — и я добавлю её целевую линию.',
  ),
  'va.r.radar.item': c('{skill} (you {you}, needed {target}, market {market})', '{skill} (siz {you}, kerak {target}, bozor {market})', '{skill} (вы {you}, нужно {target}, рынок {market})'),
  'va.r.radar.item.nt': c('{skill} (you {you}, market {market})', '{skill} (siz {you}, bozor {market})', '{skill} (вы {you}, рынок {market})'),
  'va.r.radar.gaps': c('Your biggest gaps, where the lines reach past your area: {list}.', 'Eng katta bo‘shliqlaringiz — chiziqlar maydoningizdan chiqib ketgan joylar: {list}.', 'Самые большие пробелы — там, где линии выходят за вашу область: {list}.'),
  'va.r.radar.none': c('No big gaps on this map — you are ahead of the market on the skills shown. Honestly, a little impressive.', 'Bu xaritada katta bo‘shliq yo‘q — ko‘rsatilgan ko‘nikmalarda bozordan oldindasiz. Rostini aytsam, biroz hayratlanarli.', 'Больших пробелов на карте нет — по показанным навыкам вы впереди рынка. Честно, впечатляет.'),
  'va.r.radar.strengths': c('Your strengths to lean on: {list}.', 'Tayanishingiz mumkin bo‘lgan kuchli tomonlaringiz: {list}.', 'Ваши сильные стороны, на которые можно опереться: {list}.'),
  'va.r.radar.next': c('My suggestion: start with {skill}. “{course}” is the next course on your pathway for it — shall we open it?', 'Taklifim: {skill} dan boshlang. “{course}” — yo‘lingizdagi bu ko‘nikma uchun keyingi kurs. Ochamizmi?', 'Мой совет: начните с навыка «{skill}». «{course}» — следующий курс на вашем пути для него. Откроем?'),
  'va.r.radar.next.noCourse': c('My suggestion: start with {skill}. Open “What to learn” and I will show you where to learn it.', 'Taklifim: {skill} dan boshlang. “Nimani o‘rganish kerak”ni oching — qayerda o‘rganishni ko‘rsataman.', 'Мой совет: начните с навыка «{skill}». Откройте «Что изучать» — я покажу, где этому научиться.'),
  'va.r.radar.empty': c('Your Wind Rose is still empty. Rate a few skills and I will read it with you.', 'Shamol gulingiz hali bo‘sh. Bir nechta ko‘nikmani baholang — birga o‘qiymiz.', 'Ваша Роза ветров пока пуста. Оцените несколько навыков — и разберём её вместе.'),
  'va.audio.preparing': c('Warming up my voice…', 'Ovozimni tayyorlayapman…', 'Готовлю голос…'),
  'va.audio.playing': c('Reading aloud — press Stop any time.', 'Ovoz chiqarib o‘qiyapman — istalgan payt “To‘xtatish”ni bosing.', 'Читаю вслух — нажмите «Стоп» в любой момент.'),
  'va.audio.textFallback': c('The full answer is written above, so nothing is lost.', 'To‘liq javob yuqorida yozilgan, hech narsa yo‘qolmaydi.', 'Полный ответ написан выше — ничего не потеряется.'),

  // Corrected: the pathway target line is teal, not amber, and "you" can change colour.
  'va.r.radar': c(
    'Your Wind Rose compares three things for each skill: the filled area is your current level, the violet line is where market demand is moving, and the dashed teal line is what your pathway needs. Where a line reaches further than your area, that is a gap. Improve next: {gaps}.',
    'Shamol gulingiz har bir ko‘nikma bo‘yicha uch narsani solishtiradi: to‘ldirilgan maydon — hozirgi darajangiz, binafsha chiziq — bozor talabi qayerga siljiyotgani, teal rangli uzuq chiziq — yo‘nalishingiz talab qiladigan daraja. Chiziq maydoningizdan uzoqroqqa chiqqan joy — bo‘shliq. Keyingi navbatda yaxshilang: {gaps}.',
    'Роза ветров сравнивает по каждому навыку три вещи: закрашенная область — ваш текущий уровень, фиолетовая линия — куда движется спрос, бирюзовая пунктирная — что нужно вашей траектории. Где линия выходит дальше вашей области — там пробел. Улучшить в первую очередь: {gaps}.',
  ),
  'wr.how': c(
    'Read it like a compass: where the violet line (market) or the dashed teal line (your pathway) reaches further than your filled area, that skill is a gap worth learning. Where your area reaches past both, it is a strength.',
    'Uni kompas kabi o‘qing: binafsha chiziq (bozor) yoki teal rangli uzuq chiziq (yo‘nalishingiz) to‘ldirilgan maydoningizdan uzoqroqqa chiqqan joyda o‘sha ko‘nikma o‘rganishga arziydigan bo‘shliqdir. Maydoningiz ikkalasidan ham o‘tib ketgan joy — kuchli tomoningiz.',
    'Читайте как компас: там, где фиолетовая линия (рынок) или бирюзовая пунктирная (ваша траектория) выходит дальше закрашенной области, навык стоит подтянуть. Где ваша область выходит за обе линии — это сильная сторона.',
  ),
  'wr.legend.target': c('Dashed teal line: the level your chosen pathway needs.', 'Teal rangli uzuq chiziq: tanlangan yo‘nalishingiz talab qiladigan daraja.', 'Бирюзовая пунктирная линия: уровень, нужный выбранной траектории.'),

  // ── Career direction map with an incomplete profile ─────────────────────
  'wr.incomplete.skills': c(
    'Your area is still empty because no skills are rated yet, so this map only shows where the market is heading. Rate a few skills and your own direction appears.',
    'Hali birorta ko‘nikma baholanmagani uchun maydoningiz bo‘sh — xarita faqat bozor yo‘nalishini ko‘rsatyapti. Bir nechta ko‘nikmani baholang, o‘z yo‘nalishingiz paydo bo‘ladi.',
    'Ваша область пока пуста: навыки ещё не оценены, поэтому карта показывает только направление рынка. Оцените несколько навыков — и появится ваше собственное направление.',
  ),
  'wr.incomplete.skills.go': c('Rate my skills', 'Ko‘nikmalarimni baholash', 'Оценить мои навыки'),
  'wr.incomplete.role': c(
    'No pathway chosen yet, so there is no target line. Pick a pathway and I will draw exactly what it needs.',
    'Hali yo‘nalish tanlanmagan, shuning uchun maqsad chizig‘i yo‘q. Yo‘nalish tanlang — unga aynan nima kerakligini chizib beraman.',
    'Траектория ещё не выбрана, поэтому целевой линии нет. Выберите траекторию — и я нарисую, что именно ей нужно.',
  ),
  'wr.incomplete.role.go': c('Choose a pathway', 'Yo‘nalish tanlash', 'Выбрать траекторию'),

  // ── Badge previews ──────────────────────────────────────────────────────
  'sb.preview': c('Preview', 'Ko‘rib chiqish', 'Подробнее'),
  'sb.preview.ribbon': c('Preview', 'Namuna', 'Превью'),
  'sb.preview.earned': c('You earned this one on {date}. Nicely done.', 'Buni {date} da qo‘lga kiritgansiz. Barakalla!', 'Вы получили его {date}. Отлично!'),
  'sb.preview.locked': c('Locked · {value} of {target} done', 'Yopiq · {target} tadan {value} tasi bajarildi', 'Закрыт · выполнено {value} из {target}'),
  'sb.preview.riddle': c('The riddle', 'Topishmoq', 'Загадка'),
  'sb.preview.unlock': c('How to unlock it', 'Qanday ochiladi', 'Как открыть'),
  'sb.preview.lore': c('The treasure', 'Xazina haqida', 'О сокровище'),
  'sb.preview.play': c('Play the unlock animation', 'Ochilish animatsiyasini ko‘rish', 'Показать анимацию открытия'),
  'sb.preview.note': c(
    'Previewing is just looking. Only real progress unlocks a badge, and it stays on this device.',
    'Ko‘rib chiqish — shunchaki tanishish. Nishonni faqat haqiqiy natija ochadi va u shu qurilmada saqlanadi.',
    'Просмотр — это просто знакомство. Значок открывает только реальный прогресс, и он хранится на этом устройстве.',
  ),

  // ── Badge copy review: clearer, accurate wording (meaning kept) ─────────
  'sb.riddle.first-steps.bronze': c(
    'I carry travellers, yet I have no legs of my own. Begin your journey — finish setting up your profile — and I am yours.',
    'Yo‘lovchini ko‘taraman, ammo o‘z oyog‘im yo‘q. Safarni boshlang — profilingizni to‘ldiring — men sizniki bo‘laman.',
    'Я ношу путников, хотя своих ног у меня нет. Начни путь — заполни профиль — и я твой.',
  ),
  'sb.riddle.career-explorer.gold': c(
    'I measure the sky down to the very degree. Reach 85% skill readiness to reveal me.',
    'Osmonni gradusigacha aniq o‘lchayman. Meni ochish uchun ko‘nikmalar tayyorligini 85% ga yetkazing.',
    'Я измеряю небо с точностью до градуса. Достигни 85% готовности навыков, чтобы открыть меня.',
  ),
  'sb.riddle.career-explorer.silver': c(
    'Stars turn in my rings, as they did for a great Samarkand astronomer. Reach 60% skill readiness.',
    'Halqalarimda yulduzlar aylanadi — xuddi buyuk samarqandlik munajjim zamonidagidek. Ko‘nikmalar tayyorligini 60% ga yetkazing.',
    'В моих кольцах вращаются звёзды, как у великого самаркандского астронома. Достигни 60% готовности навыков.',
  ),
  'sb.riddle.curious-mind.silver': c(
    'My mist has two colours: one of machines, one of leaves. Finish one AI course and one green-skills course.',
    'Tumanim ikki rangli: biri mashinalarniki, biri yaproqlarniki. Bitta AI va bitta yashil ko‘nikmalar kursini tugating.',
    'Мой туман двух цветов: один — цвет машин, другой — цвет листьев. Пройди один курс по ИИ и один по зелёным навыкам.',
  ),
  'sb.riddle.goal-achiever.bronze': c(
    'Pull, aim, release — your first target is near. Finish all eight tasks for one skill in your Harada roadmap.',
    'Torting, nishonga oling, qo‘yib yuboring — birinchi nishon yaqin. Harada yo‘l xaritangizda bitta ko‘nikmaning sakkizta vazifasini bajaring.',
    'Натяни, прицелься, отпусти — первая цель близко. Выполни все восемь задач одного навыка в маршруте Харады.',
  ),
  'sb.riddle.future-ready.gold': c(
    'The legend spreads its golden wings only for the truly ready: finish your pathway, reach 85% readiness and complete the Harada milestones for your top skill gaps.',
    'Afsona oltin qanotlarini faqat chinakam tayyorlar uchun yoyadi: yo‘lingizni tugating, 85% tayyorlikka yeting va asosiy ko‘nikma bo‘shliqlaringiz bo‘yicha Harada bosqichlarini yakunlang.',
    'Легенда раскрывает золотые крылья лишь по-настоящему готовым: пройди путь, достигни 85% готовности и заверши этапы Харады по главным пробелам в навыках.',
  ),
  'ach.req.goal-achiever.bronze': c(
    'Finish your first Harada skill milestone (all eight tasks for one skill).',
    'Birinchi Harada ko‘nikma bosqichini yakunlang (bitta ko‘nikmaning barcha sakkizta vazifasi).',
    'Завершите первый этап навыка по Хараде (все восемь задач одного навыка).',
  ),
  'ach.req.future-ready.gold': c(
    'Complete your whole pathway, reach 85% skill readiness and finish the Harada milestones for your top skill gaps (up to five).',
    'Butun yo‘lni bosib o‘ting, ko‘nikmalar tayyorligini 85% ga yetkazing va asosiy ko‘nikma bo‘shliqlaringiz (beshtagacha) bo‘yicha Harada bosqichlarini yakunlang.',
    'Пройдите весь путь, достигните 85% готовности навыков и завершите этапы Харады по главным пробелам (до пяти).',
  ),
  'ach.nextTitle': c('{n} more badges to “{title}”', '“{title}” unvonigacha yana {n} ta nishon', 'До звания «{title}» ещё {n} знач.'),

  // ── SkillCast's voice: warm, confident, a little playful ───────────────
  'buddy.noRole': c(
    'Choose a pathway and I will plot the route. Directions are kind of my thing.',
    'Yo‘nalish tanlang — yo‘lni o‘zim chizib beraman. Yo‘l ko‘rsatish — mening ishim.',
    'Выберите траекторию — а маршрут я проложу сама. Направления — это моё.',
  ),
  'buddy.gap': c(
    'You are {n}% ready for {role}. Your biggest opportunity is {skill} — and I have already lined up where to learn it.',
    '{role} uchun {n}% tayyorsiz. Eng katta imkoniyatingiz — {skill}, uni qayerda o‘rganishni allaqachon tayyorlab qo‘ydim.',
    'Вы готовы к роли «{role}» на {n}%. Главная возможность — {skill}, и я уже подобрала, где этому научиться.',
  ),
  'buddy.ready': c(
    'You are {n}% ready for {role}. Look at you! Only {skill} stands between you and the finish line.',
    '{role} uchun {n}% tayyorsiz. Qoyil! Marra bilan orangizda faqat {skill} qoldi.',
    'Вы готовы к роли «{role}» на {n}%. Вот это да! До финиша остался только навык «{skill}».',
  ),
  'buddy.done': c(
    'You are {n}% ready for {role} with no big gaps left. Honestly, I am a little impressed.',
    '{role} uchun {n}% tayyorsiz, katta bo‘shliqlar qolmadi. Rostini aytsam, hayratdaman.',
    'Вы готовы к роли «{role}» на {n}%, крупных пробелов не осталось. Честно, я впечатлена.',
  ),
  'ach.msg.bronze': c('Nice start — I knew you had it in you. Keep going!', 'Ajoyib boshlanish — bunga qodir ekaningizni bilardim. Davom eting!', 'Отличное начало — я знала, что у вас получится. Продолжайте!'),
  'ach.msg.silver': c('Real progress. I noticed — and employers will too.', 'Haqiqiy natija. Men buni payqadim — ish beruvchilar ham payqaydi.', 'Настоящий прогресс. Я заметила — и работодатели заметят.'),
  'ach.msg.gold': c('Top tier! That took real commitment. I am genuinely impressed.', 'Eng yuqori daraja! Bunga chinakam qat’iyat kerak edi. Chin dildan hayratdaman.', 'Высший уровень! Это потребовало настоящей настойчивости. Я искренне впечатлена.'),
  'sb.next.title': c('Treasure added — your collection is looking good.', 'Xazina qo‘shildi — to‘plamingiz chiroyli bo‘lib boryapti.', 'Сокровище добавлено — коллекция выглядит отлично.'),
  'sb.next.d': c('So… what shall we do next?', 'Xo‘sh… endi nima qilamiz?', 'Ну что… чем займёмся дальше?'),
  'wr.lede': c('Where you are now, where demand is heading, and where I would nudge you next.', 'Hozir qayerdasiz, talab qayoqqa ketyapti va keyingi qadamni qayerga qo‘yishni maslahat beraman.', 'Где вы сейчас, куда движется спрос и куда я бы подтолкнула вас дальше.'),
  'wr.priorities.none': c('No big gaps on this map. Show-off! Keep your strongest skills sharp.', 'Bu xaritada katta bo‘shliq yo‘q. Zo‘r! Eng kuchli ko‘nikmalaringizni charxlab boring.', 'Больших пробелов на карте нет. Вот это да! Держите сильные навыки в форме.'),
  'wr.detail.gap': c('Worth learning next: it closes a {n}-point gap. I would start right here.', 'Keyingi o‘rganishga arziydi: {n} ballik bo‘shliqni yopadi. Men aynan shu yerdan boshlardim.', 'Стоит изучить следующим: закроет пробел в {n} баллов. Я бы начала именно отсюда.'),
  'wr.detail.strength': c('One of your strengths — keep it polished.', 'Kuchli tomonlaringizdan biri — uni sayqallab boring.', 'Одна из ваших сильных сторон — держите её в форме.'),
  'wr.detail.close': c('So close to the market. A quick refresher and you are there.', 'Bozorga juda yaqin. Qisqa takrorlash — va maqsadga yetasiz.', 'Совсем близко к рынку. Небольшое повторение — и вы там.'),
  'wr.strengths.none': c('Rate a few skills and I will show off your strengths for you.', 'Bir nechta ko‘nikmani baholang — kuchli tomonlaringizni o‘zim ko‘rsataman.', 'Оцените несколько навыков — и я сама покажу ваши сильные стороны.'),
  'A few details help tailor your learning pathways and career outlook.': c(
    'Tell me a little about yourself. I will do the heavy lifting on pathways and outlook.',
    'O‘zingiz haqingizda biroz aytib bering. Yo‘nalish va istiqbolni men o‘zim hisoblab beraman.',
    'Расскажите немного о себе. Траектории и прогноз я возьму на себя.',
  ),
  'va.examples': c('Ask me anything — for example:', 'Mendan istalgan narsani so‘rang — masalan:', 'Спросите меня о чём угодно — например:'),
  'va.ai.thinking': c('Thinking it over for you…', 'Siz uchun o‘ylab ko‘ryapman…', 'Обдумываю для вас…'),
};
