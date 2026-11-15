export interface ModuleKeyFact {
  label: string;
  value: string;
}

export interface ModuleMiniQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleSection {
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  estimatedMinutes: number;
  kbcPillar: string;
  kbcNote: string;
  image?: {
    src: string;
    alt: string;
    caption: string;
  };
  paragraphs: string[];
  keyFacts: ModuleKeyFact[];
  callout: {
    title: string;
    body: string;
  };
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  miniQuiz: ModuleMiniQuiz;
}

export interface EssayQuestion {
  number: 1 | 2 | 3 | 4 | 5;
  field: "answer1" | "answer2" | "answer3" | "answer4" | "answer5";
  scoreField: "score1" | "score2" | "score3" | "score4" | "score5";
  question: string;
  hint: string;
  rubric: string;
  maxScore: number;
}

export const MODULE_META = {
  title: "Hijrahnya Para Sahabat ke Habasyah",
  subject: "Sejarah Kebudayaan Islam (SKI)",
  grade: "Kelas 4 — Semester 1",
  school: "MI Sirojul Huda",
  curriculum: "Kurikulum Merdeka • KBC (Kurikulum Berbasis Cinta)",
  author: "Andrian Dwi Pranata, S.Pd",
  academicYear: "Semester Ganjil",
  capaianPembelajaran:
    "Peserta didik mampu memahami peristiwa Hijrah para sahabat ke Habasyah sebagai bagian dari dakwah Rasulullah SAW periode Makkah, meneladani keteguhan iman, kesabaran, dan toleransi, serta mengamalkan nilai-nilai Kurikulum Berbasis Cinta dalam kehidupan sehari-hari.",
  tujuanPembelajaran: [
    "Menjelaskan sebab-sebab terjadinya hijrah para sahabat Nabi Muhammad SAW ke negeri Habasyah.",
    "Mengenal negeri Habasyah dan sifat kepemimpinan Raja Najasyi yang adil dan penyayang.",
    "Membedakan peristiwa hijrah ke Habasyah gelombang pertama dan gelombang kedua beserta tokohnya.",
    "Menceritakan keteguhan iman Ja'far bin Abi Thalib dan para sahabat di hadapan Raja Najasyi.",
    "Meneladani hikmah kesabaran, cinta kepada Allah dan Rasul-Nya, serta sikap saling menghormati antarumat beragama.",
  ],
};

