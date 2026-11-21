/* SEA PUPPIES — all words live here (EN + RU).
   Rule of the pager: the LCD shows only pictures and numbers; words go to the dialog box. */
window.SP = window.SP || {};

SP.STR = {
  en: {
    'ui.power': 'Press to turn on',
    'ui.powerOff': 'Turn it off',
    'ui.ok': 'OK',
    'ui.x3': 'B ×3',
    'ui.cut': 'cut!',
    'ui.hat': 'next hat',
    'ui.listen': 'next pup',
    'ui.pick': 'that one!',
    'ui.sun': 'sun',
    'ui.wind': 'wind',
    'ui.choose': 'choose',
    'ui.keys': 'Keyboard: A / B / C, or ← space →',
    'ui.btnA': 'A: choose', 'ui.btnB': 'B: OK', 'ui.btnC': 'C: back', 'ui.btnPower': 'Power',
    'ui.screen': 'Pager screen',
    'ui.lang': 'Switch language to Russian',
    'ui.sound': 'Sound',

    'need.food': 'food', 'need.sleep': 'sleep', 'need.play': 'play', 'need.talk': 'talk',
    'need.care': 'grooming', 'need.heal': 'rescue', 'need.thermo': 'heat & cold', 'need.decor': 'accessories',

    'intro.p1': 'This is a sea lion pup. Yes, a pup — like a puppy.',
    'intro.p2': 'He has eight needs. You will take care of them one by one.',
    'intro.p3': 'B, the middle button, is OK. A picks, C goes back.',
    'menu.next': 'Next up: {need}. The blinking icon is his request. Press B.',
    'menu.notyet': 'Not that yet. He is asking for something else — look for the blinking icon.',
    'status': 'Needs met: {n} of 8.',

    'puppy.head': 'Puppy check',
    'puppy.yes': '✔ like a dog',
    'puppy.no': '✘ not like a dog',

    'food.prompt': 'He is hungry. Press B and he will go fishing.',
    'food.p1': 'Sea lions don’t chew. Their teeth are made for gripping, not grinding, so small fish go down whole.',
    'food.p2': 'Bigger prey gets shaken at the surface with a hard whip of the head until it rips into pieces small enough to swallow.',
    'food.puppy': 'That head-whip is the same move a dog gives a squeaky toy. For him, it’s a knife and fork.',

    'sleep.prompt': 'His eyes are closing. Press B to dim the lights.',
    'sleep.p1': 'On land, a sea lion sleeps off the hunt and stays warm by piling up with the others.',
    'sleep.p2': 'His cousin, the northern fur seal, can nap at sea with half its brain at a time: one half sleeps, the other keeps watch, and one flipper keeps paddling.',
    'sleep.p3': 'In Russian, fur seals are called морские котики, literally “sea kitties.” Sea kitties, sea puppies.',
    'sleep.puppy': 'A heap of sleeping pups. Any dog owner knows this shape.',

    'play.prompt': 'He is bored. Press B to throw the ball.',
    'play.p1': 'Young sea lions play with whatever the sea brings: kelp, pebbles, each other. Underwater they spin, torpedo and somersault.',
    'play.p2': 'Scientists think play is practice — for agility, strength and getting along in a crowded colony.',
    'play.puppy': 'Every type of play known in dogs — chasing, play-fighting, toys — has been seen in sea lions too.',

    'talk.prompt': 'He has something to say. Press B — three times.',
    'talk.bark': '1/3 · Bark. In breeding season, adult males bark for hours on end: this patch of beach is mine.',
    'talk.call': '2/3 · Roll call. Mom is back after a few days at sea. She trumpets, he bleats back.',
    'talk.crowd1': 'Easy? Not on this beach. Let’s fill the screen with sea lions, one pixel each.',
    'talk.crowd2': 'Screen full: 12,288 pixels. About 80,000 sea lions breed on San Miguel Island alone. That’s 6.5 screens like this one.',
    'talk.game1': 'Now you are the mom. This is your pup’s voice. Listen, and remember its shape.',
    'talk.game2': 'Three pups are calling. A: listen to the next one. B: that’s mine!',
    'talk.wrong': 'Not yours. A real mother sea lion would chase this pup away.',
    'talk.right': 'That’s him. Every call has its own shape: its pitch, its rhythm, the way the sound bends.',
    'talk.sniff': '3/3 · Nose to nose. When a mother finds her pup, she sniffs him as a final check.',
    'talk.p1': 'Those voices work like ID badges. Australian sea lion mothers can tell their own pup’s call from others’ by the time the pup is 48 hours old.',
    'talk.p2': 'Whales and dolphins do most of their talking underwater. Sea lions talk mostly in the air, on beaches packed with thousands of animals, so every voice has to stand out.',
    'talk.puppy': 'Officially, NOAA says male California sea lions “bark like dogs.” But no dog has to find its mom among thousands of look-alikes.',

    'care.prompt': 'Something itches. Press B.',
    'care.p1': 'He scratches with a hind flipper. Its three middle toes carry claws — a built-in comb.',
    'care.p2': 'Flipping wet sand onto his back is a different trick: that one is for cooling off. Hold that thought.',
    'care.puppy': 'Back-paw scratching. Sorry, back-flipper. Pure dog.',

    'heal.prompt': 'Something is wrapped around his neck. Press B to cut it — three snips.',
    'heal.p1': 'What gets stuck around a sea lion’s neck? Here is what biologists found on Steller sea lions in Alaska and British Columbia.',
    'heal.p2': 'Packing straps: 54%. Rubber bands: 30%. Fishing nets, the thing everyone pictures: just 7%.',
    'heal.p3': 'Young animals get caught most. In Oregon, 60% of entangled Steller sea lions were juveniles. A loop can kill through infection, starvation or drowning.',
    'heal.p4': 'Never try to free a wild sea lion yourself; call trained rescuers. What you can do: <span class="cta">cut every plastic loop</span> before you throw it away. Biologists call it Lose the Loop.',
    'heal.puppy': 'A collar nobody will ever take off. No dog needs that. Neither does he.',

    'thermo.prompt': 'Hot or cold? Press B to turn up the sun.',
    'thermo.hot': 'Too hot: fan a flipper, dip it in the water, flip wet sand onto the back.',
    'thermo.prompt2': 'Press B again for a cold wind.',
    'thermo.cold': 'Too cold: float at the surface and hold a flipper up to the sun.',
    'thermo.p1': 'His flippers have little blubber or fur, and the blood vessels run close to the skin. A flipper is a radiator and a solar panel in one.',
    'thermo.p2': 'From shore it looks like waving, or like an animal caught in a net: NOAA says this “rafting” gets mistaken for entanglement.',
    'thermo.puppy': 'Dogs cool down by panting. Sea lions wave.',

    'decor.prompt': 'Dress-up time! A: next hat. B: put it on.',
    'decor.p1': 'Real sea lions don’t get hats. They get tags.',
    'decor.p2': 'A plastic tag on a front flipper (bright orange if a rescue center released him), a branded number, or a satellite tracker glued to the fur that drops off at the next molt.',
    'decor.p3': 'Every year NOAA scientists mark about 1% of the pups born on San Miguel Island, then keep spotting them for years. That’s how a sea lion’s life story gets written.',
    'decor.puppy': 'Basically a dog tag. Just on a flipper.',

    'end.p1': 'All eight needs met. He doesn’t need your care anymore. Observation complete.',
    'end.p2': 'Puppy score: 6 of 8. Close! Sea lions really are “dog-like” carnivores: suborder Caniformia, with dogs, bears, raccoons and weasels.',
    'end.p3': 'But their closest land relatives are bears or the weasel family — scientists still argue which. Not dogs. Pups, though? Always.',
    'end.p4': 'He has gone back to the ocean. You can turn the pager off now.',

    'cr.title': 'sea puppies — the homepage',
    'cr.marquee': '★ welcome to our homepage ★ cut every plastic loop before you throw it away ★ thanks for taking care of him ★ come back soon ★',
    'cr.liza': 'Liza', 'cr.ulyana': 'Ulyana',
    'cr.hey': 'hey hey! we’re Liza and Ulyana.',
    'cr.made': 'We study, and we make funny things with soul (and a little vibe-coding). Sea Puppies is our entry for the Pudding Cup 2026.',
    'cr.h1t': 'Lose the loop.', 'cr.h1': 'Cut packing straps, rubber bands and any plastic ring before you throw them away.',
    'cr.h2t': 'Keep your distance.', 'cr.h2': 'Stay at least 50 yards (150 feet) from a stranded or tangled sea lion and call your local stranding network.',
    'cr.h2a': 'NOAA: how to report',
    'cr.h3t': 'Support rescuers.', 'cr.h3': 'Rescue centers free, treat and tag sea lions like ours. For example:',
    'cr.bonus': 'Secret level: can you keep a beat better than a sea lion?',
    'cr.bonusBtn': '▶ run ronan_beat.exe',
    'cr.srcIntro': 'Every fact in the pager comes from these sources. The sounds are synthesized beeps, not recordings; the call shapes in the mom game are illustrations.',
    'cr.again': '▶ play again',
    'cr.code': 'source code & process',
    'cr.foot': 'Made for the Pudding Cup 2026 by Liza & Ulyana. Pixel art drawn in code; edit it in tools/spritelab.py.',

    'bonus.intro': 'Ronan is a California sea lion at UC Santa Cruz. In 2013 she became the first non-human mammal shown to keep a beat. At 120 beats per minute she lands about 15 milliseconds from the beat. Your turn: tap on every beat.',
    'bonus.start': '▶ start',
    'bonus.tap': 'tap!',
    'bonus.count': 'Get ready… {n}',
    'bonus.go': 'Tap on every beat! {n} to go.',
    'bonus.result': 'Your average miss: {ms} ms ({hits} of 16 beats caught). Ronan’s: about 15 ms.',
    'bonus.win': 'You out-grooved a sea lion. Ronan would like a word.',
    'bonus.lose': 'Ronan wins this round. She has been practicing for twelve years.',
    'bonus.none': 'No taps landed near the beat. Press start and try again!',
    'bonus.note': 'Your number includes your device’s own delay: screen, keyboard, wireless headphones. Source: Cook et al., Scientific Reports (2025).'
  },

  ru: {
    'ui.power': 'Нажми, чтобы включить',
    'ui.powerOff': 'Выключи',
    'ui.ok': 'ОК',
    'ui.x3': 'B ×3',
    'ui.cut': 'режь!',
    'ui.hat': 'другая шапка',
    'ui.listen': 'следующий',
    'ui.pick': 'вот он!',
    'ui.sun': 'солнце',
    'ui.wind': 'ветер',
    'ui.choose': 'выбрать',
    'ui.keys': 'Клавиатура: A / B / C или ← пробел →',
    'ui.btnA': 'A: выбрать', 'ui.btnB': 'B: ОК', 'ui.btnC': 'C: назад', 'ui.btnPower': 'Питание',
    'ui.screen': 'Экран пейджера',
    'ui.lang': 'Переключить язык на английский',
    'ui.sound': 'Звук',

    'need.food': 'еда', 'need.sleep': 'сон', 'need.play': 'игра', 'need.talk': 'общение',
    'need.care': 'уход', 'need.heal': 'лечение', 'need.thermo': 'терморегуляция', 'need.decor': 'украшения',

    'intro.p1': 'Это детёныш морского льва. По-английски такие — pups, «щенки».',
    'intro.p2': 'У него восемь потребностей. Ты позаботишься о каждой по очереди.',
    'intro.p3': 'B, средняя кнопка, — ОК. A — выбрать, C — назад.',
    'menu.next': 'Дальше: {need}. Мигающая иконка — его просьба. Жми B.',
    'menu.notyet': 'Это потом. Сейчас он просит другое — найди мигающую иконку.',
    'status': 'Потребностей закрыто: {n} из 8.',

    'puppy.head': 'Проверка на щенка',
    'puppy.yes': '✔ как собака',
    'puppy.no': '✘ не как собака',

    'food.prompt': 'Он проголодался. Жми B — он пойдёт на рыбалку.',
    'food.p1': 'Морские львы не жуют: зубы у них для хватки, а не для пережёвывания. Мелкую рыбу они глотают целиком.',
    'food.p2': 'Добычу покрупнее трясут у поверхности, резко мотая головой, пока она не порвётся на куски, которые можно проглотить.',
    'food.puppy': 'Так же трясёт головой пёс, терзая игрушку. Только для морского льва это нож и вилка.',

    'sleep.prompt': 'Глаза слипаются. Жми B, чтобы выключить свет.',
    'sleep.p1': 'На суше морской лев отсыпается после охоты и греется, прижавшись к сородичам.',
    'sleep.p2': 'Его родственник, северный морской котик, умеет дремать в воде половиной мозга: одно полушарие спит, другое сторожит, а один ласт подгребает.',
    'sleep.p3': 'Да, котики и львы — разные звери, но родня: и те и другие — ушастые тюлени. По-английски котик — fur seal, «меховой тюлень».',
    'sleep.puppy': 'Куча спящих щенков. Любой собачник узнает эту форму.',

    'play.prompt': 'Ему скучно. Жми B, чтобы бросить мячик.',
    'play.p1': 'Молодые морские львы играют со всем, что приносит море: водорослями, камушками, друг с другом. Под водой крутят пируэты и кувыркаются.',
    'play.p2': 'Учёные считают, что игра — это тренировка: ловкости, силы и умения уживаться в тесной колонии.',
    'play.puppy': 'Все виды игр, известные у собак, — догонялки, шуточные драки, игры с предметами — замечены и у морских львов.',

    'talk.prompt': 'Ему есть что сказать. Жми B — три раза.',
    'talk.bark': '1/3 · Лай. В сезон размножения взрослые самцы лают часами: этот кусок пляжа — мой.',
    'talk.call': '2/3 · Перекличка. Мама вернулась с моря после нескольких дней охоты. Она трубит, он блеет в ответ.',
    'talk.crowd1': 'Легко? Только не на этом пляже. Давай заполним экран морскими львами — по пикселю на каждого.',
    'talk.crowd2': 'Экран заполнен: 12 288 пикселей. Только на острове Сан-Мигель размножаются около 80 000 морских львов — это 6,5 таких экранов.',
    'talk.game1': 'Теперь мама — ты. Вот голос твоего детёныша. Послушай и запомни его форму.',
    'talk.game2': 'Зовут три детёныша. A — слушать следующего. B — вот мой!',
    'talk.wrong': 'Не твой. Настоящая мать прогнала бы чужого детёныша.',
    'talk.right': 'Это он. У каждого голоса своя форма: высота, ритм и то, как изгибается звук.',
    'talk.sniff': '3/3 · Нос к носу. Найдя детёныша, мать обнюхивает его — последняя проверка.',
    'talk.p1': 'Голоса работают как пропуска. Матери австралийских морских львов отличают голос своего детёныша от чужих уже к 48 часам его жизни.',
    'talk.p2': 'Киты и дельфины общаются в основном под водой. Морские львы — чаще на воздухе, на пляжах, где теснятся тысячи зверей. Поэтому каждый голос должен выделяться.',
    'talk.puppy': 'Официально: NOAA пишет, что самцы калифорнийских морских львов «лают как собаки». Но собаке не приходится искать маму среди тысяч одинаковых щенков.',

    'care.prompt': 'Что-то чешется. Жми B.',
    'care.p1': 'Он чешется задним ластом: на трёх средних пальцах у него когти — встроенная расчёска.',
    'care.p2': 'А мокрый песок на спину он подбрасывает не для чистоты, а чтобы остыть. Это пригодится чуть позже.',
    'care.puppy': 'Чешется задней лапой. Простите, ластом. Чистая собака.',

    'heal.prompt': 'У него что-то на шее. Жми B, чтобы разрезать, — три щелчка.',
    'heal.p1': 'Что застревает на шее у морских львов? Вот что биологи нашли на сивучах (северных морских львах) Аляски и Британской Колумбии.',
    'heal.p2': 'Упаковочная лента — 54%. Резинки — 30%. Рыболовные сети, которые все себе представляют, — всего 7%.',
    'heal.p3': 'Чаще всего попадается молодняк: в Орегоне 60% запутавшихся сивучей были подростками. Петля может убить — инфекцией, голодом или утоплением.',
    'heal.p4': 'Не пытайся освободить дикого зверя сам — зови спасателей. Что можешь ты: <span class="cta">разрезай каждую пластиковую петлю</span>, прежде чем выбросить. Биологи называют это Lose the Loop.',
    'heal.puppy': 'Ошейник, который никто никогда не снимет. Собаке такой не нужен. Ему тоже.',

    'thermo.prompt': 'Жарко или холодно? Жми B, чтобы прибавить солнца.',
    'thermo.hot': 'Жарко: помахать ластом, макнуть его в воду, подкинуть на спину мокрый песок.',
    'thermo.prompt2': 'Жми B ещё раз — подует холодный ветер.',
    'thermo.cold': 'Холодно: лечь на воду и подставить ласт солнцу.',
    'thermo.p1': 'На ластах почти нет ни жира, ни меха, а сосуды подходят близко к коже. Ласт — это радиатор и солнечная батарея в одном.',
    'thermo.p2': 'С берега кажется, что он машет рукой. Или что он запутался: NOAA пишет, что таких «дрейфующих» львов принимают за попавших в сеть.',
    'thermo.puppy': 'Собаки остывают, высунув язык. Морские львы — помахав ластом.',

    'decor.prompt': 'Время наряжаться! A — следующая шапка. B — надеть.',
    'decor.p1': 'Настоящим морским львам шляп не выдают. Им выдают метки.',
    'decor.p2': 'Пластиковую бирку на передний ласт (ярко-оранжевую, если его выпустил реабилитационный центр), номерное клеймо или спутниковый маячок на клею — он отпадёт сам при линьке.',
    'decor.p3': 'Каждый год учёные NOAA метят около 1% детёнышей, рождённых на острове Сан-Мигель, и годами встречают их снова. Так пишется биография морского льва.',
    'decor.puppy': 'По сути — жетон с ошейника. Только на ласте.',

    'end.p1': 'Все восемь потребностей закрыты. Твоя забота ему больше не нужна. Наблюдение завершено.',
    'end.p2': 'Щенячий счёт: 6 из 8. Почти! Морские львы и правда «собакообразные» хищники — подотряд Caniformia, вместе с собаками, медведями, енотами и куньими.',
    'end.p3': 'Но ближайшая сухопутная родня у них — медведи или куньи: учёные до сих пор спорят. Не собаки. А вот «щенки» — навсегда.',
    'end.p4': 'Он ушёл обратно в океан. Теперь можно выключить пейджер.',

    'cr.title': 'sea puppies — домашняя страничка',
    'cr.marquee': '★ добро пожаловать на нашу страничку ★ разрезай пластиковые петли, прежде чем выбросить ★ спасибо, что позаботился о нём ★ заходи ещё ★',
    'cr.liza': 'Лиза', 'cr.ulyana': 'Ульяна',
    'cr.hey': 'хей-хей! мы — Лиза и Ульяна.',
    'cr.made': 'Учимся и делаем смешные штуки с душой и вайбкодингом. Sea Puppies — наша работа на Pudding Cup 2026.',
    'cr.h1t': 'Долой петлю.', 'cr.h1': 'Разрезай упаковочную ленту, резинки и любые пластиковые кольца, прежде чем выбросить.',
    'cr.h2t': 'Держи дистанцию.', 'cr.h2': 'Не подходи к выброшенному на берег или запутавшемуся зверю ближе чем на 50 ярдов (45 м) и звони местным спасателям.',
    'cr.h2a': 'NOAA: как сообщить',
    'cr.h3t': 'Поддержи спасателей.', 'cr.h3': 'Центры реабилитации освобождают, лечат и метят таких, как наш. Например:',
    'cr.bonus': 'Секретный уровень: попадёшь в ритм точнее морского льва?',
    'cr.bonusBtn': '▶ запустить ronan_beat.exe',
    'cr.srcIntro': 'Каждый факт в пейджере взят из этих источников. Звуки — синтезированные «пиканья», а не записи; формы голосов в игре с мамой — иллюстрации.',
    'cr.again': '▶ сыграть ещё',
    'cr.code': 'код и процесс',
    'cr.foot': 'Сделано для Pudding Cup 2026 Лизой и Ульяной. Пиксель-арт нарисован кодом; редактируется в tools/spritelab.py.',

    'bonus.intro': 'Ронан — калифорнийский морской лев из Калифорнийского университета в Санта-Крузе. В 2013 году она первой из млекопитающих, кроме человека, показала, что умеет держать ритм. На 120 ударах в минуту она промахивается всего примерно на 15 миллисекунд. Твоя очередь: жми в такт.',
    'bonus.start': '▶ старт',
    'bonus.tap': 'жми!',
    'bonus.count': 'Приготовься… {n}',
    'bonus.go': 'Жми в такт! Осталось {n}.',
    'bonus.result': 'Твой средний промах: {ms} мс (поймано {hits} из 16 ударов). У Ронан — около 15 мс.',
    'bonus.win': 'Ты обогнал(а) морского льва по чувству ритма. Ронан хочет реванш.',
    'bonus.lose': 'Этот раунд за Ронан. Она тренируется двенадцать лет.',
    'bonus.none': 'Ни одно нажатие не попало рядом с ударом. Жми «старт» и попробуй ещё!',
    'bonus.note': 'В твой результат входит задержка устройства: экрана, клавиатуры, беспроводных наушников. Источник: Cook et al., Scientific Reports (2025).'
  }
};

