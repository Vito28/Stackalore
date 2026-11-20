# Spesifikasi: Visualisasi Interaktif Algoritma & Struktur Data

Status: rancangan disetujui (2026-11-19). Sudah dibuat: Stack, semua struktur data di *Perluasan cakupan*, kelompok **Rekursi** (2026-11-20), **searching dan sorting**, serta **flood fill, labirin BFS, dan memoisasi** (semuanya 2026-11-20). Berikutnya (opsional): representasi graph, lalu pointer/memori dan perulangan bersarang.

Dokumen ini merangkum keputusan dari sesi tanya-jawab rancangan (Q1–Q24, 2026-11-19).

---

## Masalah (Problem Statement)

Pembaca Stacklore adalah pemula yang belajar dasar pemrograman, struktur data, dan algoritma dalam bahasa Indonesia. Banyak materi menjelaskan **proses yang berubah dari waktu ke waktu**: isi stack setelah push dan pop, batas `lo`/`mid`/`hi` pada binary search, pembagian dan penggabungan pada merge sort, urutan kunjungan DFS dan BFS. Saat ini proses itu hanya digambarkan dengan teks, tabel trace, dan diagram ASCII yang statis.

Akibatnya:

- Pembaca harus membayangkan sendiri perubahan keadaan di antara dua baris tabel, dan pemula sering kehilangan jejak di langkah ketiga atau keempat.
- Pembaca tidak bisa mencoba data lain, misalnya target yang tidak ada di array atau pop pada stack kosong, untuk melihat apa yang terjadi.
- Hubungan antara langkah algoritma dan baris kode atau pseudocode-nya tidak terlihat.
- Banyak pembaca membuka materi dari HP, sehingga diagram lebar sulit dibaca.

## Solusi (Solution)

Sistem visualisasi **langkah demi langkah** yang bisa dipakai ulang. Visualisasi disisipkan di dalam materi, tepat setelah penjelasan konsepnya. Isinya:

- Stepper dengan tombol **Putar, Jeda, Sebelumnya, Berikutnya, Reset**, pilihan kecepatan, dan satu **kalimat penjelasan berbahasa Indonesia** di setiap langkah. Kalimat itu memuat ekspresi kode yang relevan, misalnya `mid = (0 + 9) / 2 = 4`.
- **Panel pseudocode** singkat berbahasa Indonesia yang barisnya menyala sesuai langkah. Pseudocode dipakai karena berlaku untuk C++ maupun Python.
- **Data awal sama persis dengan contoh di materi**, dan pembaca bisa menggantinya atau mengacaknya dalam batas ukuran yang tetap terbaca di HP.
- Warna yang **seragam** di semua visualisasi, disertai keterangan warna.
- Nyaman di HP, bisa dipakai lewat keyboard, ramah screen reader, dan menghormati pengaturan *reduced motion*.
- Tetap bermakna tanpa JavaScript: keadaan awal sudah tergambar, dan daftar semua langkah tersedia dalam bentuk teks.

Pengerjaannya bertahap:

1. **Prototipe Stack** (push/pop/top/size). Prototipe ini sekaligus membangun fondasi yang dipakai ulang: logika langkah, pengendali, tampilan, dan pengujian.
2. Setelah prototipe disetujui, materi lain dikerjakan **per kelompok** (lihat *Further Notes*). Setiap kelompok selesai dan diuji sebelum lanjut ke kelompok berikutnya.

---

## User Stories

### Pembaca (pemula)

