import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { appName } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: {
    default: `${appName} — Dokumentasi belajar pemrograman`,
    template: `%s — ${appName}`,
  },
  description:
    'Dokumentasi berbahasa Indonesia untuk belajar pemrograman C++ dan Python dari nol, serta kriptografi, machine learning, dan deep learning.',
};

const translations = {
  'Search(search dialog)': 'Cari materi…',
  'No results found(search dialog)': 'Tidak ada hasil',
  'Close Search(search dialog)(aria-label)': 'Tutup pencarian',
  'Open Search(search trigger)(aria-label)': 'Buka pencarian',
  'Search(search trigger)': 'Cari',
  'Copy Text(code block)(aria-label)': 'Salin kode',
  'Copied Text(code block)(aria-label)': 'Tersalin',
  'Copy Anchor Link(heading anchor)(aria-label)': 'Salin tautan subbab',
  'Copy Link(accordion)(aria-label)': 'Salin tautan',
  'On this page(table of contents)': 'Di halaman ini',
  'Next Page(pagination)': 'Berikutnya',
  'Previous Page(pagination)': 'Sebelumnya',
  'Page Not Found(404 not found page)': 'Halaman tidak ditemukan',
  'Back to Home(404 not found page)': 'Kembali ke beranda',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{ defaultTheme: 'system', enableSystem: true, disableTransitionOnChange: false }}
          i18n={{ locale: 'id', translations }}
          search={{
            links: [
              ['Pengantar C++', '/docs/cpp'],
              ['Algoritma & Flowchart', '/docs/cpp/algoritma-dan-flowchart'],
              ['Input dengan cin', '/docs/cpp/input-dengan-cin'],
              ['Buffer Input & Output', '/docs/cpp/pendalaman/buffer'],
            ],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
