# Stacklore

Dokumentasi belajar pemrograman dan computer science dalam bahasa Indonesia.

Seri pertama, **C++**, membahas dasar pemrograman dari nol sampai siap _vibe coding_: algoritma, input & output, tipe data, operator (termasuk bitwise), percabangan, perulangan, fungsi, struktur data (array, string, matriks, struct, stack, queue, linked list, map & set), rekursi, algoritma pengurutan dan pencarian, divide & conquer, tree dan binary search tree, graph beserta DFS dan BFS, serta cara membaca error. Setiap contoh kode C++ disertai padanan Python, dan setiap materi ditutup dengan 10 soal latihan beserta pembahasannya. Seri Kriptografi, Machine Learning, dan Deep Learning segera hadir.

## Menjalankan secara lokal

Butuh Node.js 20.9 atau lebih baru.

```bash
npm install
npm run dev
```

Lalu buka http://localhost:3000.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | Pemeriksaan ESLint |
| `npm run types:check` | Pemeriksaan tipe TypeScript dan frontmatter MDX |
| `npm run check:contoh` | Mengompilasi dan menjalankan semua contoh kode yang bisa dijalankan (butuh `g++` dan `python3`). Tambahkan nama berkas untuk memeriksa sebagian, misalnya `npm run check:contoh -- perulangan` |

Fitur **Tanya AI** membutuhkan `OPENROUTER_API_KEY` di berkas `.env.local`. Model bisa diganti lewat `OPENROUTER_MODEL`.

## Struktur

```text
content/docs/                 Semua materi (MDX). Satu folder = satu subjek.
├── meta.json                 Urutan subjek di sidebar
├── cpp/                      Subjek C++
│   ├── index.mdx             Halaman pengantar subjek
│   ├── meta.json             Judul, ikon, dan urutan modul
│   ├── (pengenalan)/         Modul materi utama. Nama dalam kurung tidak masuk URL:
│   ├── (dasar)/              (dasar)/input-dan-output.mdx → /docs/cpp/input-dan-output
│   ├── …
│   ├── pendalaman/           Penjelasan lanjutan yang ditautkan dari materi utama
│   └── pustaka/              Referensi pustaka (getline, <cmath>, <vector>, …)
├── kriptografi/              Subjek lain memakai susunan yang sama
├── machine-learning/
└── deep-learning/

src/
├── app/                      Halaman dan route Next.js (beranda, /docs, /lisensi, API)
├── components/
│   ├── ai/                   Fitur Tanya AI
│   ├── docs/                 Bagian tampilan halaman docs (daftar materi, sumber, riwayat baca)
│   ├── playground/           Playground: editor CodeMirror, tombol Jalankan di blok kode, pengatur worker
│   ├── mdx/                  Komponen yang bisa dipakai di MDX semua subjek
│   │   └── cpp/              Komponen khusus satu subjek, dinamai sesuai slug subjek
│   ├── site/                 Header, footer, logo, tombol tema
│   ├── ui/                   Komponen UI dasar
│   └── mdx.tsx               Daftar komponen yang tersedia di MDX
└── lib/
    ├── subjects.ts           Daftar subjek untuk beranda (nama, deskripsi, status)
    ├── references.ts         Daftar sumber rujukan beserta lisensinya
    ├── mdx/remark-runnable.ts  Menandai contoh kode yang bisa dijalankan di Playground
    └── docs-tree.ts          Penomoran materi dan navigasi sebelumnya/berikutnya

public/playground/            Web Worker Playground: compiler C++ (YoWASP Clang) dan Python (Pyodide)
scripts/check-examples.mjs    Pemeriksa contoh kode (npm run check:contoh)
design/                       Catatan rancangan UI (tidak dipakai saat build)
```