1. Sebagai pembaca pemula, saya ingin melihat isi stack berubah satu langkah setiap kali saya menekan Berikutnya, supaya saya mengerti apa yang dilakukan setiap `push` dan `pop`.
2. Sebagai pembaca, saya ingin kembali ke langkah sebelumnya, supaya saya bisa mengulang bagian yang membingungkan tanpa memulai dari awal.
3. Sebagai pembaca, saya ingin menekan Putar dan melihat langkah berjalan sendiri, supaya saya bisa mengamati keseluruhan proses tanpa menekan tombol terus-menerus.
4. Sebagai pembaca, saya ingin menjeda pemutaran otomatis kapan saja, supaya saya bisa berhenti di langkah yang ingin saya pelajari.
5. Sebagai pembaca, saya ingin pemutaran otomatis berhenti sendiri di langkah terakhir, supaya visualisasi tidak berulang tanpa akhir.
6. Sebagai pembaca, saya ingin tombol Reset yang membawa saya kembali ke langkah pertama, supaya saya bisa mengulang dari awal dengan cepat.
7. Sebagai pembaca, saya ingin memilih kecepatan 0,5×, 1×, atau 2×, supaya temponya sesuai kecepatan saya membaca.
8. Sebagai pembaca, saya ingin pilihan kecepatan saya diingat, supaya saya tidak perlu mengaturnya lagi di setiap visualisasi.
9. Sebagai pembaca, saya ingin setiap langkah punya satu kalimat penjelasan dalam bahasa Indonesia, supaya saya tahu *mengapa* keadaan berubah, bukan hanya *apa* yang berubah.
10. Sebagai pembaca, saya ingin kalimat penjelasan memuat ekspresi kode yang sedang dijalankan, misalnya `top ← 5`, supaya saya bisa menghubungkan gambar dengan kode di materi.
11. Sebagai pembaca, saya ingin melihat baris pseudocode yang sedang dijalankan menyala, supaya saya tahu bagian algoritma mana yang sedang bekerja.
12. Sebagai pembaca, saya ingin visualisasi dimulai dengan data yang sama seperti contoh di materi, supaya yang saya lihat cocok dengan teks dan tabel trace di atasnya.
13. Sebagai pembaca, saya ingin mengganti data sendiri, misalnya menyusun urutan push dan pop saya sendiri, supaya saya bisa bereksperimen.
14. Sebagai pembaca, saya ingin tombol untuk mengembalikan data ke contoh materi, supaya saya tidak tersesat setelah bereksperimen.
15. Sebagai pembaca, saya ingin diberi tahu dengan jelas kalau data yang saya masukkan tidak valid, misalnya bukan angka atau terlalu banyak, supaya saya tahu cara memperbaikinya.
16. Sebagai pembaca, saya ingin melihat dengan jelas apa yang terjadi kalau saya melakukan `pop` atau `top` pada stack kosong, supaya saya paham kenapa harus memeriksa `empty()` lebih dulu.
17. Sebagai pembaca, saya ingin langkah error ditandai merah dan dijelaskan, supaya saya tahu bahwa di C++ itu perilaku tak terdefinisi dan di Python muncul `IndexError`.
18. Sebagai pembaca, saya ingin melihat nilai hasil operasi seperti `top → 5`, `pop → 5`, atau `size → 2`, supaya saya tahu apa yang dikembalikan setiap operasi.
19. Sebagai pembaca, saya ingin elemen teratas stack ditandai `top`, supaya prinsip LIFO terlihat jelas.
20. Sebagai pembaca, saya ingin elemen baru terlihat masuk dari atas dan elemen yang di-pop terlihat keluar, supaya gerakannya menegaskan konsep "terakhir masuk, pertama keluar".
21. Sebagai pembaca, saya ingin arti warna selalu sama di semua materi, dengan keterangan warna di setiap visualisasi, supaya saya cukup belajar artinya sekali.
22. Sebagai pembaca, saya ingin animasi yang halus dan modern tapi tidak berlebihan, supaya visualisasinya enak dilihat tanpa mengalihkan perhatian dari konsep.

### Pembaca di HP

23. Sebagai pembaca di HP, saya ingin visualisasi muat di layar tanpa menggulir ke samping, supaya saya tidak perlu memperbesar dan menggeser halaman.
24. Sebagai pembaca di HP, saya ingin tombol yang cukup besar untuk jari, supaya saya tidak salah tekan.
25. Sebagai pembaca di HP, saya ingin panel pseudocode bisa dilipat di bawah visualisasi, supaya layar kecil tidak penuh.
26. Sebagai pembaca di HP, saya ingin visualisasi tidak membuat halaman berat atau tersendat, supaya materi tetap nyaman dibaca di HP dengan RAM kecil.

### Pembaca dengan kebutuhan aksesibilitas

