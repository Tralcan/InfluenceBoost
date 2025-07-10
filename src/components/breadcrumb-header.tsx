'use client'

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';

const pathToTitleMap: { [key: string]: string } = {
  '/dashboard': 'Panel',
  '/dashboard/campaigns': 'Campañas',
  '/dashboard/campaigns/new': 'Nueva Campaña',
};

const getCampaignTitle = (id: string) => `Campaña ${id}`;

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;

    let title = pathToTitleMap[href];
    if (href.match(/^\/dashboard\/campaigns\/(?!\bnew\b)[^/]+$/)) {
      title = getCampaignTitle(segment);
    }
    
    if (!title) return null;


    return (
      <React.Fragment key={href}>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{title}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={href}>{title}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </React.Fragment>
    );
  });

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard"><Home className="h-4 w-4"/></Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs}
            </BreadcrumbList>
        </Breadcrumb>
    </div>
  );
}
