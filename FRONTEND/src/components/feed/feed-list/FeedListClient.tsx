// components/feed/FeedListClient.tsx

"use client";

import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deleteFeed, getFeeds, getFeedsByBrand } from "@/app/lib/api/feedApi";
import { addPhotosToAlbum, createAlbum } from "@/app/lib/api/albumApi";
import { BrandListResponse, FavoriteResponse, Feed } from "@/app/types/feed";
import { useMutation } from "@tanstack/react-query";
import { toggleFavorite } from "@/app/lib/api/feedApi";

import FloatingButton from "../../common/FloatingButton";
import FeedSelectBar from "../FeedSelectBar";
import FeedAlbumCreateModal from "../FeedAlbumCreateModal";
import FeedAlbumAdd from "../FeedAlbumAdd";
import SortDropdown, { OptionType } from "../../common/SortDropdown";
// import Image from "next/image";
import styles from "./feed-list.module.css";
import FeedBrandList from "../FeedBrandList";
import AlertModal from "../../common/AlertModal";
import Head from "next/head";
import VirtualizedFeedGrid from "./VirtualizedFeedGrid";

const feedSortOptions: OptionType<"recent" | "oldest" | "brand">[] = [
  { value: "recent", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "brand", label: "브랜드순" },
] as const;

interface FeedListClientProps {
  initialData: Feed[] | BrandListResponse | null;
  defaultSortType: "recent" | "brand" | "oldest";
}