27. Sebagai pengguna keyboard, saya ingin memakai `←`/`→` untuk pindah langkah, `Spasi` untuk putar/jeda, dan `Home` untuk reset saat visualisasi difokus, supaya saya tidak perlu mouse.
28. Sebagai pengguna keyboard, saya ingin semua tombol bisa dicapai dengan `Tab` dan terlihat jelas saat difokus, supaya saya tahu posisi saya.
29. Sebagai pengguna keyboard, saya ingin pintasan hanya aktif saat visualisasi difokus, supaya tombol panah tetap bisa dipakai untuk menggulir halaman.
30. Sebagai pengguna screen reader, saya ingin kalimat penjelasan setiap langkah dibacakan saat langkah berganti, supaya saya bisa mengikuti proses tanpa melihat gambar.
31. Sebagai pengguna screen reader, saya ingin setiap tombol punya label yang jelas dalam bahasa Indonesia, supaya saya tahu fungsinya.
32. Sebagai pembaca buta warna, saya ingin penanda penting juga berupa teks atau ikon (`top`, ✓, ✗), bukan warna saja, supaya informasinya tidak hilang.
33. Sebagai pembaca yang mengaktifkan "kurangi gerakan", saya ingin keadaan berganti langsung tanpa animasi geser, sementara sorotan warna dan penjelasan tetap ada, supaya saya tidak pusing.
34. Sebagai pembaca yang JavaScript-nya gagal atau lambat dimuat, saya ingin tetap melihat keadaan awal sebagai diagram statis, supaya bagian itu tidak kosong.
35. Sebagai pembaca yang ingin membaca semua langkah sekaligus, saya ingin lipatan "Lihat semua langkah (teks)", supaya saya bisa membaca prosesnya seperti daftar.

### Penulis materi

36. Sebagai penulis materi, saya ingin menyisipkan visualisasi dengan satu komponen MDX dan data awal sebagai props, supaya saya tidak perlu menulis kode tampilan.
37. Sebagai penulis materi, saya ingin isi materi, tabel trace, dan diagram teks yang sudah ada tetap utuh, supaya visualisasi menjadi pelengkap dan bukan pengganti.
38. Sebagai penulis materi, saya ingin satu komponen Linked List yang jenisnya bisa dikunci (hanya Singly di materi utama) atau dibuka (empat jenis di halaman pendalaman), supaya visualisasi selalu sesuai isi halamannya.
39. Sebagai penulis materi, saya ingin pedoman di README tentang kapan sebuah konsep perlu visualisasi dan kapan tidak, supaya tidak ada animasi untuk konsep yang tidak punya proses.

### Pengembang/pemelihara

40. Sebagai pengembang, saya ingin logika setiap algoritma terpisah dari tampilan sebagai fungsi murni yang menghasilkan daftar langkah, supaya kebenarannya bisa diuji tanpa browser.
41. Sebagai pengembang, saya ingin satu pengendali (Putar, Jeda, langkah, kecepatan, keyboard, reduced motion) yang dipakai semua visualisasi, supaya perilakunya konsisten dan perbaikan cukup dilakukan sekali.
42. Sebagai pengembang, saya ingin tampilan per bentuk data (array, stack, queue, linked list, tree, graph) yang dipakai ulang di banyak materi, supaya visualisasi baru cukup menulis logika langkahnya.
43. Sebagai pengembang, saya ingin uji otomatis yang memastikan hasil akhir setiap algoritma sama dengan implementasi biasa, termasuk kasus tepi, supaya visualisasi tidak pernah mengajarkan hal yang salah.
44. Sebagai pengembang, saya ingin `npm test` berjalan tanpa dependency baru, supaya proyek tetap ringan.
45. Sebagai pengembang, saya ingin kode visualisasi hanya dimuat di halaman yang memakainya, supaya halaman lain tidak bertambah berat.
46. Sebagai pemilik proyek, saya ingin mencoba prototipe di link preview Vercel, termasuk di HP sendiri, sebelum digabung ke `main`, supaya saya bisa menilainya sebelum pembaca melihatnya.

---

## Keputusan Implementasi (Implementation Decisions)

### Arsitektur tiga lapis

1. **Logika langkah (step generator).** Setiap visualisasi punya fungsi murni TypeScript yang menerima data masukan (misalnya urutan operasi stack) dan mengembalikan **daftar langkah lengkap**. Fungsi ini tidak memakai React, DOM, atau path alias, sehingga bisa diuji langsung oleh test runner Node.
2. **Pengendali umum (`Visualizer`).** Satu komponen klien untuk semua visualisasi. Isinya: tombol kontrol, kecepatan, pintasan keyboard, deteksi reduced motion, panel penjelasan (`aria-live`), panel pseudocode, keterangan warna, editor data (diisi oleh tiap visualisasi), dan lipatan "Lihat semua langkah (teks)". Pengendali ini tidak tahu bentuk datanya; tampilan diterima sebagai komponen anak.
3. **Tampilan per bentuk data.** Komponen yang hanya menggambar *satu* langkah: `StackView` untuk prototipe, lalu menyusul `ArrayView` (searching, kelima sorting), `QueueView`, `LinkedListView`, `TreeView`, dan `GraphView`. Setiap tampilan dipakai ulang di banyak materi.

