import type { Metadata } from 'next';
import { MaterialReview } from '@/components/material/material-review';

export const metadata: Metadata = {
  title: 'Material Preview — Stacklore',
  description: 'Review the Stacklore long-form material and code editor experience.',
};

export default function TestPage() {
  return <MaterialReview />;
}
