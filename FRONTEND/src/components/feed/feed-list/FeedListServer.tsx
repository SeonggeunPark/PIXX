// components/feed/FeedListServer.tsx

import { Suspense } from "react";
import FeedListClient from "./FeedListClient";
import { getFeeds, getFeedsByBrand } from "@/app/lib/api/feedApi";
import styles from "./feed-list.module.css";

interface FeedListServerProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function FeedListServer({ searchParams }: FeedListServerProps) {
  const sortParam = searchParams.sort as string;
  const defaultSortType: "recent" | "brand" | "oldest" =
    sortParam === "brand" ? "brand" : sortParam === "oldest" ? "oldest" : "recent";

  // 초기 데이터 가져오기 (첫 페이지만)
  let initialData;
  try {
    if (defaultSortType === "brand") {
      initialData = await getFeedsByBrand({ type: 2, page: 0, size: 2 });
    } else {
      const typeValue = defaultSortType === "recent" ? 0 : 1;
      initialData = await getFeeds({ type: typeValue, page: 0, size: 8 });
    }
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    initialData = null;
  }

  return (
    <Suspense
      fallback={
        <div className={styles["loading-message"]}>
          소중한 피드를
          <br />
          불러오고 있어요
        </div>
      }
    >
      <FeedListClient initialData={initialData} defaultSortType={defaultSortType} />
    </Suspense>
  );
}

export default FeedListServer;