Aturan yang dipakai `src/lib/docs-tree.ts`: halaman di `/docs/<subjek>/<slug>` dihitung sebagai materi bernomor, sedangkan halaman yang lebih dalam (`/docs/<subjek>/pendalaman/<slug>`) adalah bacaan tambahan dan tidak ikut alur sebelumnya/berikutnya. Karena itu materi utama selalu ditaruh di folder modul berkurung, bukan di subfolder biasa.

## Menambah materi subjek baru (misalnya Machine Learning)

1. Buat folder modul di `content/docs/machine-learning/`, misalnya `(pengenalan)/`, `(regresi)/`, `(klasifikasi)/`. Setiap modul punya `meta.json`:

   ```json
   { "title": "Regresi", "icon": "TrendingUp", "pages": ["regresi-linear", "gradient-descent"] }
   ```

   Ikon memakai nama dari [Lucide](https://lucide.dev/icons).
2. Daftarkan modul di `content/docs/machine-learning/meta.json` (`"pages": ["index", "(pengenalan)", "(regresi)", …, "pendalaman", "pustaka"]`) dan ganti `"description": "Segera hadir"`.
3. Ganti isi `index.mdx` subjek (hapus `<ComingSoon />`) dengan pengantar subjek.
4. Ubah `status` subjek di `src/lib/subjects.ts` menjadi `'available'` dan sesuaikan deskripsinya.
5. Komponen interaktif khusus subjek (misalnya plot atau visualisasi jaringan saraf) ditaruh di `src/components/mdx/machine-learning/` atau `src/components/mdx/deep-learning/`, lalu didaftarkan di `src/components/mdx.tsx`.
6. Tambahkan sumber baru (buku, kursus, dokumentasi pustaka) ke `src/lib/references.ts` sebelum dipakai di frontmatter `sumber`.
7. Gambar diletakkan di samping berkas MDX yang memakainya, lalu dipanggil dengan path relatif (`![Grafik loss](./loss.png)`).

## Playground

Pembaca bisa menjalankan kode C++ dan Python langsung di browser, lewat halaman `/playground` atau tombol **Jalankan** di contoh kode. Tidak ada server yang menjalankan kode:

- C++ dikompilasi oleh [YoWASP Clang](https://yowasp.org/) (C++20, tanpa exception) di Web Worker, lalu programnya dijalankan di worker terpisah yang dihentikan setelah 5 detik. Output dibatasi 64 KB.
- Python dijalankan oleh [Pyodide](https://pyodide.org/).
- Compiler (sekitar 23 MB) dan Pyodide (sekitar 6 MB) diunduh dari jsDelivr saat pembaca pertama kali menekan Jalankan, setelah meminta persetujuan, lalu tersimpan di cache browser. Versinya dikunci di `public/playground/*.worker.js`; jika diganti, uji ulang di laptop dan HP.

## Menulis materi

- Contoh kode hanya dalam C++ dan Python, ditulis berpasangan dengan `tab="C++"` dan `tab="Python"`.
- Penjelasan sampingan yang panjang ditaruh di `pendalaman/` atau `pustaka/`, lalu ditautkan dari materi utama.
- Contoh yang blok C++-nya program utuh (punya `int main`) otomatis mendapat tombol **Jalankan**, begitu juga pasangan Python-nya di grup tab yang sama. Program utuh harus bisa dikompilasi apa adanya, jadi tulis `#include` dan `using namespace std;` lengkap.
- Jika program membaca input (`cin`, `getline`, `input()`), tambahkan contoh input di baris pembuka blok C++ dengan `\n` sebagai pemisah baris. Input ini dipakai juga oleh versi Python, jadi susun sesuai cara Python membacanya (satu `input()` = satu baris):

  ````md
  ```cpp tab="C++" input="3\n70 50 90"
  ````

  Di dalam `<Soal>`, isi `input` dengan `Contoh input` soal tersebut; `npm run check:contoh -- --fill-soal` bisa mengisinya otomatis.
- Contoh yang memang sengaja salah (menampilkan error kompilasi, crash, atau perilaku tak terdefinisi) diberi `check="skip"` agar dilewati pemeriksa, tetapi tetap bisa dijalankan pembaca. Jika programnya berjalan normal tetapi output C++ dan Python memang berbeda (misalnya `true` dan `True`, atau kode soal yang sengaja keliru), pakai `check="no-compare"` supaya tetap dicek kompilasi dan jalannya.
- Potongan kode yang punya `int main` tetapi bergantung pada fungsi di blok lain diberi `run="none"`, sehingga tidak mendapat tombol Jalankan.
- Jalankan `npm run check:contoh` sebelum commit. Pemeriksa memastikan setiap contoh terkompilasi, selesai tanpa error, output C++ dan Python sama, dan output soal sesuai `Contoh output`.
- Setiap materi diakhiri bagian `## Latihan` berisi 10 soal: 3 mudah, 4 menengah, dan 3 sulit, di bawah subjudul `### Mudah`, `### Menengah`, dan `### Sulit`. Tulis tiap soal dengan `<Soal no={1} level="mudah" judul="...">`, tambahkan `<Petunjuk>` jika perlu, dan akhiri dengan `<Pembahasan>`. Soal hanya boleh memakai konsep dari materi itu dan materi sebelumnya.
- Jangan menyalin teks dari sumber luar. Tulis penjelasanmu sendiri, lalu cantumkan sumber yang kamu rujuk di frontmatter `sumber`:

```yaml
sumber:
  - ref: cppreference # kunci di src/lib/references.ts
    judul: "std::getline"
    url: https://en.cppreference.com/w/cpp/string/basic_string/getline
```

Jika sebagian teks memang diadaptasi, tambahkan `jenis: diadaptasi` dan jelaskan perubahannya di `perubahan`. Build otomatis gagal jika `ref` tidak dikenal, jika `perubahan` tidak diisi, atau jika sumbernya berlisensi NonCommercial atau GFDL. Sumber seperti itu hanya boleh menjadi rujukan.

## Lisensi

Hak cipta © 2026 Kontributor Stacklore, yaitu semua orang yang tercatat dalam riwayat commit repositori ini.

| Bagian | Lisensi | Teks lisensi |
| --- | --- | --- |
| Teks, diagram, dan ilustrasi materi (isi folder `content/`) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.id) | [`LICENSE-CONTENT`](LICENSE-CONTENT) |
| Contoh kode C++ dan Python di dalam materi | [MIT-0](https://opensource.org/license/mit-0) (MIT No Attribution) | [`LICENSE-EXAMPLES`](LICENSE-EXAMPLES) |
| Kode sumber situs (semua berkas di luar `content/`) | [MIT](https://opensource.org/license/mit) | [`LICENSE`](LICENSE) |

Alasan pemilihannya:

- **CC BY-SA 4.0** membuat materi bebas dibagikan dan dikembangkan siapa saja, termasuk untuk keperluan komersial, dengan syarat menyebut sumber dan membagikan hasil turunannya dengan lisensi yang sama. Lisensi ini juga yang memungkinkan Stacklore mengadaptasi sumber berlisensi BY-SA seperti cppreference.com.
- **MIT-0** membuat contoh kode boleh langsung disalin ke tugas atau proyek tanpa perlu menyertakan pemberitahuan hak cipta. Pendekatan ini sama dengan contoh kode di dokumentasi Python yang memakai Zero-Clause BSD.
- **MIT** adalah lisensi permisif yang paling umum untuk kode, dan sama dengan lisensi Fumadocs yang menjadi dasar situs ini.

Sumber yang dirujuk materi dicantumkan di setiap halaman dan di halaman `/lisensi`. Karya pihak ketiga yang dipakai situs ini ada di [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

### Kontribusi

Dengan mengirim pull request, kamu setuju kontribusimu dilisensikan dengan ketentuan di atas sesuai bagiannya: teks materi di bawah CC BY-SA 4.0, contoh kode di bawah MIT-0, dan kode situs di bawah MIT.
