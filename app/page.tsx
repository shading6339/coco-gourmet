import { Suspense } from "react";

import { HomeContent } from "@/app/home-content";
import { HomeSuspenseFallback } from "@/app/home-suspense-fallback";
import { parseSearchUrl } from "@/lib/search/search-url";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toURLSearchParams(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }

    searchParams.set(key, value);
  }

  return searchParams;
}

export default async function Home({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const initialUrlState = parseSearchUrl(toURLSearchParams(params));

  return (
    <Suspense
      fallback={<HomeSuspenseFallback initialUrlState={initialUrlState} />}
    >
      <HomeContent initialUrlState={initialUrlState} />
    </Suspense>
  );
}
