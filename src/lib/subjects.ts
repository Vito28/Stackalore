import {
  BrainCircuit,
  ChartScatter,
  LockKeyhole,
  SquareCode,
  type LucideIcon,
} from 'lucide-react';

export type SubjectStatus = 'available' | 'soon';

export interface Subject {
  /** Folder name inside `content/docs`, also the URL segment after `/docs`. */
  slug: string;
  name: string;
  /** Compact label for tight spaces such as the mobile subject switcher. */
  shortName: string;
  description: string;
  icon: LucideIcon;
  status: SubjectStatus;
}

export const subjects: Subject[] = [
  {
    slug: 'cpp',
    name: 'C++',
    shortName: 'C++',
    description:
      'Dasar pemrograman dari nol sampai siap vibe coding: algoritma, tipe data, percabangan, perulangan, array, fungsi, dan debugging. Setiap contoh disertai padanan Python.',
    icon: SquareCode,
    status: 'available',
  },
  {
    slug: 'kriptografi',
    name: 'Kriptografi',
    shortName: 'Kripto',
    description:
      'Enkripsi, hashing, dan tanda tangan digital: cara informasi dilindungi dan diverifikasi.',
    icon: LockKeyhole,
    status: 'soon',
  },
  {
    slug: 'machine-learning',
    name: 'Machine Learning',
    shortName: 'ML',
    description:
      'Bagaimana komputer belajar pola dari data: regresi, klasifikasi, dan evaluasi model.',
    icon: ChartScatter,
    status: 'soon',
  },
  {
    slug: 'deep-learning',
    name: 'Deep Learning',
    shortName: 'DL',
    description:
      'Jaringan saraf tiruan, backpropagation, CNN, hingga arsitektur Transformer.',
    icon: BrainCircuit,
    status: 'soon',
  },
];

export function getSubject(slug: string | undefined): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function subjectHref(subject: Subject): string {
  return `/docs/${subject.slug}`;
}