### Model langkah

- Setiap langkah adalah **snapshot lengkap** keadaan struktur data, bukan selisih dari langkah sebelumnya. Dengan begitu mundur, maju, reset, dan render di server menjadi sederhana: cukup ambil langkah ke-*i*.
- Isi setiap langkah:
  - keadaan data
  - **sorotan berdasarkan peran**: `aktif`, `khusus`, `selesai`, `dibuang`, `error`, dipetakan ke elemen tertentu
  - **kalimat penjelasan** berbahasa Indonesia, boleh memuat potongan kode inline
  - **id baris pseudocode** yang menyala (satu atau lebih)
  - nilai hasil opsional, misalnya `top → 5`
  - status langkah: `normal` atau `error`
- Generator bersifat **deterministik**: input yang sama selalu menghasilkan langkah yang sama. Tombol "Acak" menghasilkan data baru *sebelum* generator dipanggil, bukan di dalamnya.
- Pseudocode setiap visualisasi berupa daftar baris pendek berbahasa Indonesia dengan id stabil. Langkah merujuk id baris, bukan nomor baris, supaya pseudocode bisa diedit tanpa merusak pemetaan.

### Pengendali (player)

- Keadaannya: indeks langkah, sedang diputar atau tidak, dan kecepatan. Transisinya: `berikutnya`, `sebelumnya`, `reset`, `putar`, `jeda`, `lompat ke langkah`. Logika transisi ditulis sebagai **reducer murni** supaya bisa diuji.
- Aturan:
  - pemutaran otomatis berhenti di langkah terakhir
  - menekan Putar di langkah terakhir mulai dari awal lagi
  - Sebelumnya di langkah pertama dan Berikutnya di langkah terakhir dinonaktifkan
  - mengganti data selalu kembali ke langkah pertama dan menghentikan pemutaran
- Kecepatan 0,5×, 1×, dan 2×. Pada 1×, satu langkah tampil ±1,2 detik. Pilihan disimpan di `localStorage` (dibungkus try/catch, dan tetap berfungsi tanpa penyimpanan) dan berlaku untuk semua visualisasi.
- Pintasan `←`, `→`, `Spasi`, dan `Home` hanya aktif saat fokus berada di dalam visualisasi.

### Tampilan dan animasi

- Kotak data (stack, array, queue) dibuat dengan **HTML/CSS** supaya tajam, mengikuti tema, dan terbaca screen reader. Panah dan garis (linked list, tree, graph) dibuat dengan **SVG**. **Tidak memakai Canvas dan tidak memakai 3D.**
- Gerakan seperti masuk, keluar, dan berpindah posisi memakai library **`motion`**, yang sudah terpasang dan sebelumnya belum dipakai. Transisinya berbasis *spring* atau easing halus berdurasi sekitar 200–400 ms. Prinsip animasinya: modern dan rapi tapi tidak berlebihan; setiap gerakan harus memperjelas konsep, misalnya push turun dari atas dan pop terangkat lalu menghilang.
- Kalau sistem meminta **reduced motion**, semua perubahan posisi terjadi langsung tanpa animasi geser. Sorotan warna dan penjelasan tetap ada.
- Kode visualisasi dimuat hanya di halaman yang memakainya (dipecah per komponen, seperti Playground).

### Warna dan tanda

- Lima peran warna dengan nilai terang/gelap sebagai CSS variable bersama:
  - **biru** = `aktif` (sedang diperiksa/dibandingkan)
  - **kuning** = `khusus` (pivot, `mid`, `top`)
  - **hijau** = `selesai`/ditemukan
  - **abu-abu** = `dibuang`/tidak dipakai lagi
  - **merah** = `error`
- Warna tidak pernah berdiri sendiri. Peran penting juga ditandai teks atau ikon, seperti label `top`, `mid`, ✓, atau ✗.
- Setiap visualisasi menampilkan keterangan warna untuk peran yang dipakainya saja.

### Tata letak responsif

- **Layar lebar:** tampilan di kiri dan pseudocode di kanan; penjelasan dan kontrol di bawahnya.
- **HP:** tampilan, lalu penjelasan, lalu kontrol, lalu pseudocode yang bisa dilipat.
- Tidak ada scroll horizontal di halaman. Array yang panjang menggulir di dalam kotaknya sendiri.
- Tombol berukuran minimal ±40 px.

### Cadangan dan aksesibilitas