export const MODULE_SECTIONS: ModuleSection[] = [
  {
    slug: "bagian-1",
    number: 1,
    title: "Mengapa Para Sahabat Berhijrah ke Habasyah?",
    shortTitle: "Sebab Hijrah",
    subtitle: "Awal ujian dakwah di Makkah dan kasih sayang Rasulullah SAW kepada umatnya",
    estimatedMinutes: 4,
    kbcPillar: "Cinta kepada Allah & Rasul-Nya",
    kbcNote:
      "Para sahabat rela meninggalkan rumah dan kampung halaman demi menjaga kecintaan serta keimanan kepada Allah SWT.",
    paragraphs: [
      "Assalamu'alaikum anak-anak hebat kelas 4 MI Sirojul Huda! Pada modul kali ini, kita akan belajar kisah sejarah Islam yang sangat mengharukan dan penuh keteladanan, yaitu Hijrahnya Para Sahabat ke Habasyah.",
      "Kata hijrah menurut bahasa artinya berpindah dari satu tempat ke tempat lain. Dalam sejarah Islam, hijrah berarti berpindah menuju tempat yang lebih aman demi menyelamatkan akidah dan dapat beribadah kepada Allah SWT dengan tenang.",
      "Ketika Nabi Muhammad SAW mulai berdakwah secara terang-terangan di kota Makkah, semakin banyak orang yang memeluk agama Islam. Namun, para pemimpin kafir Quraisy merasa terancam dan tidak menyukai ajaran Islam yang membawa keadilan serta kasih sayang.",
      "Akibatnya, kaum kafir Quraisy melakukan berbagai penindasan, ejekan, pemboikotan, bahkan penyiksaan yang kejam kepada kaum muslimin, terutama kepada para sahabat yang lemah dan tidak memiliki pelindung dari suku besar di Makkah.",
      "Melihat penderitaan para sahabat yang semakin berat, Rasulullah SAW merasa sangat sedih dan penuh kasih sayang. Pada tahun ke-5 kenabian, tepatnya tahun 615 Masehi, Rasulullah SAW memerintahkan sebagian sahabat untuk berhijrah ke negeri Habasyah agar iman dan keselamatan jiwa mereka terjaga.",
    ],
    keyFacts: [
      { label: "Arti Hijrah", value: "Berpindah ke tempat aman demi menjaga iman" },
      { label: "Waktu Peristiwa", value: "Tahun ke-5 Kenabian (615 Masehi)" },
      { label: "Sebab Utama", value: "Siksaan dan tekanan berat dari kafir Quraisy" },
    ],
    callout: {
      title: "Tahukah Kamu? (Nilai Cinta KBC)",
      body: "Perintah hijrah menunjukkan betapa besar cinta Rasulullah SAW kepada para sahabatnya. Beliau tetap tinggal di Makkah menghadapi rintangan sambil memastikan para pengikutnya dapat beribadah dengan aman dan damai.",
    },
    miniQuiz: {
      question: "Apa alasan utama Rasulullah SAW memerintahkan sebagian sahabat berhijrah ke Habasyah?",
      options: [
        "Untuk berdagang dan mencari kekayaan di luar negeri",
        "Untuk menyelamatkan iman dan keselamatan diri dari siksaan kaum kafir Quraisy",
        "Untuk membuka jalur wisata melewati Laut Merah",
      ],
      correctIndex: 1,
      explanation:
        "Benar sekali! Rasulullah SAW memerintahkan hijrah ke Habasyah agar keselamatan jiwa dan keimanan kaum muslimin terlindungi dari penyiksaan kaum kafir Quraisy di Makkah.",
    },
  },
  {
    slug: "bagian-2",
    number: 2,
    title: "Negeri Habasyah dan Raja Najasyi yang Adil",
    shortTitle: "Negeri Habasyah",
    subtitle: "Menyeberangi Laut Merah menuju negeri penuh kedamaian di Benua Afrika",
    estimatedMinutes: 5,
    kbcPillar: "Cinta Sesama & Toleransi",
    kbcNote:
      "Keadilan dan kasih sayang dapat tumbuh di antara manusia walaupun berbeda agama dan bangsa.",
    image: {
      src: "/images/peta-hijrah.png",
      alt: "Ilustrasi Peta Perjalanan Hijrah dari Makkah melintasi Laut Merah menuju Negeri Habasyah",
      caption:
        "Ilustrasi rute perjalanan hijrah para sahabat dari Makkah menuju Pelabuhan Syu'aibah, menyeberangi Laut Merah hingga tiba di Negeri Habasyah (Ethiopia).",
    },
    paragraphs: [
      "Mengapa Rasulullah SAW memilih negeri Habasyah sebagai tujuan hijrah pertama umat Islam? Habasyah adalah sebuah kerajaan kuno yang terletak di kawasan Afrika Timur. Saat ini, wilayah negeri Habasyah dikenal sebagai negara Ethiopia.",
      "Untuk mencapai Habasyah, para sahabat berjalan kaki secara diam-diam dari Makkah menuju Pelabuhan Syu'aibah di tepi pantai. Dari sana, mereka menaiki perahu layar menyeberangi Laut Merah hingga berlabuh di tanah Habasyah yang sejuk dan subur.",
      "Negeri Habasyah saat itu dipimpin oleh seorang raja beragama Nasrani yang bernama Ashhamah bin Abjar, yang lebih dikenal dengan gelar Raja Najasyi. Meskipun berbeda agama dengan kaum muslimin, Raja Najasyi sangat terkenal dengan kebijaksanaan dan keadilannya.",
      "Rasulullah SAW bersabda kepada para sahabat bahwa di negeri Habasyah terdapat seorang raja yang tidak ada seorang pun boleh dizalimi di sisinya. Negeri itu disebut sebagai bumi kejujuran, sampai Allah memberikan jalan keluar bagi kaum muslimin.",
      "Selain karena pemimpinnya yang adil dan jujur, letak Habasyah juga cukup jauh dari jangkauan kekuasaan kafir Quraisy di Makkah. Dengan demikian, kaum muslimin dapat hidup damai, saling membantu, dan beribadah dengan tenteram.",
    ],
    keyFacts: [
      { label: "Nama Modern Habasyah", value: "Ethiopia (Afrika Timur)" },
      { label: "Nama Raja", value: "Raja Najasyi (Ashhamah bin Abjar)" },
      { label: "Sifat Utama Raja", value: "Adil, jujur, bijaksana, dan tidak menzalimi rakyat" },
    ],
    callout: {
      title: "Pesan Toleransi KBC",
      body: "Kisah Raja Najasyi mengajarkan kita bahwa kebaikan, kejujuran, dan keadilan harus selalu dihormati. Kita wajib menjaga sikap ramah dan rukun dengan semua sesama manusia.",
    },
    miniQuiz: {
      question: "Negeri Habasyah pada masa sekarang terletak di negara mana?",
      options: ["Mesir", "Ethiopia", "Turki"],
      correctIndex: 1,
      explanation:
        "Tepat! Negeri Habasyah atau Abyssinia terletak di kawasan Afrika Timur yang kini menjadi negara Ethiopia.",
    },
  },
  {
    slug: "bagian-3",
    number: 3,
    title: "Hijrah Gelombang Pertama dan Gelombang Kedua",
    shortTitle: "Dua Gelombang",
    subtitle: "Keberanian para sahabat menempuh perjalanan rahasia demi mempertahankan akidah",
    estimatedMinutes: 5,
    kbcPillar: "Cinta Ilmu & Keteguhan Hati",
    kbcNote:
      "Mengenal sejarah dua gelombang hijrah melatih kita menghargai perjuangan dan pengorbanan para sahabat Nabi.",
    paragraphs: [
      "Peristiwa hijrahnya para sahabat ke negeri Habasyah terjadi sebanyak dua kali, yaitu Hijrah Gelombang Pertama dan Hijrah Gelombang Kedua. Keduanya dilakukan dengan penuh kehati-hatian agar tidak dihadang kaum kafir Quraisy.",
      "Hijrah Gelombang Pertama terjadi pada bulan Rajab tahun ke-5 kenabian (615 Masehi). Rombongan ini dipimpin oleh sahabat mulia Utsman bin Affan bersama istrinya, Sayyidah Ruqayyah yang merupakan putri tercinta Rasulullah SAW. Jumlah rombongan pertama ini sekitar 11 sampai 12 laki-laki dan 4 perempuan, termasuk Zubair bin Awwam, Abdurrahman bin Auf, dan Abu Hudzaifah.",
      "Di Habasyah, rombongan pertama disambut dengan hangat dan aman oleh Raja Najasyi. Namun, beberapa waktu kemudian tersebar berita keliru di Makkah bahwa seluruh penduduk Makkah telah masuk Islam. Sebagian sahabat pun pulang ke Makkah, tetapi ternyata siksaan kaum Quraisy justru semakin keras.",
      "Oleh karena itu, Rasulullah SAW kembali mengizinkan para sahabat berangkat dalam Hijrah Gelombang Kedua pada tahun ke-6 kenabian. Rombongan kedua ini jauh lebih besar dan dipimpin oleh sepupu Nabi yang cerdas serta fasih berbicara, yaitu Ja'far bin Abi Thalib.",
      "Jumlah kaum muslimin dalam Hijrah Gelombang Kedua mencapai sekitar 83 orang laki-laki dan 18 sampai 19 orang perempuan. Mereka menetap cukup lama di Habasyah dengan aman hingga kelak menyusul Rasulullah SAW ke Madinah.",
    ],
    keyFacts: [
      { label: "Pemimpin Gelombang I", value: "Utsman bin Affan & Ruqayyah binti Muhammad SAW" },
      { label: "Jumlah Gelombang I", value: "± 11–12 laki-laki & 4 perempuan (Rajab, Th. 5 Kenabian)" },
      { label: "Pemimpin Gelombang II", value: "Ja'far bin Abi Thalib" },
      { label: "Jumlah Gelombang II", value: "± 83 laki-laki & 18–19 perempuan" },
    ],
    comparisonTable: {
      headers: ["Aspek Perbandingan", "Hijrah Gelombang Pertama", "Hijrah Gelombang Kedua"],
      rows: [
        ["Waktu Pelaksanaan", "Bulan Rajab, Tahun ke-5 Kenabian (615 M)", "Tahun ke-6 Kenabian (± 616 M)"],
        ["Tokoh Pemimpin", "Utsman bin Affan (bersama Ruqayyah)", "Ja'far bin Abi Thalib"],
        ["Jumlah Rombongan", "± 11–12 laki-laki dan 4 perempuan", "± 83 laki-laki dan 18–19 perempuan"],
        ["Suasana Perjalanan", "Diam-diam di malam hari lewat Pelabuhan Syu'aibah", "Rombongan besar karena siksaan Quraisy makin berat"],
      ],
    },
    callout: {
      title: "Fakta Sejarah Penting",
      body: "Keluarga Utsman bin Affan dan Ruqayyah adalah keluarga pertama yang berhijrah di jalan Allah setelah Nabi Luth AS. Mereka rela meninggalkan harta benda yang melimpah demi membela agama Allah.",
    },
    miniQuiz: {
      question: "Siapakah sahabat yang memimpin rombongan Hijrah ke Habasyah Gelombang Kedua?",
      options: [
        "Abu Lahab",
        "Ja'far bin Abi Thalib",
        "Amr bin Ash",
      ],
      correctIndex: 1,
      explanation:
        "Hebat! Hijrah Gelombang Kedua dipimpin oleh Ja'far bin Abi Thalib yang sangat berani, cerdas, dan santun.",
    },
  },
  {
    slug: "bagian-4",
    number: 4,
    title: "Keteguhan Iman di Istana Raja Najasyi",
    shortTitle: "Di Istana Najasyi",
    subtitle: "Pidato penuh hikmah Ja'far bin Abi Thalib dan lantunan indah Surah Maryam",
    estimatedMinutes: 5,
    kbcPillar: "Cinta Kebenaran & Kejujuran",
    kbcNote:
      "Berbicara jujur, santun, dan penuh keyakinan akan membuka pintu hati orang lain untuk mencintai kebenaran.",
    image: {
      src: "/images/istana-najasyi.png",
      alt: "Ilustrasi Istana Raja Najasyi di Habasyah yang megah, teduh, dan penuh kedamaian",
      caption:
        "Ilustrasi suasana Istana Raja Najasyi di Habasyah, tempat berlangsungnya dialog penuh kejujuran dan keadilan antara Ja'far bin Abi Thalib dengan Raja Najasyi.",
    },
    paragraphs: [
      "Kaum kafir Quraisy merasa sangat marah mendengar kaum muslimin hidup tenang di Habasyah. Mereka mengutus dua orang yang pandai berdiplomasi, yaitu Amr bin Ash dan Abdullah bin Abi Rabi'ah, dengan membawa hadiah-hadiah mewah dari Makkah untuk para pejabat istana dan Raja Najasyi.",
      "Di hadapan Raja Najasyi, utusan Quraisy memfitnah kaum muslimin sebagai orang-orang yang membangkang dan meminta agar mereka segera dipulangkan ke Makkah. Namun, sebagai raja yang adil, Raja Najasyi tidak langsung percaya begitu saja. Ia memanggil kaum muslimin agar dapat mendengar penjelasan dari kedua belah pihak.",
      "Ja'far bin Abi Thalib maju mewakili umat Islam dengan sikap tenang, sopan, dan gagah berani. Ia menjelaskan bahwa dahulu bangsa Arab hidup dalam zaman jahiliyah yang penuh keburukan: menyembah berhala, menindas orang lemah, dan memutus silaturahmi.",
      "Kemudian Allah mengutus seorang rasul yang jujur dan terpercaya, yaitu Nabi Muhammad SAW, yang mengajarkan menyembah Allah Yang Maha Esa, berkata jujur, menunaikan amanah, menyambung tali persaudaraan, dan berbuat baik kepada tetangga.",
      "Ketika Raja Najasyi meminta Ja'far membacakan ayat Al-Qur'an tentang Nabi Isa AS dan ibunya, Ja'far membacakan awal Surah Maryam dengan suara merdu dan khusyuk. Air mata Raja Najasyi menetes karena terharu mendengar kebenaran wahyu tersebut. Akhirnya, Raja Najasyi menolak permintaan utusan Quraisy, mengembalikan hadiah mereka, dan menjamin keamanan kaum muslimin di Habasyah.",
    ],
    keyFacts: [
      { label: "Utusan Kafir Quraisy", value: "Amr bin Ash & Abdullah bin Abi Rabi'ah" },
      { label: "Juru Bicara Muslim", value: "Ja'far bin Abi Thalib" },
      { label: "Surah yang Dibaca", value: "Surah Maryam (ayat-ayat awal)" },
      { label: "Keputusan Raja", value: "Melindungi kaum muslimin & menolak hadiah Quraisy" },
    ],
    callout: {
      title: "Teladan Komunikasi Santun",
      body: "Ja'far bin Abi Thalib tidak membalas fitnah dengan amarah. Ia menjawab dengan kejujuran, budi pekerti yang lembut, dan ayat Al-Qur'an yang menyentuh hati. Itulah kekuatan dakwah yang penuh kasih sayang!",
    },
    miniQuiz: {
      question: "Surah Al-Qur'an apakah yang dibacakan Ja'far bin Abi Thalib di hadapan Raja Najasyi hingga beliau meneteskan air mata?",
      options: ["Surah Al-Lahab", "Surah Maryam", "Surah Al-Fiil"],
      correctIndex: 1,
      explanation:
        "MasyaAllah, tepat sekali! Ja'far bin Abi Thalib membacakan ayat-ayat awal Surah Maryam yang mengisahkan kemuliaan Maryam dan Nabi Isa AS.",
    },
  },
  {
    slug: "bagian-5",
    number: 5,
    title: "Hikmah, Keteladanan & Nilai Kurikulum Berbasis Cinta (KBC)",
    shortTitle: "Hikmah & KBC",
    subtitle: "Mengamalkan keteguhan iman, kesabaran, dan kasih sayang di MI Sirojul Huda",
    estimatedMinutes: 4,
    kbcPillar: "Panca Cinta Madrasah (KBC)",
    kbcNote:
      "Belajar sejarah Islam menumbuhkan cinta kepada Allah & Rasul, cinta ilmu, cinta diri & sesama, cinta lingkungan, dan cinta tanah air.",
    paragraphs: [
      "Anak-anak kelas 4 MI Sirojul Huda yang saleh dan salehah, kisah Hijrahnya Para Sahabat ke Habasyah bukan sekadar cerita masa lalu, melainkan pelita hidup yang kaya dengan hikmah untuk kita amalkan hari ini.",
      "Hikmah pertama adalah keteguhan iman dan kesabaran. Para sahabat tetap taat beribadah kepada Allah SWT meski menghadapi ujian yang berat. Sebagai pelajar madrasah, kita dapat meneladaninya dengan rajin salat lima waktu, semangat mengaji, dan pantang menyerah saat belajar.",
      "Hikmah kedua adalah sikap jujur dan berani menyampaikan kebenaran dengan cara yang santun, seperti teladan Ja'far bin Abi Thalib. Di sekolah maupun di rumah, kita harus selalu berkata jujur kepada guru, orang tua, dan teman.",
      "Hikmah ketiga adalah semangat toleransi, persaudaraan, dan keadilan. Raja Najasyi yang adil melindungi kaum muslimin meski berbeda keyakinan. Dalam Kurikulum Berbasis Cinta (KBC), ini mencerminkan nilai Cinta kepada Sesama Manusia — saling menghormati, tidak mengejek teman, dan suka menolong siapa saja yang membutuhkan.",
      "Hikmah keempat adalah cinta kepada ilmu dan tanah air yang damai. Setelah menyelesaikan kelima bagian materi ini, kamu siap mengerjakan Ulangan Harian (5 Soal Uraian) di bagian akhir modul dengan jujur dan sungguh-sungguh. Bismillah, kamu pasti bisa!",
    ],
    keyFacts: [
      { label: "Keteladanan 1", value: "Teguh iman, sabar, dan ikhlas berkorban" },
      { label: "Keteladanan 2", value: "Jujur, santun, dan berani membela kebenaran" },
      { label: "Keteladanan 3", value: "Adil, toleran, dan saling melindungi sesama" },
      { label: "Semangat KBC", value: "Belajar dengan hati penuh cinta & akhlakul karimah" },
    ],
    callout: {
      title: "Refleksi Panca Cinta untuk Siswa Kelas 4",
      body: "Yuk praktikkan hari ini! Sapa guru dan temanmu dengan senyum ramah, dengarkan penjelasan dengan sungguh-sungguh, dan kerjakan Ulangan Harian secara mandiri dengan jujur sebagai bukti cinta kepada Allah SWT.",
    },
    miniQuiz: {
      question: "Manakah contoh pengamalan hikmah Hijrah ke Habasyah dan nilai KBC di lingkungan madrasah?",
      options: [
        "Memilih-milih teman dan tidak mau membantu teman yang kesulitan",
        "Bersikap jujur, sabar saat belajar, serta menghormati guru dan seluruh teman",
        "Menyontek saat ulangan harian agar cepat selesai",
      ],
      correctIndex: 1,
      explanation:
        "Alhamdulillah, benar sekali! Bersikap jujur, sabar belajar, dan menghormati sesama adalah wujud nyata keteladanan para sahabat dan semangat Kurikulum Berbasis Cinta.",
    },
  },
];

