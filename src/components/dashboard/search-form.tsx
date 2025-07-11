'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCode = searchParams.get('code') || '';

  const handleSearch = (formData: FormData) => {
    const code = formData.get('code') as string;
    if (code) {
      router.push(`/dashboard/search-code?code=${encodeURIComponent(code)}`);
    } else {
      router.push(`/dashboard/search-code`);
    }
  };

  return (
    <form action={handleSearch} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        name="code"
        placeholder="Introduce el código..."
        defaultValue={defaultCode}
        className="flex-1"
        aria-label="Código de influencer"
      />
      <Button type="submit" aria-label="Buscar código">
        <Search className="mr-2 h-4 w-4" /> Buscar
      </Button>
    </form>
  );
}