- Langkah pertama dirender di server, jadi tanpa JavaScript visualisasi tampil sebagai diagram statis.
- Lipatan **"Lihat semua langkah (teks)"** berisi daftar bernomor seluruh kalimat penjelasan.
- Kalimat penjelasan berada di wilayah `aria-live="polite"`. Semua tombol punya label berbahasa Indonesia.

### Prototipe Stack

- **Operasi:** `push x`, `pop`, `top`, `size`.
- **Data awal** sama dengan materi: `push 3, push 7, push 5, top, pop, push 9, pop, size`.
- **Editor data:**
  - tombol **Push [angka]**, **Pop**, **Top**, dan **Size** untuk menambah operasi
  - urutan operasi tampil sebagai *chip* yang bisa dihapus satu per satu
  - tombol **Kembalikan contoh materi**
  - batasnya maksimal 12 operasi dan angka bulat −99 sampai 999, supaya muat di kotak
  - input yang tidak valid ditolak dengan pesan yang jelas
- **Langkah per operasi:** satu langkah untuk setiap operasi, ditambah langkah awal "stack kosong".
  - `push` menambahkan elemen di atas, yang ditandai `aktif` lalu menjadi `top`.
  - `pop` dan `top` menandai elemen teratas, dan nilai hasilnya ditampilkan.
  - `size` menampilkan jumlah elemen.
- **Kasus error:** `pop` atau `top` pada stack kosong menjadi langkah **error** (merah). Penjelasannya: di C++ ini perilaku tak terdefinisi, jadi periksa `empty()` lebih dulu, dan di Python `pop()` pada list kosong menghasilkan `IndexError`. Stack tidak berubah, dan langkah berikutnya tetap berjalan.
- **Tampilan:** menara vertikal yang ditumpuk dari bawah ke atas, penanda `top ←` berwarna kuning, penghitung `size`, dan kotak "hasil" di samping menara. Tidak ada batas kapasitas, karena `std::stack` dan list Python memang tidak punya batas.
- **Pseudocode:** baris-baris untuk push, pop (termasuk pemeriksaan kosong), top, dan size.
- **Letak:** di materi Stack, tepat setelah tabel trace operasi yang sudah ada. Teks dan tabel di materi tidak diubah.

### Linked List (setelah prototipe)

- Satu komponen dengan dua pilihan:
  - **jenis**: Singly, Doubly, Circular singly, Circular doubly
  - **operasi**: tambah di depan, tambah di belakang, cari nilai, hapus nilai, telusuri
- Di materi utama Linked List, jenisnya **dikunci ke Singly**.
- Halaman pendalaman baru, **Variasi Linked List**, membuka keempat jenis. Halaman ini berisi penjelasan doubly dan circular, contoh C++/Python berpasangan, dan sumber. Contoh kodenya mengikuti aturan Playground: program utuh, atribut `input`, dan lolos `check:contoh`. Halaman ini tidak memakai 10 soal latihan.
- Panah `prev` pada jenis doubly digambar berbeda dari panah `next` (putus-putus, di bawah node). Pada jenis circular, panah dari node terakhir melengkung kembali ke `head`.

### Integrasi dengan materi

- Setiap visualisasi didaftarkan sebagai komponen MDX dengan props data awal.
- Tabel trace, diagram teks, `BufferStepper`, dan komponen statis yang sudah ada **tidak diubah**. Visualisasi ditambahkan di sebelahnya.
- Hanya konsep yang **sudah diajarkan** di materi yang divisualisasikan. Tidak ada materi baru yang dibuat demi animasi, kecuali halaman Variasi Linked List yang disepakati di Q21.

### Alur kerja

- Dikerjakan di branch `visualisasi` yang dibuat dari `playground`.
- Preview Vercel diuji pemilik proyek, termasuk di HP.
- Urutan penggabungan: `playground` ke `main` lebih dulu, lalu `visualisasi` setelah prototipe disetujui. Commit atas nama Vito28 tanpa atribusi Claude.

---

## Keputusan Pengujian (Testing Decisions)

### Seam pengujian

Pengujian dilakukan di **dua seam**. Keduanya berupa fungsi murni dan berada di level tertinggi yang tidak membutuhkan browser:

1. **Generator langkah** (seam utama): input → daftar langkah. Setiap visualisasi baru cukup diuji di sini.
2. **Reducer pengendali**: keadaan + aksi → keadaan baru (putar, jeda, maju, mundur, reset, berhenti di akhir, ganti data).

