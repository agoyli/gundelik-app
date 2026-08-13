import { tokens } from '../theme';

/*
 * Habarlar — everything arriving from outside the student.
 *
 * Three streams, three different jobs:
 *
 *   Bildirişler — announcements from the school office. NOT an activity log:
 *     a grade, a badge or a homework deadline already has a home (the diary,
 *     the badge page, the homework sheet) and repeating it here would make the
 *     bell ring for things the reader has already seen. This stream is only
 *     what the mekdep müdirligi / okuw bölümi publishes to everyone.
 *
 *   Söhbetler — real conversations: teachers, the class, the parents' group,
 *     support. Messages can carry a file.
 *
 *   Makalalar — editorial content. In production these come from the admin
 *     CMS, authored and scheduled by school/editorial staff; the array below
 *     is only a fixture so the screen has something to render. Nothing here is
 *     app-authored, which is why the list has no "featured" slot and no cover
 *     art: the CMS supplies a title, a category and a body, and the app is not
 *     in a position to decide which of them deserves promotion.
 *
 * Dates are ISO; every screen formats them through `lib/date`.
 */

/* ---------------- announcements ---------------- */

export type NotifKind = 'mekdep' | 'okuw' | 'çäre' | 'duýduryş';

/* An attachment is the same object wherever it appears — a message, an
   announcement — so it is declared once, above both. */
export type ChatFile = { name: string; size: string; kind: 'pdf' | 'img' | 'doc' };

export const NOTIF_META: Record<NotifKind, { label: string; tint: string; ink: string }> = {
  mekdep: { label: 'Mekdep', tint: tokens.blueTint, ink: tokens.blueText },
  okuw: { label: 'Okuw', tint: tokens.tealTint, ink: tokens.tealText },
  'çäre': { label: 'Çäre', tint: tokens.purpleTint, ink: tokens.purpleText },
  'duýduryş': { label: 'Duýduryş', tint: tokens.orangeTint, ink: tokens.orangeText },
};

export type Notif = {
  id: string; kind: NotifKind;
  title: string; body: string;
  /** the office that published it — an announcement always has a sender */
  from: string;
  at: string;
  unread: boolean;
  /** an announcement often *is* the attachment: a timetable, a form, a photo */
  files?: ChatFile[];
};

