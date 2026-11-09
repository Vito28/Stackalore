/**
 * Registry of external sources Stacklore cites. Pages refer to these by key in
 * their `sumber` frontmatter, so author and license details live in one place
 * and the /lisensi page can list every source automatically.
 *
 * Keep this file free of imports: `source.config.ts` imports it at build time.
 *
 * Policy (see /lisensi): text may only be ADAPTED from sources whose license is
 * compatible with CC BY-SA 4.0 (CC BY, CC BY-SA, PSF/0BSD, MIT). Sources with a
 * NonCommercial clause or without an open license are used as references only.
 */

export const licenses = {
  'CC BY 4.0': { url: 'https://creativecommons.org/licenses/by/4.0/deed.id', adaptable: true },
  'CC BY-SA 3.0': { url: 'https://creativecommons.org/licenses/by-sa/3.0/deed.id', adaptable: true },
  'CC BY-SA 4.0': { url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.id', adaptable: true },
  'CC BY-NC-SA 4.0': { url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.id', adaptable: false },
  'PSF License 2.0': { url: 'https://docs.python.org/3/license.html', adaptable: true },
  'GFDL 1.3': { url: 'https://www.gnu.org/licenses/fdl-1.3.html', adaptable: false },
  MIT: { url: 'https://opensource.org/license/mit', adaptable: true },
  'MIT-0': { url: 'https://opensource.org/license/mit-0', adaptable: true },
} as const;

export type LicenseName = keyof typeof licenses;

export interface Reference {
  title: string;
  author: string;
  url: string;
  license: LicenseName;
  /** Extra license detail shown next to the badge. */
  licenseNote?: string;
}

export const references = {
  cppreference: {
    title: 'cppreference.com',
    author: 'Kontributor cppreference.com',
    url: 'https://en.cppreference.com/',
    license: 'CC BY-SA 3.0',
    licenseNote: 'juga tersedia di bawah GFDL',
  },
  'python-docs': {
    title: 'Dokumentasi Python 3',
    author: 'Python Software Foundation',
    url: 'https://docs.python.org/3/',
    license: 'PSF License 2.0',
    licenseNote: 'kode contoh juga berlisensi Zero-Clause BSD',
  },
  busbee: {
    title: 'Programming Fundamentals, 2nd Edition',
    author: 'Kenneth Leroy Busbee & Dave Braunschweig',
    url: 'https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Programming_Fundamentals_(Busbee_and_Braunschweig)',
    license: 'CC BY-SA 4.0',
  },
  py4e: {
    title: 'Python for Everybody',
    author: 'Charles R. Severance',
    url: 'https://www.py4e.com/book',
    license: 'CC BY 4.0',
  },
  'think-python': {
    title: 'Think Python, 3rd Edition',
    author: 'Allen B. Downey',
    url: 'https://greenteapress.com/wp/think-python-3rd-edition/',
    license: 'CC BY-NC-SA 4.0',
    licenseNote: 'kode contoh berlisensi MIT',
  },
  'mit-ocw-6096': {
    title: 'MIT OpenCourseWare 6.096: Introduction to C++',
    author: 'Massachusetts Institute of Technology',
    url: 'https://ocw.mit.edu/courses/6-096-introduction-to-c-january-iap-2011/',
    license: 'CC BY-NC-SA 4.0',
  },
  'gcc-docs': {
    title: 'Using the GNU Compiler Collection (GCC)',
    author: 'Free Software Foundation',
    url: 'https://gcc.gnu.org/onlinedocs/gcc/',
    license: 'GFDL 1.3',
    licenseNote: 'atau versi lebih baru',
  },
} satisfies Record<string, Reference>;

export type ReferenceKey = keyof typeof references;

export const referenceKeys = Object.keys(references) as [ReferenceKey, ...ReferenceKey[]];

export function getReference(key: ReferenceKey): Reference {
  return references[key];
}