Komponen tampilan tidak diuji dengan unit test. Tampilan diperiksa lewat uji browser (lihat di bawah).

### Ciri uji yang baik

- Menguji **perilaku yang terlihat dari luar**: hasil akhir, isi langkah, dan aturan transisi. Uji tidak memeriksa detail internal seperti nama variabel sementara atau urutan pemanggilan fungsi.
- **Hasil akhir dibandingkan dengan implementasi biasa.** Contohnya, isi stack setelah semua operasi harus sama dengan hasil menjalankan operasi yang sama pada array biasa, begitu juga nilai yang dikembalikan `top`, `pop`, dan `size`.
- **Kasus tepi wajib:** pop dan top pada stack kosong (di awal maupun setelah semua elemen keluar), urutan tanpa operasi, satu elemen, nilai kembar, dan batas maksimal operasi.
- **Invarian di setiap langkah:**
  - ukuran stack tidak pernah negatif
  - elemen bertanda `top` selalu elemen terakhir
  - setiap id pseudocode yang dirujuk memang ada
  - setiap langkah punya kalimat penjelasan yang tidak kosong
  - langkah berstatus error tidak mengubah isi stack
- **Determinisme:** input yang sama menghasilkan daftar langkah yang identik.
- **Validasi editor data:** angka di luar batas, input bukan angka, dan jumlah operasi melebihi batas ditolak.

### Alat dan prior art

- Uji memakai **test runner bawaan Node** (`node --test`, yang di Node 24 bisa membaca TypeScript langsung) dan dijalankan lewat `npm test`. Tidak ada dependency baru.
- Repo ini belum punya unit test. Prior art terdekatnya adalah pemeriksa contoh kode `npm run check:contoh`, yang juga menguji perilaku dengan membandingkan hasil nyata terhadap hasil yang diharapkan.
- **Uji browser** memakai skrip Playwright + Chrome headless, cara yang sama dengan verifikasi Playground:
  - desktop dan emulasi HP
  - tema terang dan gelap
  - emulasi `prefers-reduced-motion`
  - navigasi keyboard
  - tidak ada scroll horizontal
  - tampilan tanpa JavaScript (langkah pertama tetap tergambar)
- **Uji HP sungguhan** dilakukan pemilik proyek lewat link preview Vercel.

---

## Di Luar Cakupan (Out of Scope)

- Visualisasi kode bebas buatan pembaca, misalnya dari Playground, seperti Python Tutor.
- Penyorotan baris pada kode C++ atau Python asli. Yang disorot hanya pseudocode.
- Animasi 3D, Canvas, suara, dan penyimpanan progres belajar.
- Mengganti atau menghapus tabel trace, diagram teks, `BufferStepper`, atau komponen statis yang sudah ada.
- Visualisasi untuk konsep yang tidak diajarkan di materi, misalnya penyisipan dengan menggeser elemen array. Satu-satunya pengecualian adalah halaman Variasi Linked List.
- Visualisasi untuk konsep tanpa proses yang berubah, seperti operator aritmatika, struct, dan kompleksitas waktu.
- Fitur judge atau penilaian jawaban.
- Pada tahap ini: semua visualisasi selain Stack (push/pop/top/size).

---

## Catatan Lanjutan (Further Notes)

### Perluasan cakupan (2026-11-19, setelah prototipe Stack)

Pemilik proyek meminta semua struktur data berikut punya materi **dan** visualisasi: linked list, queue, stack, hash table, binary tree, binary search tree, graph, priority queue, heap, dan trie. Karena itu:

- **Materi baru:** Hash Table (modul Struktur Data, setelah Map & Set), Heap & Priority Queue dan Trie (modul Tree & Graph, setelah Binary Search Tree), serta halaman pendalaman Variasi Linked List.
- **Visualisasi yang ditambahkan:**
  - Queue
  - Linked List (4 jenis)
  - Hash Table (chaining, fungsi hash mainan dari Map & Set)
  - Traversal Binary Tree
  - BST
  - Heap/Priority Queue (min-heap, tampilan pohon dan array)
  - Trie
  - DFS dan BFS
- **Data contoh bersama** ditetapkan sebelum pengerjaan, supaya materi dan visualisasi yang dikerjakan paralel tetap cocok:
  - hash table: `budi citra andi dina dodi`, cari `dina` dan `eko`, hapus `andi`
  - heap: `push 35 20 50 10 40 5 30`, lalu `pop pop`
  - trie: `kata katak kita buku bus`; `cari kita`, `cari kat`, `awalan kat`, `cari bukit`

