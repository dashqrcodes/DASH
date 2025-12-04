// Root page - redirect to /gift
// Isolated to /gift-build folder

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/gift');
}