export const NOTIFS: Notif[] = [
  {
    id: 'n1', kind: 'duýduryş',
    title: 'Rasporýaniýe üýtgedi',
    body: 'Anna güni 3-nji sapak Fizika bilen çalşyryldy. Täze rasporýaniýe gündelikde görünýär we şu günden başlap güýje girýär.\n\nSebäbi: Himiýa mugallymy H. Amanowa okuw maslahatyna gidýär. Onuň sapaklary indiki hepdäniň duşenbe gününden öňki tertipde dowam eder.\n\nÇalşylan sapaklar boýunça öý işi öňki tabşyryga görä galýar. Sorag ýüze çyksa, synp ýolbaşçysyna ýüz tutuň.',
    from: 'Okuw bölümi', at: '2026-02-12T08:10', unread: true,
    files: [{ name: 'Rasporýaniýe-13.02.pdf', size: '180 KB', kind: 'pdf' }],
  },
  {
    id: 'n2', kind: 'çäre',
    title: 'Ene-atalar ýygnagy — 19.02.2026',
    body: 'Sagat 18:00-da 8 «B» synpynyň ene-atalar ýygnagy geçiriler. Ýer: 2-nji gat, 24-nji otag.\n\nGün tertibi: III çärýegiň netijeleri, jemleýji işleriň möhletleri, tomusky okuw meýilnamasy we synp gaznasy barada hasabat.\n\nÝygnaga gatnaşyp bilmeýän bolsaňyz, synp ýolbaşçysyna öňünden habar beriň — ýygnagyň gysgaça teswiri söhbetde paýlaşylar.',
    from: 'Mekdep müdirligi', at: '2026-02-12T07:40', unread: true,
    files: [
      { name: 'Ýygnagyň-meýilnamasy.pdf', size: '240 KB', kind: 'pdf' },
      { name: 'Mekdep-shemasy.png', size: '1.2 MB', kind: 'img' },
    ],
  },
  {
    id: 'n3', kind: 'okuw',
    title: 'III çärýegiň jemleýji seneleri',
    body: 'Jemleýji işler 24.02.2026 – 28.02.2026 aralygynda geçiriler. Dersleriň doly sanawy we günleri synp ýolbaşçysynda.\n\nHer iş sapak wagtynda, öz otagynda geçirilýär. Kesel sebäpli gatnaşmadyk okuwçylar üçin goşmaça gün 02.03.2026-da bellenildi.\n\nÇärýegiň jemi jemleýji işiň netijesi bilen bilelikde çykarylýar.',
    from: 'Okuw bölümi', at: '2026-02-11T16:20', unread: true,
    files: [{ name: 'Jemleýji-işleriň-tertibi.docx', size: '96 KB', kind: 'doc' }],
  },
  {
    id: 'n4', kind: 'mekdep',
    title: 'Mekdep suraty düşülýär',
    body: '13.02.2026-da synp suratlary düşüriler. Ähli okuwçylar mekdep formasynda bolmaly.',
    from: 'Mekdep müdirligi', at: '2026-02-11T09:00', unread: false,
    files: [{ name: 'Nusga-surat.jpg', size: '820 KB', kind: 'img' }],
  },
  {
    id: 'n5', kind: 'çäre',
    title: 'Mekdepara olimpiada açyldy',
    body: 'Matematika we himiýa boýunça birinji tapgyra ýazylyş başlady. Gollanmalar → Bäsleşikler.',
    from: 'Mekdep müdirligi', at: '2026-02-10T12:30', unread: false,
  },
  {
    id: 'n6', kind: 'mekdep',
    title: 'Naharhananyň iş wagty',
    body: 'Remont sebäpli naharhana 16.02.2026-a çenli diňe 2-nji arakesmede işleýär.',
    from: 'Mekdep müdirligi', at: '2026-02-09T11:05', unread: false,
  },
  {
    id: 'n7', kind: 'okuw',
    title: 'Kitaphana täze kitaplar aldy',
    body: 'Matematika we fizika boýunça 120 sany täze okuw kitaby geldi.',
    from: 'Kitaphana', at: '2026-02-06T14:00', unread: false,
  },
];

/* ---------------- chats ---------------- */

export type ChatMsg = {
  id: string; from: 'me' | 'them'; text?: string; at: string;
  /** the sender's name — group threads need it, one-to-one threads do not */
  author?: string;
  file?: ChatFile;
};

export type ChatKind = 'mugallym' | 'synp' | 'ene-ata' | 'goldaw';

export type Chat = {
  id: string; name: string; role: string; initials: string; kind: ChatKind;
  tint: string; ink: string; unread: number;
  online?: boolean;
  thread: ChatMsg[];
};

