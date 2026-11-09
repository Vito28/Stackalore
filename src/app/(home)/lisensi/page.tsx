import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, FileText, Globe } from 'lucide-react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { licenses, references, type ReferenceKey } from '@/lib/references';
import { repoFileUrl, repoUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const metadata: Metadata = {
  title: 'Lisensi & Atribusi',
  description: 'Ketentuan penggunaan materi Stacklore dan daftar sumber yang menjadi rujukan.',
};

interface Usage {
  pages: { title: string; url: string }[];
  adapted: boolean;
}

function collectUsage() {
  const usage = new Map<ReferenceKey, Usage>();

  for (const page of source.getPages()) {
    for (const entry of page.data.sumber ?? []) {
      const current = usage.get(entry.ref) ?? { pages: [], adapted: false };
      if (!current.pages.some((item) => item.url === page.url)) {
        current.pages.push({ title: page.data.title, url: page.url });
      }
      if (entry.jenis === 'diadaptasi') current.adapted = true;
      usage.set(entry.ref, current);
    }
  }

  return usage;
}

const mit0Text = `Hak cipta (c) 2026 Kontributor Stacklore

Izin diberikan secara cuma-cuma kepada siapa pun yang memperoleh salinan kode
contoh ini untuk menggunakan, menyalin, mengubah, menggabungkan, menerbitkan,
mendistribusikan, mensublisensikan, dan/atau menjual salinannya, tanpa batasan
dan tanpa syarat apa pun.

KODE DISEDIAKAN "SEBAGAIMANA ADANYA", TANPA JAMINAN APA PUN. PENULIS ATAU
PEMEGANG HAK CIPTA TIDAK BERTANGGUNG JAWAB ATAS KLAIM, KERUSAKAN, ATAU
KEWAJIBAN LAIN YANG TIMBUL DARI PENGGUNAAN KODE INI.

(Terjemahan tidak resmi dari MIT No Attribution. Yang berlaku secara hukum
adalah teks resmi berbahasa Inggris.)`;

export default function LicensePage() {
  const usage = collectUsage();
  const used = (Object.keys(references) as ReferenceKey[]).filter((key) => usage.has(key));

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 md:pt-14 lg:px-8">
          <header className="border-b pb-7">
            <p className="mb-3 text-sm text-fd-muted-foreground">Legal</p>
            <h1 className="text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">
              Lisensi &amp; Atribusi
            </h1>
            <p className="mt-3 text-lg leading-8 text-fd-muted-foreground">
              Materi Stacklore boleh kamu pakai, bagikan, dan kembangkan. Halaman ini menjelaskan syaratnya, serta
              sumber-sumber yang menjadi rujukan materi.
            </p>
          </header>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={<FileText className="size-4" aria-hidden="true" />}
              title="Teks & ilustrasi"
              license="CC BY-SA 4.0"
              href="#lisensi-konten"
              description="Boleh disalin dan diadaptasi, dengan atribusi dan lisensi yang sama."
            />
            <SummaryCard
              icon={<Code2 className="size-4" aria-hidden="true" />}
              title="Contoh kode"
              license="MIT-0"
              href="#lisensi-kode"
              description="Boleh dipakai di tugas atau proyek apa pun, tanpa atribusi."
            />
            <SummaryCard
              icon={<Globe className="size-4" aria-hidden="true" />}
              title="Kode situs"
              license="MIT"
              href="#lisensi-situs"
              description="Kode sumber Stacklore yang ada di GitHub."
            />
          </div>

          <div className="prose docs-prose mt-10 max-w-none">
            <p>
              Hak cipta © 2026 <strong>Kontributor Stacklore</strong>, yaitu semua orang yang tercatat dalam{' '}
              <a href={`${repoUrl}/graphs/contributors`} target="_blank" rel="noopener noreferrer">
                riwayat kontribusi repositori Stacklore
              </a>
              .
            </p>

            <h2 id="lisensi-konten">Lisensi teks dan ilustrasi</h2>
            <p>
              Kecuali disebutkan lain, seluruh teks, diagram, dan ilustrasi di Stacklore dilisensikan di bawah{' '}
              <a href={licenses['CC BY-SA 4.0'].url} target="_blank" rel="noopener noreferrer license">
                Creative Commons Atribusi-BerbagiSerupa 4.0 Internasional (CC BY-SA 4.0)
              </a>
              . Teks hukum lengkapnya ada di berkas{' '}
              <a href={repoFileUrl('LICENSE-CONTENT')} target="_blank" rel="noopener noreferrer">
                <code>LICENSE-CONTENT</code>
              </a>
              . Artinya kamu boleh:
            </p>
            <ul>
              <li>
                <strong>Berbagi</strong>: menyalin dan menyebarluaskan materi dalam bentuk atau format apa pun.
              </li>
              <li>
                <strong>Mengadaptasi</strong>: menggubah, mengubah, menerjemahkan, dan membuat turunan dari materi,
                termasuk untuk keperluan komersial.
              </li>
            </ul>
            <p>Dengan syarat:</p>
            <ul>
              <li>
                <strong>Atribusi</strong>: sebutkan judul materi, “Kontributor Stacklore”, tautan ke halaman aslinya,
                lisensinya, dan tandai jika kamu mengubahnya.
              </li>
              <li>
                <strong>BerbagiSerupa</strong>: hasil adaptasimu harus dibagikan dengan lisensi yang sama (CC BY-SA
                4.0).
              </li>
            </ul>
            <p>Contoh atribusi yang benar:</p>
            <div className="not-prose rounded-lg border bg-fd-card px-4 py-3 font-mono text-[0.8125rem] leading-6 break-words text-fd-foreground">
              “Input dengan cin” oleh Kontributor Stacklore, [tautan halaman], CC BY-SA 4.0. Diterjemahkan dan
              diringkas.
            </div>

            <h2 id="lisensi-kode">Lisensi contoh kode</h2>
            <p>
              Kecuali ditandai lain, semua contoh kode C++ dan Python di dalam materi dilisensikan di bawah{' '}
              <a href={licenses['MIT-0'].url} target="_blank" rel="noopener noreferrer license">
                MIT No Attribution (MIT-0)
              </a>
              . Kamu boleh menyalin, mengubah, dan memakainya di tugas kuliah, proyek pribadi, maupun produk komersial{' '}
              <strong>tanpa wajib mencantumkan sumber</strong> dan tanpa syarat BerbagiSerupa. Pendekatan ini sama
              dengan contoh kode di dokumentasi Python, yang memakai lisensi Zero-Clause BSD.
            </p>
            <p>
              Meski tidak wajib, menyebut Stacklore tetap kami hargai. Jika tugasmu punya aturan sendiri tentang kode
              dari internet, ikuti aturan tersebut.
            </p>
            <details>
              <summary>Teks MIT-0 (terjemahan tidak resmi)</summary>
              <div className="not-prose mt-3 rounded-lg border bg-fd-card px-4 py-3 font-mono text-xs leading-6 break-words whitespace-pre-wrap text-fd-muted-foreground">
                {mit0Text}
              </div>
              <p>
                Teks resmi berbahasa Inggris:{' '}
                <a href={repoFileUrl('LICENSE-EXAMPLES')} target="_blank" rel="noopener noreferrer">
                  <code>LICENSE-EXAMPLES</code>
                </a>
                .
              </p>
            </details>

            <h2 id="lisensi-situs">Lisensi kode situs</h2>
            <p>
              Kode sumber situs Stacklore (komponen, tata letak, dan konfigurasi) tersedia di{' '}
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>{' '}
              dan dilisensikan di bawah{' '}
              <a href={repoFileUrl('LICENSE')} target="_blank" rel="noopener noreferrer license">
                MIT License
              </a>
              . Situs ini dibangun dengan Next.js dan Fumadocs. Karya pihak ketiga yang dipakai, beserta lisensinya,
              tercantum di{' '}
              <a href={repoFileUrl('THIRD-PARTY-NOTICES.md')} target="_blank" rel="noopener noreferrer">
                <code>THIRD-PARTY-NOTICES.md</code>
              </a>
              .
            </p>

            <h2 id="kebijakan-sumber">Kebijakan penggunaan sumber</h2>
            <p>
              Penjelasan di Stacklore ditulis sendiri oleh tim. Sumber luar dipakai dengan aturan berikut, supaya
              seluruh materi tetap bisa dibagikan di bawah CC BY-SA 4.0:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Lisensi sumber</th>
                  <th>Cara Stacklore memakainya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CC BY, CC BY-SA, PSF License, MIT, Zero-Clause BSD</td>
                  <td>Boleh diadaptasi. Halaman terkait mencantumkan sumber dan perubahan yang dibuat.</td>
                </tr>
                <tr>
                  <td>CC BY-NC, CC BY-NC-SA, GFDL</td>
                  <td>
                    Hanya sebagai rujukan dan bacaan lanjut. Teksnya tidak disalin, karena lisensinya tidak kompatibel
                    dengan CC BY-SA 4.0.
                  </td>
                </tr>
                <tr>
                  <td>Tanpa lisensi terbuka (buku komersial, situs berhak cipta)</td>
                  <td>Hanya tautan dan kutipan pendek dengan menyebut sumbernya.</td>
                </tr>
              </tbody>
            </table>
            <p>
              Setiap halaman materi memiliki kotak <strong>Rujukan &amp; atribusi</strong> di bagian bawah. Bagian yang
              diadaptasi dari sumber lain ditandai <em>Diadaptasi</em>, lengkap dengan keterangan perubahannya.
            </p>

            <h2 id="daftar-sumber">Daftar sumber</h2>
            <p>Daftar ini dibuat otomatis dari kotak rujukan di setiap halaman materi.</p>
          </div>

          <ul className="mt-5 space-y-3">
            {used.map((key) => {
              const reference = references[key];
              const info = usage.get(key)!;
              return (
                <li key={key} className="rounded-xl border bg-fd-card p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-fd-foreground hover:underline"
                      >
                        {reference.title}
                      </a>
                      <p className="text-fd-muted-foreground">{reference.author}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="rounded-full border px-2 py-px text-fd-muted-foreground">
                        {info.adapted ? 'Diadaptasi' : 'Rujukan'}
                      </span>
                      <a
                        href={licenses[reference.license].url}
                        target="_blank"
                        rel="noopener noreferrer license"
                        className="rounded-full border px-2 py-px text-fd-muted-foreground hover:text-fd-foreground"
                      >
                        {reference.license}
                      </a>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-fd-muted-foreground">
                    Dipakai di:{' '}
                    {info.pages.map((page, index) => (
                      <span key={page.url}>
                        {index > 0 ? ', ' : null}
                        <Link href={page.url} className="underline-offset-2 hover:text-fd-foreground hover:underline">
                          {page.title}
                        </Link>
                      </span>
                    ))}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="prose docs-prose mt-10 max-w-none">
            <h2 id="merek-dagang">Merek dagang</h2>
            <p>
              “Python” dan logo Python adalah merek dagang milik Python Software Foundation. C++ adalah bahasa
              pemrograman yang distandarkan dalam ISO/IEC 14882. Nama-nama tersebut dipakai hanya untuk menyebut bahasa
              yang dipelajari. Stacklore tidak berafiliasi dengan Python Software Foundation, ISO, maupun pemilik
              sumber-sumber yang dirujuk.
            </p>

            <h2 id="kontribusi">Kontribusi</h2>
            <p>
              Dengan mengirim kontribusi (misalnya pull request), kamu setuju kontribusimu dilisensikan dengan ketentuan
              yang sama sesuai bagiannya: teks materi di bawah CC BY-SA 4.0, contoh kode di bawah MIT-0, dan kode situs
              di bawah MIT. Pastikan kamu berhak atas apa yang kamu kirim, dan jangan menyalin teks dari sumber yang
              lisensinya tidak kompatibel.
            </p>

            <h2 id="koreksi">Koreksi dan keberatan</h2>
            <p>
              Jika kamu pemegang hak cipta dan merasa materimu dipakai tidak sesuai lisensinya, atau menemukan
              atribusi yang keliru, buka{' '}
              <a href={`${repoUrl}/issues`} target="_blank" rel="noopener noreferrer">
                issue di repositori GitHub Stacklore
              </a>
              . Kami akan memperbaiki atribusi atau menghapus bagian tersebut.
            </p>

            <h2 id="penafian">Penafian</h2>
            <p>
              Materi disediakan sebagaimana adanya untuk tujuan belajar. Kami berusaha menjaga ketepatan setiap
              penjelasan dan contoh kode, tetapi tidak memberikan jaminan apa pun atas penggunaannya.
            </p>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}

function SummaryCard({
  icon,
  title,
  license,
  href,
  description,
}: {
  icon: ReactNode;
  title: string;
  license: string;
  href: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-fd-card p-4">
      <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
        {icon}
        {title}
      </div>
      <a href={href} className="mt-2 block text-xl font-semibold text-fd-foreground hover:underline">
        {license}
      </a>
      <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{description}</p>
    </div>
  );
}
