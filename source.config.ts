import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { licenses, referenceKeys, references } from './src/lib/references';

/**
 * `sumber` lists the external sources a page relies on. Each entry points to a
 * key in `src/lib/references.ts`; `url` and `judul` narrow it to the exact page.
 * Adapted material must describe what was changed (required by CC licenses),
 * and may only come from a license compatible with Stacklore's CC BY-SA 4.0.
 */
const sourceEntry = z
  .object({
    ref: z.enum(referenceKeys),
    judul: z.string().optional(),
    url: z.url().optional(),
    jenis: z.enum(['rujukan', 'diadaptasi']).default('rujukan'),
    perubahan: z.string().optional(),
  })
  .refine((entry) => entry.jenis !== 'diadaptasi' || Boolean(entry.perubahan), {
    message: 'Sumber dengan jenis "diadaptasi" wajib mengisi "perubahan".',
  })
  .refine((entry) => entry.jenis !== 'diadaptasi' || licenses[references[entry.ref].license].adaptable, {
    message: 'Lisensi sumber ini tidak kompatibel dengan CC BY-SA 4.0, jadi hanya boleh dipakai sebagai rujukan.',
  });

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      sumber: z.array(sourceEntry).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