export const CHATS: Chat[] = [
  {
    id: 'c1', name: 'S. Rejepowa', role: 'Matematika mugallymy', initials: 'SR', kind: 'mugallym',
    tint: tokens.blueTint, ink: tokens.blueText, unread: 2, online: true,
    thread: [
      { id: 'm1', from: 'them', text: 'Salam! Düýnki işiň gowy çykdy, diskriminanty dogry ulanypsyň.', at: '2026-02-12T09:14' },
      { id: 'm2', from: 'me', text: 'Sag boluň! Wiýeta teoremasyny hem gaýtalaýaryn.', at: '2026-02-12T09:16' },
      { id: 'm3', from: 'them', text: 'Ertirki test üçin §12-ni gaýtala.', at: '2026-02-12T09:19' },
      { id: 'm4', from: 'them', file: { name: 'Kwadrat-deňlemeler.pdf', size: '420 KB', kind: 'pdf' }, at: '2026-02-12T09:20' },
    ],
  },
  {
    id: 'c2', name: '8 «B» ene-atalar', role: 'Ene-atalar topary · 22 agza', initials: 'EA', kind: 'ene-ata',
    tint: tokens.orangeTint, ink: tokens.orangeText, unread: 3,
    thread: [
      { id: 'm1', from: 'them', author: 'J. Orazowa', text: 'Salam hormatly ene-atalar! 19.02.2026-da ýygnak geçiriler.', at: '2026-02-11T18:00' },
      { id: 'm2', from: 'them', author: 'A. Kerimowa', text: 'Sagat näçede?', at: '2026-02-11T18:12' },
      { id: 'm3', from: 'them', author: 'J. Orazowa', text: '18:00-da, 24-nji otagda.', at: '2026-02-11T18:15' },
      { id: 'm4', from: 'them', author: 'J. Orazowa', file: { name: 'Ýygnagyň-meýilnamasy.pdf', size: '180 KB', kind: 'pdf' }, at: '2026-02-11T18:16' },
    ],
  },
  {
    id: 'c3', name: '8 «B» synp', role: 'Synp topary · 24 agza', initials: '8B', kind: 'synp',
    tint: tokens.tealTint, ink: tokens.tealText, unread: 0,
    thread: [
      { id: 'm1', from: 'them', author: 'J. Orazowa', text: 'Ertir mekdep suraty düşýäris, form geýmeli.', at: '2026-02-11T17:00' },
      { id: 'm2', from: 'them', author: 'A. Kerim', text: 'Sagat näçede?', at: '2026-02-11T17:04' },
      { id: 'm3', from: 'them', author: 'J. Orazowa', text: 'Ikinji sapakdan soň.', at: '2026-02-11T17:10' },
    ],
  },
  {
    id: 'c4', name: 'A. Gurbanowa', role: 'Iňlis dili mugallymy', initials: 'AG', kind: 'mugallym',
    tint: tokens.purpleTint, ink: tokens.purpleText, unread: 0,
    thread: [
      { id: 'm1', from: 'them', text: 'Present Perfect boýunça gönükmeler taýýar.', at: '2026-02-11T15:02' },
      { id: 'm2', from: 'me', text: 'Düşnükli, taýýarlanaryn.', at: '2026-02-11T15:30' },
      { id: 'm3', from: 'them', text: 'Workbook-y ertir getir.', at: '2026-02-11T15:31' },
    ],
  },
  {
    id: 'c5', name: 'Goldaw gullugy', role: 'Gündelik', initials: 'GG', kind: 'goldaw',
    tint: tokens.surfacePress, ink: tokens.ink2, unread: 0,
    thread: [
      { id: 'm1', from: 'them', text: 'Salam! Programma boýunça sorag bolsa ýazyň — kömek ederis.', at: '2026-02-08T10:00' },
    ],
  },
];

/** The last message of a thread, as the list row wants it. */
export const lastMsg = (c: Chat) => c.thread[c.thread.length - 1];
export const msgPreview = (m: ChatMsg) =>
  (m.text ?? `📎 ${m.file?.name ?? 'Faýl'}`);

/* Every teacher the student can start a conversation with. In production this
   is the class's teacher list from the timetable; a chat may not exist yet, so
   this is deliberately separate from CHATS. */
export type Teacher = { id: string; name: string; subject: string; initials: string; chatId?: string };

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'S. Rejepowa', subject: 'Matematika', initials: 'SR', chatId: 'c1' },
  { id: 't2', name: 'A. Gurbanowa', subject: 'Iňlis dili', initials: 'AG', chatId: 'c4' },
  { id: 't3', name: 'M. Ataýew', subject: 'Himiýa', initials: 'MA' },
  { id: 't4', name: 'K. Hojaýew', subject: 'Fizika', initials: 'KH' },
  { id: 't5', name: 'G. Meredowa', subject: 'Geografiýa', initials: 'GM' },
  { id: 't6', name: 'J. Orazowa', subject: 'Türkmen dili · synp ýolbaşçy', initials: 'JO' },
  { id: 't7', name: 'O. Saparow', subject: 'Taryh', initials: 'OS' },
  { id: 't8', name: 'B. Çaryýew', subject: 'Bedenterbiýe', initials: 'BÇ' },
];

/* ---------------- articles (admin CMS) ---------------- */

export type ArticleCat = 'habar' | 'gollanma' | 'innowasiýa' | 'ene-ata';

