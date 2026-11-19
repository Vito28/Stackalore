import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { PlaygroundLoader } from '@/components/playground/playground-loader';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Tulis dan jalankan kode C++ atau Python langsung di browser, tanpa instalasi.',
};

const cppSample = `#include <iostream>
#include <string>
using namespace std;

int main() {
    string nama;
    int umur;
    cin >> nama >> umur;
    cout << "Halo, " << nama << "!" << endl;
    cout << "Tahun depan umurmu " << umur + 1 << " tahun." << endl;
    return 0;
}
`;

const pythonSample = `nama = input()
umur = int(input())
print(f"Halo, {nama}!")
print(f"Tahun depan umurmu {umur + 1} tahun.")
`;

export default function PlaygroundPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 pt-10 pb-20 sm:px-6 md:pt-14">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">Playground</h1>
            <p className="mt-3 leading-7 text-fd-muted-foreground">
              Tulis kode C++ atau Python, isi input yang dibaca <code>cin</code> atau <code>input()</code>, lalu
              tekan <strong className="text-fd-foreground">Jalankan</strong>. Semua kode dikompilasi dan dijalankan di
              browsermu sendiri, jadi tidak ada kode yang dikirim ke server.
            </p>
          </header>

          <PlaygroundLoader
            sources={{
              cpp: { code: cppSample, input: 'Budi 20' },
              python: { code: pythonSample, input: 'Budi\n20' },
            }}
            defaultLanguage="cpp"
          />

          <ul className="mt-6 list-disc space-y-1.5 pl-5 text-sm leading-6 text-fd-muted-foreground">
            <li>
              C++ dikompilasi dengan Clang (standar C++20). Fitur exception (<code>try</code>/<code>catch</code>)
              tidak tersedia.
            </li>
            <li>Program dihentikan otomatis setelah 5 detik, dan output dibatasi 64 KB.</li>
            <li>
              Pertama kali dijalankan, compiler perlu diunduh (C++ sekitar 23 MB, Python sekitar 6 MB). Setelah itu
              tersimpan di browser.
            </li>
            <li>Perubahan kode tidak disimpan. Salin kodemu sebelum menutup halaman.</li>
          </ul>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