SP.lang = (function () {
  try {
    const saved = localStorage.getItem('sp-lang');
    if (saved === 'en' || saved === 'ru') return saved;
  } catch (e) { /* storage blocked */ }
  return (navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
})();

SP.t = function (key, vars) {
  let s = (SP.STR[SP.lang] && SP.STR[SP.lang][key]);
  if (s == null) s = SP.STR.en[key];
  if (s == null) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => { const v = vars[k]; return v == null ? m : (typeof v === 'function' ? v() : v); });
  return s;
};

SP.applyI18n = function (root) {
  (root || document).querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = SP.t(el.dataset.i18n); });
  document.documentElement.lang = SP.lang;
  const set = (id, key) => { const el = document.getElementById(id); if (el) el.setAttribute('aria-label', SP.t(key)); };
  set('btnA', 'ui.btnA'); set('btnB', 'ui.btnB'); set('btnC', 'ui.btnC'); set('btnPower', 'ui.btnPower');
  set('lcd', 'ui.screen'); set('langBtn', 'ui.lang');
};

SP.setLang = function (lang) {
  SP.lang = lang;
  try { localStorage.setItem('sp-lang', lang); } catch (e) { /* ignore */ }
  SP.applyI18n();
  if (SP.onLang) SP.onLang();
};
