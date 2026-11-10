# Stacklore

Dokumentasi belajar pemrograman dan computer science dalam bahasa Indonesia.

Seri pertama, **C++**, membahas dasar pemrograman dari nol sampai siap _vibe coding_: algoritma, input & output, tipe data, operator (termasuk bitwise), percabangan, perulangan, fungsi, struktur data (array, string, struct, stack, queue, linked list, map & set), dan cara membaca error. Setiap contoh kode C++ disertai padanan Python, dan setiap materi ditutup dengan 10 soal latihan beserta pembahasannya. Seri Kriptografi, Machine Learning, dan Deep Learning segera hadir.

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

Fitur **Tanya AI** membutuhkan `OPENROUTER_API_KEY` di berkas `.env.local`. Model bisa diganti lewat `OPENROUTER_MODEL`.

## Struktur

| Lokasi | Isi |
| --- | --- |
| `content/docs/cpp/` | Materi C++ dalam MDX. Urutan sidebar diatur oleh `meta.json`. |
| `content/docs/cpp/(dasar)/`, `(struktur-data)/`, … | Modul materi. Nama folder dalam kurung tidak ikut masuk URL, jadi `(dasar)/input-dan-output.mdx` tampil di `/docs/cpp/input-dan-output`. Judul dan ikon modul ada di `meta.json` folder tersebut. |
| `content/docs/cpp/pendalaman/` | Penjelasan lanjutan yang ditautkan dari materi utama, misalnya buffer, pointer, dan undefined behavior |
| `content/docs/cpp/pustaka/` | Referensi pustaka standar, misalnya `getline`, `<cmath>`, dan `<vector>` |
| `src/components/mdx/` | Komponen khusus materi: flowchart, diagram memori, `DeepDive`, soal latihan (`Soal`, `Petunjuk`, `Pembahasan`), dan lainnya |
| `src/lib/references.ts` | Daftar sumber rujukan beserta lisensinya |
| `src/app/(home)/lisensi/` | Halaman Lisensi & Atribusi |

## Menulis materi

- Contoh kode hanya dalam C++ dan Python, ditulis berpasangan dengan `tab="C++"` dan `tab="Python"`.
- Penjelasan sampingan yang panjang ditaruh di `pendalaman/` atau `pustaka/`, lalu ditautkan dari materi utama.
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
