# Pemberitahuan Pihak Ketiga

Stacklore memakai karya pihak ketiga berikut. Setiap karya tetap berada di bawah lisensinya sendiri, bukan di bawah lisensi Stacklore.

## Fumadocs

Kerangka awal proyek ini dibuat dengan [Create Fumadocs](https://github.com/fuma-nama/fumadocs). Beberapa berkas masih berasal dari template tersebut, terutama `src/lib/source.ts`, `src/components/markdown.tsx`, `src/components/ai/search.tsx`, `proxy.ts`, serta route di `src/app/api/`, `src/app/llms*`, dan `src/app/og/`.

```text
MIT License

Copyright (c) 2023 Fuma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Paket npm

Paket yang tercantum di `package.json` tidak disimpan di repositori ini. Paket tersebut diunduh saat `npm install`, dan teks lisensinya ada di folder `node_modules/<nama-paket>/`. Paket utama yang dipakai:

| Paket | Lisensi |
| --- | --- |
| Next.js | MIT |
| React | MIT |
| Fumadocs (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) | MIT |
| Tailwind CSS | MIT |
| Zod | MIT |
| Lucide (`lucide-react`) | ISC |
| Vercel AI SDK (`ai`) | Apache-2.0 |

## Font

Font berikut diunduh oleh `next/font` saat build, lalu disajikan bersama situs:

| Font | Lisensi |
| --- | --- |
| [Inter](https://github.com/rsms/inter) | SIL Open Font License 1.1 |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | SIL Open Font License 1.1 |

## Sumber materi

Sumber yang dirujuk oleh materi (cppreference.com, dokumentasi Python, dan buku-buku terbuka) dicantumkan di bagian bawah setiap halaman, dan dirangkum di halaman `/lisensi` situs. Daftar lengkapnya, beserta lisensi masing-masing, ada di `src/lib/references.ts`.
