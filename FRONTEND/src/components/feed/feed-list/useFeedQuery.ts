// // hooks/useFeedQuery.ts
// 이미지 최적화 시도. 일단 사용 안함
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useMemo } from "react";

// export function useFeedQuery(sortType: string, initialData?: any) {
//   const query = useInfiniteQuery({
//     queryKey: ["feeds", sortType],
//     queryFn: async ({ pageParam = 0 }) => {
//       // API 호출 로직
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       // 다음 페이지 로직
//     },
//     initialPageParam: 0,
//     staleTime: 1000 * 60 * 10, // 10분으로 증가
//     gcTime: 1000 * 60 * 30, // 30분으로 증가
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//     initialData,
//     // 중요: 네트워크 요청 최적화
//     networkMode: "offlineFirst",
//   });

//   // 데이터 메모이제이션
//   const flattenedFeeds = useMemo(() => {
//     if (!query.data) return [];

//     if (sortType === "brand") {
//       return query.data.pages.flatMap((page: any) => page.brandList.flatMap((brand: any) => brand.feeds));
//     }

//     return query.data.pages.flatMap((page: any) => page);
//   }, [query.data, sortType]);

//   return {
//     ...query,
//     flattenedFeeds,
//   };
// }