### Urutan materi setelah prototipe (Q19)

1. **Struktur data dasar:**
   - Stack: pemeriksa kurung `{[()]}`, `([)]`. Ini juga menjadi bukti `StackView` bisa dipakai ulang.
   - Queue: antrean Ani, Budi, Citra, lalu Dodi; *hot potato* Ani sampai Eka dengan k = 3.
   - Linked List: 4 operasi di materi utama (Singly), dan halaman pendalaman Variasi Linked List dengan 4 jenis.
2. **Searching dan sorting:**
   - linear search dan binary search: `5 12 18 23 31 40 47 56 64 78`, cari 47 dan 20
   - bubble, selection, dan insertion sort: `4 9 2 7 5 8`
   - merge sort: `7 2 9 4 3 8 6 1`
   - quick sort: `6 3 8 1 9 2 5`
3. **Tree dan graph:**
   - traversal tree (pre/in/post/level) pada pohon `12 / 7, 30 / 3, 25, 18 / 40`
   - BST: insert `45 23 71 11 30 58 36 64`, search, delete
   - DFS dan BFS pada graph materi
   - flood fill dan BFS maze
4. **Rekursi:** call stack `faktorial(4)`, menara Hanoi 3 piringan, pohon `fib(5)`.
5. **Tambahan opsional:**
   - map/set (loker hash)
   - perulangan (tabel trace yang terisi)
   - call stack di pendalaman
   - memoisasi
   - bilangan biner

Setiap kelompok selesai dan diuji sebelum kelompok berikutnya dimulai.

### Rekursi didahulukan (2026-11-20)

Pemilik proyek meminta kelompok Rekursi dikerjakan sebelum searching dan sorting, dengan prinsip: **materi yang membingungkan harus punya visualisasi, dan visualisasinya tidak boleh ribet.** Karena itu ketiga visualisasi Rekursi hanya punya satu pilihan data, yaitu angka `n` (atau banyak cakram) lewat tombol angka di atas gambar, tanpa editor.

- **Call stack `faktorial(n)`** (`VisualisasiCallStack`, n = 0 sampai 5, awal 4): frame turun dari atas saat dipanggil dan terangkat saat kembali. Setiap frame menampilkan `n` miliknya dan perkalian yang tertunda (`4 * faktorial(3)`), lalu hasilnya (`4 * 6 = 24`). Ada penanda tahap turun/naik dan tinggi call stack.
- **Pohon panggilan `fib(n)`** (`VisualisasiFibonacci`, n = 1 sampai 6, awal 5): pohon tumbuh satu panggilan per langkah dengan urutan program (cabang kiri dulu). Kasus dasar dipanggil dan kembali dalam satu langkah. Jalur call stack disorot, dan hasil setiap panggilan tampil sebagai angka kecil. Langkah terakhir menandai nilai yang dihitung ulang (`fib(3)` 2 kali, `fib(2)` 3 kali) sebagai pengantar bagian "Kenapa lambat?".
- **Menara Hanoi** (`VisualisasiHanoi`, 1 sampai 4 cakram, awal 3): selain 7 perpindahan, setiap panggilan dengan 2 cakram atau lebih punya langkah "cakram k tertutup, pindahkan dulu k − 1 cakram ke tiang bantu". Peran tiang (asal/tujuan/bantu) di panggilan yang sedang berjalan tertulis di bawah setiap tiang, dan call stack `hanoi(...)` tampil di bawahnya.

### Searching dan sorting (2026-11-20)

Pemilik proyek meminta visualisasi yang jelas, animasinya lengkap, dan **tidak hanya satu kasus**. Karena itu setiap visualisasi di kelompok ini punya pemilih kasus berupa deretan tombol di atas gambar. Kasus pertama selalu contoh materi, ditambah kasus yang memperlihatkan sifat algoritmanya (sudah urut, terbalik, hampir urut, tidak ada, data tidak urut). Visualisasi pengurutan juga punya tombol **Acak**. Tetap tanpa editor teks, supaya tidak ribet.

Fondasi bersama:

- `ArrayView` (`array-view.tsx`): satu baris sel di atas grid, satu kolom per indeks. Mendukung penunjuk di bawah sel (`lo`, `mid`, `i`, `j`, ...), kolom tepi untuk penunjuk di -1 atau n, tanda kurung berlabel di atas sel, elemen yang diangkat di atas barisan (kunci insertion sort), bentuk batang yang tingginya sesuai nilai, dan rentang yang dipudarkan. Setiap elemen punya id tetap sehingga pertukaran dan pergeseran meluncur ke kolom barunya.
- `ChoicePicker` (`choice-picker.tsx`): deretan tombol pilihan yang membungkus ke baris baru di HP, dengan tombol Acak opsional.

