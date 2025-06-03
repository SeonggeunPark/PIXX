// 피드 목록

// import FeedList from "@/components/feed/FeedList";
// import { Suspense } from "react";

// export default function Page() {
//   return (
//     <main>
//       <Suspense fallback={<div>피드를 불러오는 중입니다...</div>}>
//         <FeedList />
//       </Suspense>
//     </main>
//   );
// }

// app/feed/page.tsx

import FeedListServer from "@/components/feed/feed-list/FeedListServer";

export default async function FeedPage(props: {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await props.searchParams;

  return <FeedListServer searchParams={resolvedSearchParams} />;
}