export const ULANGAN_QUESTIONS: EssayQuestion[] = [
  {
    number: 1,
    field: "answer1",
    scoreField: "score1",
    question:
      "Jelaskan alasan utama mengapa Rasulullah SAW memerintahkan sebagian sahabat untuk berhijrah ke negeri Habasyah!",
    hint: "Ingat kembali kondisi kaum muslimin di Makkah pada tahun ke-5 kenabian saat menghadapi kaum kafir Quraisy.",
    rubric:
      "Jawaban ideal: Karena kaum kafir Quraisy melakukan penindasan, tekanan, dan penyiksaan yang berat terhadap kaum muslimin di Makkah, sehingga Rasulullah SAW memerintahkan hijrah agar akidah/iman dan keselamatan jiwa para sahabat terjaga serta dapat beribadah dengan aman. (Skor maks 20)",
    maxScore: 20,
  },
  {
    number: 2,
    field: "answer2",
    scoreField: "score2",
    question:
      "Mengapa Rasulullah SAW memilih negeri Habasyah sebagai tujuan hijrah, dan bagaimana sifat Raja Najasyi yang memimpin negeri tersebut?",
    hint: "Ceritakan sifat kepemimpinan Raja Najasyi dan kondisi keamanan negeri Habasyah (Ethiopia).",
    rubric:
      "Jawaban ideal: Karena negeri Habasyah dipimpin oleh Raja Najasyi yang sangat adil, jujur, bijaksana, dan tidak membiarkan seorang pun dizalimi di negerinya, serta letaknya aman/jauh dari jangkauan gangguan kafir Quraisy. (Skor maks 20)",
    maxScore: 20,
  },
  {
    number: 3,
    field: "answer3",
    scoreField: "score3",
    question:
      "Sebutkan perbedaan penting antara Hijrah ke Habasyah gelombang pertama dan gelombang kedua (sebutkan tokoh pemimpin dan perkiraan jumlah sahabatnya)!",
    hint: "Bandingkan pemimpin dan jumlah rombongan Gelombang I dan Gelombang II.",
    rubric:
      "Jawaban ideal: Gelombang pertama (tahun ke-5 kenabian) dipimpin Utsman bin Affan (bersama Ruqayyah) berjumlah ±11–12 laki-laki dan 4 perempuan. Gelombang kedua (tahun ke-6 kenabian) dipimpin Ja'far bin Abi Thalib dengan rombongan jauh lebih besar yaitu ±83 laki-laki dan 18–19 perempuan. (Skor maks 20)",
    maxScore: 20,
  },
  {
    number: 4,
    field: "answer4",
    scoreField: "score4",
    question:
      "Ceritakan secara singkat bagaimana sikap Ja'far bin Abi Thalib di hadapan Raja Najasyi saat utusan kafir Quraisy berusaha memulangkan kaum muslimin ke Makkah!",
    hint: "Ingat bagaimana Ja'far berbicara tentang ajaran Islam dan surah apa yang ia bacakan di istana.",
    rubric:
      "Jawaban ideal: Ja'far bin Abi Thalib bersikap tenang, berani, jujur, dan santun. Ia menjelaskan kebaikan ajaran Islam yang dibawa Rasulullah SAW serta membacakan awal Surah Maryam sehingga Raja Najasyi terharu, menolak utusan Quraisy, dan melindungi kaum muslimin. (Skor maks 20)",
    maxScore: 20,
  },
  {
    number: 5,
    field: "answer5",
    scoreField: "score5",
    question:
      "Menurut pendapatmu, nilai keteladanan dan nilai cinta (Kurikulum Berbasis Cinta) apa saja yang dapat kita praktikkan di sekolah dan di rumah dari kisah Hijrah para sahabat ke Habasyah?",
    hint: "Tuliskan minimal 2 contoh sikap baik yang bisa kamu lakukan sehari-hari sebagai siswa MI Sirojul Huda.",
    rubric:
      "Jawaban ideal: Mencakup minimal 2 nilai keteladanan/KBC seperti sabar dan teguh beribadah (cinta Allah & Rasul), berkata jujur dan santun, menghormati sesama/toleransi, saling tolong-menolong, serta bersungguh-sungguh dalam belajar. (Skor maks 20)",
    maxScore: 20,
  },
];

export const CLASS_OPTIONS = ["Kelas 4A", "Kelas 4B", "Kelas 4C", "Kelas 4"];