export default function FeedListClient({ initialData, defaultSortType }: FeedListClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 피드 즐겨찾기
  const [favorite, setFavorite] = useState<{ [feedId: number]: boolean }>({});

  // 선택모드 관리
  const [mode, setMode] = useState<"default" | "select">("default");
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  // 앨범 생성 시 제목 관리
  const [albumTitle, setAlbumTitle] = useState("");

  // 앨범 추가 및 생성 모달 관리
  const [isAlbumAddOpen, setIsAlbumAddOpen] = useState(false);
  const [isAlbumCreateOpen, setIsAlbumCreateOpen] = useState(false);

  // 알람 모달
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });

  // 피드 썸네일 로딩 및 에러 상태 관리
  // const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  // const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  // const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  // const MAX_RETRY_ATTEMPTS = 3;

  // 정렬
  const [sortType, setSortType] = useState<"recent" | "oldest" | "brand">(defaultSortType);

  // 무한스크롤
  const observerRef = useRef<HTMLDivElement>(null);

  // 알람 모달 열기/닫기
  const openAlert = (message: string) => {
    setAlertModal({ isOpen: true, message });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, message: "" });
  };

  // 리액트 쿼리 + 무한스크롤
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isLoading, isError } = useInfiniteQuery<
    Feed[] | BrandListResponse,
    Error,
    InfiniteData<Feed[] | BrandListResponse>,
    [string, string],
    number
  >({
    queryKey: ["feeds", sortType],
    queryFn: async ({ pageParam = 0 }) => {
      if (sortType === "brand") {
        const response = await getFeedsByBrand({ type: 2, page: pageParam, size: 2 });
        if (!response.brandList || response.brandList.length === 0) {
          return { brandList: [] };
        }
        return response;
      } else {
        const typeValue = sortType === "recent" ? 0 : 1;
        const response = await getFeeds({ type: typeValue, page: pageParam, size: 8 });
        return response;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (sortType === "brand") {
        const currentPage = lastPage as BrandListResponse;

        if (!currentPage.brandList || currentPage.brandList.length === 0) {
          return undefined;
        }

        const allBrandNames = new Set(
          allPages.flatMap((page) => (page as BrandListResponse).brandList).map((brand) => brand.brandName)
        );

        const newBrandNames = new Set(currentPage.brandList.map((brand) => brand.brandName));

        const isAllDuplicate = Array.from(newBrandNames).every((name) => allBrandNames.has(name));

        if (isAllDuplicate) return undefined;

        return allPages.length;
      } else {
        const feedList = lastPage as Feed[];
        if (!feedList || feedList.length < 8) {
          return undefined;
        }
        return allPages.length;
      }
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    // 초기 데이터 설정
    ...(initialData && {
      initialData: {
        pages: [initialData],
        pageParams: [0],
      },
    }),
  });

  // 날짜 정렬 렌더링
  const feedData = data as InfiniteData<Feed[]> | undefined;

  const flattenedFeeds = useMemo(() => {
    if (!feedData?.pages) return [];
    return feedData.pages.flatMap((page) => page as Feed[]);
  }, [feedData?.pages]);
  const firstFeed = feedData?.pages?.[0]?.[0];
  const thumbnailUrl = firstFeed?.feedThumbnailImgUrl;

  // 무한스크롤 감시자
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 피드 즐겨찾기 뮤테이션
  const { mutate: toggleFavoriteMutation } = useMutation<FavoriteResponse, Error, number>({
    mutationFn: toggleFavorite,
    onSuccess: async ({ feedId, isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: ["albumFeeds", 2, "recent"] });
      await queryClient.refetchQueries({
        queryKey: ["albumFeeds", 2, "recent"],
        exact: true,
      });

      setFavorite((prev) => ({
        ...prev,
        [feedId]: isFavorite,
      }));

      // React Query 캐시 업데이트
      if (sortType === "brand") {
        queryClient.setQueryData(["feeds", sortType], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: BrandListResponse) => ({
              ...page,
              brandList: page.brandList.map((brand) => ({
                ...brand,
                feeds: brand.feeds.map((feed) =>
                  feed.feedId === feedId ? { ...feed, feedFavorite: isFavorite } : feed
                ),
              })),
            })),
          };
        });
      } else {
        queryClient.setQueryData(["feeds", sortType], (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: Feed[]) =>
              page.map((feed) => (feed.feedId === feedId ? { ...feed, feedFavorite: isFavorite } : feed))
            ),
          };
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["albumFeeds", 2, "recent"],
      });
    },
    onError: () => {
      openAlert("즐겨찾기 추가에 실패했습니다.");
    },
  });

  // 즐겨찾기 상태 초기화
  useEffect(() => {
    if (!data) return;

    const initialFavorite: { [feedId: number]: boolean } = {};

    if (sortType === "brand") {
      const brandData = data as InfiniteData<BrandListResponse>;

      brandData.pages.forEach((page) => {
        page.brandList.forEach((brand) => {
          brand.feeds.forEach((feed: Feed) => {
            initialFavorite[feed.feedId] = feed.feedFavorite;
          });
        });
      });
    } else {
      const feedData = data as InfiniteData<Feed[]>;

      feedData.pages.forEach((page) => {
        page.forEach((feed) => {
          initialFavorite[feed.feedId] = feed.feedFavorite;
        });
      });
    }

    setFavorite(initialFavorite);
  }, [data, sortType]);

  // 이미지 관련 핸들러들
  // const handleImageLoad = (feedId: number) => {
  //   setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
  //   setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  // };

  // const handleImageError = (feedId: number) => {
  //   const currentRetryCount = retryCount[feedId] || 0;

  //   if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
  //     setRetryCount((prev) => ({ ...prev, [feedId]: currentRetryCount + 1 }));

  //     setTimeout(() => {
  //       setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
  //       setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  //     }, 1000);
  //   } else {
  //     setImageErrors((prev) => ({ ...prev, [feedId]: true }));
  //     setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
  //   }
  // };

  // const handleRetryRequest = (feedId: number, e: React.MouseEvent) => {
  //   e.stopPropagation();

  //   setRetryCount((prev) => ({ ...prev, [feedId]: 0 }));
  //   setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
  //   setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  // };

  // longPress 핸들러들
  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setMode("select");
    }, 800);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = (value: "recent" | "oldest" | "brand") => {
    setSortType(value);
    queryClient.removeQueries({ queryKey: ["feeds"] });
    refetch();
  };

  // // 피드 클릭 핸들러
  // 콜백 메모이제이션
  const handleFeedClick = useCallback(
    (feedId: number) => {
      if (mode === "select") {
        setSelectedFeedIds((prev) => (prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]));
      } else {
        router.push(`/feed/${feedId}`);
      }
    },
    [mode, router]
  );
  // const handleFeedClick = (feedId: number) => {
  //   if (mode === "select") {
  //     if (selectedFeedIds.includes(feedId)) {
  //       setSelectedFeedIds(selectedFeedIds.filter((id) => id !== feedId));
  //     } else {
  //       setSelectedFeedIds([...selectedFeedIds, feedId]);
  //     }
  //   } else {
  //     router.push(`/feed/${feedId}`);
  //   }
  // };

  // 앨범 생성
  const handleCreateAlbum = async () => {
    if (albumTitle.trim() === "" || selectedFeedIds.length === 0) {
      openAlert("앨범 이름을 입력해주세요.");
      return;
    }
    try {
      const res = await createAlbum({
        albumTitle: albumTitle.trim(),
        imageList: selectedFeedIds,
      });
      openAlert("앨범 생성되었습니다");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "albums",
      });

      router.push(`/album/${res.data.data.albumId}`);
    } catch (error) {
      openAlert("오류가 발생하여 앨범 생성에 실패했습니다");
      console.log(error);
    } finally {
      setIsAlbumCreateOpen(false);
      setMode("default");
      setSelectedFeedIds([]);
      setAlbumTitle("");
    }
  };

  // 앨범에 피드 추가
  const handleAddToAlbum = () => {
    if (selectedFeedIds.length === 0) {
      openAlert("추가할 사진을 먼저 선택해주세요.");
      return;
    }
    setIsAlbumAddOpen(true);
  };

  const handleAlbumSelect = async (albumId: number) => {
    try {
      await addPhotosToAlbum({ albumId, imageList: selectedFeedIds });
      openAlert("앨범에 사진이 추가되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["albums"] });
      router.push(`/album/${albumId}`);
    } catch (error) {
      openAlert("사진 추가에 실패했습니다.");
      console.error(error);
    } finally {
      setIsAlbumAddOpen(false);
      setMode("default");
      setSelectedFeedIds([]);
    }
  };

  const handleCloseAlbumAddModal = () => {
    setIsAlbumAddOpen(false);
    setMode("default");
    setSelectedFeedIds([]);
  };

  // 이미지 삭제
  const handleDeletePhotos = async () => {
    if (selectedFeedIds.length === 0) {
      openAlert("삭제할 사진을 선택해주세요.");
      return;
    }

    try {
      await deleteFeed({
        imageList: selectedFeedIds,
      });

      openAlert("피드 사진 삭제 완료");
      queryClient.invalidateQueries({ queryKey: ["faces"] });
      queryClient.refetchQueries({ queryKey: ["faces"] });

      refetch();
    } catch (error) {
      openAlert("삭제 실패");
      console.error(error);
    } finally {
      setMode("default");
      setSelectedFeedIds([]);
    }
  };

  if (isLoading)
    return (
      <div className={styles["loading-message"]}>
        소중한 피드를
        <br />
        불러오고 있어요
      </div>
    );

  if (isError)
    return (
      <div className={styles["error-message"]}>
        피드를 불러오는데
        <br />
        실패했습니다
      </div>
    );

  // 브랜드 전용 렌더링
  if (sortType === "brand") {
    const brandData = data as InfiniteData<BrandListResponse>;
    const brandList = brandData?.pages.flatMap((page) => page.brandList) || [];

    return (
      <div className={styles.wrapper}>
        <div className={styles.selectWrapper}>
          <SortDropdown value={sortType} onChange={handleSortChange} options={feedSortOptions} />
        </div>
        <FeedBrandList brandList={brandList} />
        <div ref={observerRef} style={{ height: 1 }} />
        {isFetchingNextPage && <div className={styles["loading-message"]}>...</div>}
      </div>
    );
  }

  return (
    <>
      {thumbnailUrl && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={`/api/image-proxy?url=${encodeURIComponent(thumbnailUrl)}`}
            type="image/avif"
          />
        </Head>
      )}
      <div className={styles.wrapper}>
        <div className={styles.selectWrapper}>
          <SortDropdown value={sortType} onChange={handleSortChange} options={feedSortOptions} />
        </div>
        <div className={styles["feed-grid-wrapper"]}>
          <div className={styles["feed-grid"]}>
            <VirtualizedFeedGrid
              feeds={flattenedFeeds}
              onFeedClick={handleFeedClick}
              favorite={favorite}
              onToggleFavorite={(id) => toggleFavoriteMutation(id)}
              mode={mode}
              selectedFeedIds={selectedFeedIds}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
            />
            {/* {feedData?.pages.map((page, pageIndex) =>
              page.map((feed: Feed, feedIndex: number) => {
                return (
                  <div
                    key={feed.feedId}
                    className={`${styles["feed-item"]} ${styles.slideUp}`}
                    onClick={() => handleFeedClick(feed.feedId)}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onTouchCancel={handlePressEnd}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                  >
                    {feed.feedThumbnailImgUrl ? (
                      <Image
                        src={`/api/image-proxy?url=${encodeURIComponent(feed.feedThumbnailImgUrl)}`}
                        alt={`Feed ${feed.feedId}`}
                        width={100}
                        height={100}
                        sizes="(max-width: 480px) 100vw"
                        quality={50}
                        className={styles.feedImage}
                        priority={pageIndex === 0 && feedIndex < 2}
                        onLoad={() => handleImageLoad(feed.feedId)}
                        onError={() => handleImageError(feed.feedId)}
                      />
                    ) : (
                      <div className={styles.imageError}>이미지 없음</div>
                    )}

                    <div
                      className={styles.favoriteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation(feed.feedId);
                      }}
                    >
                      <Image
                        src={
                          favorite[feed.feedId]
                            ? "/icons/icon-star-fill-yellow.png"
                            : "/icons/icon-star-empty-yellow.png"
                        }
                        alt="즐겨찾기"
                        width={32}
                        height={32}
                      />
                    </div>

                    {mode === "select" && selectedFeedIds.includes(feed.feedId) && (
                      <div className={styles.selectedOverlay}></div>
                    )}

                    {!imageLoaded[feed.feedId] && !imageErrors[feed.feedId] && (
                      <div className={styles.imageLoading}>로딩중...</div>
                    )}

                    {imageErrors[feed.feedId] && (
                      <div className={styles.imageError}>
                        <p>이미지 로드 실패</p>
                        <button className={styles.retryButton} onClick={(e) => handleRetryRequest(feed.feedId, e)}>
                          다시 시도
                        </button>
                      </div>
                    )}

                    {mode === "select" && (
                      <div className={styles.checkIcon}>
                        <Image
                          src={
                            selectedFeedIds.includes(feed.feedId)
                              ? "/icons/icon-checked-purple.png"
                              : "/icons/icon-unchecked-purple.png"
                          }
                          alt="선택 여부"
                          width={36}
                          height={39}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )} */}
          </div>

          <div ref={observerRef} style={{ height: "1px" }} />
          {isFetchingNextPage && <div>추가 로딩 중...</div>}
        </div>

        <FloatingButton
          mode={mode}
          onClick={() => {
            if (mode === "default") {
              setMode("select");
            } else {
              setMode("default");
              setSelectedFeedIds([]);
            }
          }}
        />

        {isAlbumAddOpen && (
          <FeedAlbumAdd
            isOpen={isAlbumAddOpen}
            onClose={handleCloseAlbumAddModal}
            onSelect={handleAlbumSelect}
            onCreateNewAlbum={() => setIsAlbumCreateOpen(true)}
          />
        )}

        {isAlbumCreateOpen && (
          <FeedAlbumCreateModal
            isOpen={isAlbumCreateOpen}
            onClose={() => setIsAlbumCreateOpen(false)}
            albumTitle={albumTitle}
            setAlbumTitle={setAlbumTitle}
            onSubmit={handleCreateAlbum}
          />
        )}

        {mode === "select" && <FeedSelectBar onAdd={handleAddToAlbum} onDelete={handleDeletePhotos} />}

        <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={closeAlert} />
      </div>
    </>
  );
}
