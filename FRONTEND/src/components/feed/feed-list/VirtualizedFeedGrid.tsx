// components/feed/VirtualizedFeedGrid.tsx
"use client";

import { useCallback } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { Feed } from "@/app/types/feed";
import OptimizedImage from "../../common/OptimizedImage";
import AutoSizer from "react-virtualized-auto-sizer";
import styles from "./virtualized-feed-grid.module.css";

interface VirtualizedFeedGridProps {
  feeds: Feed[];
  onFeedClick: (feedId: number) => void;
  favorite: { [feedId: number]: boolean };
  onToggleFavorite: (feedId: number) => void;
  mode: "default" | "select";
  selectedFeedIds: number[];
  onPressStart: () => void;
  onPressEnd: () => void;
}

const ITEM_SIZE = 120; // 각 아이템 크기
const COLUMN_COUNT = 3; // 한 행에 3개씩

export default function VirtualizedFeedGrid({
  feeds,
  onFeedClick,
  favorite,
  onToggleFavorite,
  mode,
  selectedFeedIds,
  onPressStart,
  onPressEnd,
}: VirtualizedFeedGridProps) {
  // 그리드 아이템 렌더러
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * COLUMN_COUNT + columnIndex;
      const feed = feeds[index];

      if (!feed) return <div style={style} />;

      return (
        <div style={style} className={styles.cell}>
          <div
            className={`${styles.feedItem} ${mode === "select" && selectedFeedIds.includes(feed.feedId) ? styles.selected : ""}`}
            onClick={() => onFeedClick(feed.feedId)}
            onTouchStart={onPressStart}
            onTouchEnd={onPressEnd}
            onTouchCancel={onPressEnd}
            onMouseDown={onPressStart}
            onMouseUp={onPressEnd}
            onMouseLeave={onPressEnd}
          >
            <OptimizedImage
              src={feed.feedThumbnailImgUrl || "/pixx-logo-dummy.png"}
              alt={`Feed ${feed.feedId}`}
              width={100}
              height={100}
              priority={index < 6} // 첫 6개만 priority
              feedId={feed.feedId}
              className={styles.feedImage}
            />

            {/* 즐겨찾기 버튼 */}
            <button
              className={styles.favoriteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(feed.feedId);
              }}
            >
              {favorite[feed.feedId] ? "★" : "☆"}
            </button>

            {/* 선택 모드 체크박스 */}
            {mode === "select" && (
              <div className={styles.checkbox}>{selectedFeedIds.includes(feed.feedId) ? "✓" : "○"}</div>
            )}
          </div>
        </div>
      );
    },
    [feeds, onFeedClick, favorite, onToggleFavorite, mode, selectedFeedIds, onPressStart, onPressEnd]
  );

  const rowCount = Math.ceil(feeds.length / COLUMN_COUNT);

  return (
    <div className={styles.container}>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={COLUMN_COUNT}
            columnWidth={ITEM_SIZE}
            width={width}
            height={height} // 뷰포트 높이
            rowCount={rowCount}
            rowHeight={ITEM_SIZE}
            overscanRowCount={2} // 미리 렌더링할 행 수
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}