Visualisasi:

- **Pencarian** (`VisualisasiPencarian`): linear dan biner bisa ditukar. Kasus: cari 47, cari 20, cari 5 (paling depan, satu-satunya kasus di mana linear menang), cari 78, dan data tidak urut (`8 3 9 1 5`, cari 3) yang berakhir merah karena jawabannya terlewat. Pencarian biner punya dua langkah per putaran: memilih `mid`, lalu mencoret separuh data. Penghitung "elemen diperiksa" memperlihatkan bedanya.
- **Batas bawah dan batas atas** (`VisualisasiBatasPencarian`): data `2 4 4 4 7 9`, x = 4, 5, 1, 10 sesuai tabel materi. Penunjuk `jawaban` hanya bergerak ke kiri, dan bisa berada di n.
- **Pengurutan** (`VisualisasiPengurutan`): bubble, selection, insertion dalam bentuk batang. Di bagian setiap algoritma, algoritmanya dikunci; di bagian "Membandingkan ketiganya" pembaca bisa mengganti algoritma pada data yang sama. Kasus: contoh materi, sudah urut, terbalik, hampir urut, acak. Penghitung perbandingan dan pertukaran/pergeseran cocok dengan tabel perbandingan di materi.
- **Merge sort** (`VisualisasiMergeSort`): grid bertingkat, satu baris per kedalaman rekursi. Elemen turun ke baris bawah saat dibagi dan naik satu per satu saat digabung.
- **Quick sort** (`VisualisasiQuickSort`): partisi Lomuto di tempat, rentang panggilan yang sedang berjalan disorot, tanda kurung "< pivot", dan kedalaman rekursi. Dipasang dua kali: contoh materi, dan kasus data sudah urut di bagian kasus terburuk.

### Grid dan memoisasi (2026-11-20)

Masih dengan aturan yang sama: beberapa kasus per visualisasi, tanpa editor.

- **Flood fill** (`VisualisasiFloodFill`, halaman DFS): denah materi 5×9. Satu langkah per sel yang baru dicat, ditambah langkah "ruangan baru" saat `main` menemukan lantai yang belum dikunjungi. Sel di call stack disorot, dan setiap sel yang selesai menampilkan nomor ruangannya. Panggilan ke dinding, sel yang sudah dikunjungi, atau luar denah tidak diberi langkah sendiri supaya tidak terlalu panjang. Kasus: denah materi (3 ruangan), pintu tertutup, satu ruangan dengan tiang.
- **BFS pada labirin** (`VisualisasiLabirin`, halaman BFS): labirin materi 5×7. Satu langkah per sel yang dikeluarkan dari queue; tetangga yang baru ditemukan langsung mendapat angka `dist`. Queue tampil di bawah grid. Langkah terakhir menyorot satu rute terpendek sebagai ilustrasi. Kasus: labirin materi (14), E tidak bisa dicapai (-1), tanpa dinding (riak berbentuk belah ketupat).
- **Memoisasi** (`VisualisasiMemoisasi`, pendalaman Memoisasi): pohon panggilan `fib(n)` seperti di Rekursi, dengan tombol Tanpa memo / Dengan memo dan `n` 1 sampai 6. Panggilan yang dijawab dari memo digambar dengan lingkaran ganda dan tidak punya anak. Di bawahnya ada tabel "dipanggil" per `k` (yang dihitung ulang berwarna merah) dan tabel `memo[k]` yang terisi satu per satu. `fib(5)`: 15 panggilan tanpa memo, 9 dengan memo, sesuai tabel di halaman itu.

### Lain-lain

- Pemetaan lengkap materi, data contoh, dan visual yang sudah ada dibuat saat sesi rancangan. Pemetaan itu dipakai untuk memastikan data awal setiap visualisasi sama persis dengan materinya.
- Skill `superpowers:brainstorming` dan `writing-plans` tidak terpasang. Alurnya diikuti dengan cara yang setara: rancangan lewat tanya-jawab, spesifikasi ini, persetujuan, lalu prototipe.
- Pelacak issue untuk spesifikasi belum dikonfigurasi, jadi dokumen ini disimpan di repo sesuai keputusan Q23.