export const ARTICLE_CATS: { id: ArticleCat | 'all'; label: string; tint: string; ink: string }[] = [
  { id: 'all', label: 'Ähli', tint: tokens.surface, ink: tokens.ink2 },
  { id: 'habar', label: 'Habarlar', tint: tokens.blueTint, ink: tokens.blueText },
  { id: 'gollanma', label: 'Gollanma', tint: tokens.tealTint, ink: tokens.tealText },
  { id: 'innowasiýa', label: 'Innowasiýa', tint: tokens.purpleTint, ink: tokens.purpleText },
  { id: 'ene-ata', label: 'Ene-atalar', tint: tokens.orangeTint, ink: tokens.orangeText },
];

export const catMeta = (id: ArticleCat) =>
  ARTICLE_CATS.find((c) => c.id === id) ?? ARTICLE_CATS[0];

export type Article = {
  id: string; cat: ArticleCat; title: string; lede: string; author: string;
  date: string; minutes: number;
  body: string[];
  takeaways?: string[];
};

export const ARTICLES: Article[] = [
  {
    id: 'a1', cat: 'habar',
    title: 'Çärýek tamamlanýar: bahalary nädip düzetmeli',
    lede: 'III çärýegiň jemlenmegine iki hepde galdy. Ýetişigiňi ýokarlandyrmak üçin näme etmeli.',
    author: 'Redaksiýa', date: '2026-02-11', minutes: 4,
    body: [
      'Çärýegiň soňky iki hepdesi — bahany düzetmek üçin iň amatly wagt. Mugallymlar bu döwürde goşmaça jogap bermäge we işleri gaýtadan tabşyrmaga köplenç mümkinçilik berýär.',
      'Ilki bilen «Analitika» bölüminden haýsy dersde ortaça bahaň pesdigine seret. Bir ýa-da iki dersi saýlap, ünsi şolara ber — ähli dersi birbada çekmek işlemeýär.',
      'Soňra mugallym bilen habarlaş: haýsy iş üçin baha alyp boljakdygyny anykla. «Söhbetler» bölüminde her mugallym bilen göni ýazyşyp bolýar.',
      'Iň soňunda test we öwrediji kartlar bilen temany berkit. Statistika görkezişi ýaly, hepdede üç gezek 15 minutlyk gaýtalama bir sagatlyk bir gezekleýin taýýarlykdan netijeli.',
    ],
    takeaways: [
      'Bir-iki dersi saýla, hemmesini däl.',
      'Mugallym bilen anyk işi ylalaş.',
      'Gysga, ýygy gaýtalama uzyn oturmadan netijeli.',
    ],
  },
  {
    id: 'a2', cat: 'gollanma',
    title: 'Öý işini 40 minutda gutarmagyň usuly',
    lede: 'Pomodoro usuly mekdep okuwçylary üçin: 25 minut iş, 5 minut arakesme.',
    author: 'M. Ataýew', date: '2026-02-09', minutes: 5,
    body: [
      'Öý işine oturmazdan öň telefony başga otagda goý. Barlaglar görkezýär: ekran görnüp duran ýerde bolsa, ünsi jemlemek wagty iki esse uzalýar.',
      'Işi iki bölege böl: 25 minut arassa iş, 5 minut arakesme. Arakesmede oturgyçdan tur — suw iç, penjireden seret.',
      'Iň kyn dersden başla. Beýni irmänkä çylşyrymly meseläni çözmek aňsat, ýeňil dersleri soňuna goý.',
      'Gutaransoň ertirki sapaklara göz aýlap çyk — bu bary-ýogy iki minut alýar, emma ertesi gün sapakda özüňi ynamly duýarsyň.',
    ],
    takeaways: ['Telefony başga otagda goý.', '25/5 ritmi bilen işle.', 'Iň kyn dersden başla.'],
  },
  {
    id: 'a3', cat: 'innowasiýa',
    title: 'Akylly mugallym sapagy nädip düşündirýär',
    lede: 'Taýýar jogap bermän, ädimme-ädim alyp barýan sorag-jogap usuly.',
    author: 'D. Amanow', date: '2026-02-06', minutes: 6,
    body: [
      'Gündelikdäki Akylly mugallym taýýar jogap bermek üçin däl-de, pikirlenmäge kömek etmek üçin düzüldi. Sorag bereniňde ol ilki näme bilýändigiňi anyklaýar.',
      'Meselem, «diskriminanty düşündir» diýseň, ol formulany ýazmak bilen çäklenmän, parabolanyň ok çyzygyny näçe gezek kesýändigi bilen baglanyşdyryp görkezýär.',
      'Kömekçi her sapagyň mazmunyna bagly işleýär: wideo sapakda wideodan sorag berýär, interaktiw sapakda bolsa nirede ýalňyşandygyňy görkezýär.',
      'Mugallymyň ýerini tutmaýar — ol diňe öý işine oturan wagtyň ýanyňda bolýan kömekçi.',
    ],
  },
  {
    id: 'a4', cat: 'ene-ata',
    title: 'Ene-atalar üçin: çagaň ýetişigini nähili yzarlamaly',
    lede: '«Çagam» bölüminde nämeleri görüp bolýar we haýsy sanlara üns bermeli.',
    author: 'J. Orazowa', date: '2026-02-04', minutes: 4,
    body: [
      '«Çagam» bölüminde bahalar, gatnaşyk we öý işleri bir ekranda jemlenýär. Her gün girmek hökman däl — hepdede bir gezek seretmek ýeterlik.',
      'Iň möhüm görkeziji — ortaça baha däl-de, tendensiýa. Baha 4-den 4.3-e ösýän bolsa, bu 4.8-den 4.6-a düşýän ýagdaýdan has gowudyr.',
      'Ýyldyzlara üns ber: mugallymyň beren ýagşy ýyldyzlary çagaň sapakdaky özüni alyp barşyny bahadan has anyk görkezýär.',
      'Çaga bilen söhbetdeşlikde sanlardan başlama. «Bu hepde näme gyzykly boldy?» diýen sorag «Näme üçin 3 aldyň?» diýen soragdan has köp maglumat berýär.',
    ],
    takeaways: ['Tendensiýa ortaça bahadan möhüm.', 'Ýyldyzlar özüni alyp barşy görkezýär.', 'Söhbeti sanlardan başlama.'],
  },
  {
    id: 'a5', cat: 'habar',
    title: 'Mekdepara olimpiada: 312 mekdep gatnaşýar',
    lede: 'Fewral aýynda matematika we himiýa boýunça iki tapgyr geçiriler.',
    author: 'Redaksiýa', date: '2026-02-02', minutes: 3,
    body: [
      'Şu ýyl mekdepara olimpiada 312 mekdepden gatnaşyjy ýygnady — geçen ýyl bilen deňeşdirilende iki esse köp.',
      'Birinji tapgyr programmanyň içinde onlaýn geçýär, ikinji tapgyr welaýat merkezlerinde bolar.',
      'Gatnaşmak üçin «Gollanmalar → Bäsleşikler» bölüminden ýazylmak ýeterlik. Ýeňijiler ballar we sertifikat alýar.',
    ],
  },
  {
    id: 'a6', cat: 'gollanma',
    title: 'Test tabşyranyňda ýygy goýberilýän 5 ýalňyş',
    lede: 'Wagt paýlaşdyrmak, sorag okamak we barlag boýunça gysga gollanma.',
    author: 'S. Rejepowa', date: '2026-01-30', minutes: 5,
    body: [
      'Birinji ýalňyş — soragy soňuna çenli okaman jogap saýlamak. Sowallaryň üçden birinde şert soňky sözlemde berilýär.',
      'Ikinji — bir soragda uzak eglenmek. Iki minutdan köp wagt alýan bolsa, belläp geç we soňuna galdyr.',
      'Üçünji — hasaby kelläňde etmek. Kagyz ulanmaga rugsat berlen ýerde hökman ulan.',
      'Dördünji — jogaby barlamazlyk. Galan wagtyň soňky bäş minudyny diňe barlaga goý.',
      'Bäşinji — öňki testleriň netijesine seretmezlik. Her testiň sahypasynda öňki synanyşyklaryň saklanýar; ýalňyşlaryň gaýtalanýan ýerini şol ýerden görüp bolýar.',
    ],
    takeaways: ['Soragy soňuna çenli oka.', 'Bir soraga 2 minutdan köp berme.', 'Soňky 5 minudy barlaga goý.'],
  },
];

/* the count on the Gündelik header bell */
export const inboxUnread = () =>
  NOTIFS.filter((n) => n.unread).length + CHATS.reduce((s, c) => s + c.unread, 0);
