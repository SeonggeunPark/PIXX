"use client";
import { useState, useEffect } from "react";
import api from "@/app/lib/api/axios";
import styles from "./add-file.module.css";
import { useQueryClient } from "@tanstack/react-query";
import ErrorModal from "@/components/ErrorModal";
import { useRouter } from "next/navigation";

export default function AddFile() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFeedId, setUploadedFeedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const validateFiles = (fileList: FileList): boolean => {
    const currentFiles = Array.from(fileList);
    const previousFiles = files ? Array.from(files) : [];
    const allFiles = [...previousFiles, ...currentFiles];

    // 파일 타입별로 분류
    const jpgPngFiles = allFiles.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg"
    );
    // 승용아 아래 두 변수 사용 안하는데 있어서 build error 나고있어 일단 주석처리해둘게
    // const gifFiles = allFiles.filter((file) => file.type === "image/gif");
    // const mp4Files = allFiles.filter((file) => file.type === "video/mp4");

    // 각 타입별 파일 개수 검증
    if (jpgPngFiles.length === 0) {
      setErrorMessage("이미지는 필수로 업로드해야 합니다.");
      return false;
    }

    // 지원하지 않는 파일 형식 체크
    const unsupportedFiles = allFiles.filter(
      (file) => !["image/jpeg", "image/jpg", "image/png", "image/gif", "video/mp4"].includes(file.type)
    );

    if (unsupportedFiles.length > 0) {
      setErrorMessage("지원하지 않는 파일 형식이 포함되어 있습니다.");
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (validateFiles(event.target.files)) {
        const currentFiles = Array.from(event.target.files);
        const previousFiles = files ? Array.from(files) : [];
        const allFiles = [...previousFiles, ...currentFiles];

        // 파일 타입별로 분류
        const jpgPngFiles = allFiles.filter(
          (file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg"
        );
        const otherFiles = allFiles.filter((file) => file.type === "image/gif" || file.type === "video/mp4");

        // JPG/PNG 파일을 리스트 맨 앞으로 정렬
        const sortedFiles = [...jpgPngFiles, ...otherFiles];

        // FileList 객체로 변환
        const dataTransfer = new DataTransfer();
        sortedFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);

        // 미리보기 URL 생성
        const newPreviews = sortedFiles.map((file) => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // DOM 업데이트 후 스크롤 실행
        setTimeout(() => {
          const submitButton = document.querySelector(`.${styles.submitButton}`);
          if (submitButton) {
            submitButton.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      } else {
        event.target.value = "";
      }
    }
  };

  const handleThumbnailSelect = (index: number) => {
    if (!files) return;

    const selectedFile = files[index];
    if (selectedFile.type === "image/gif" || selectedFile.type === "video/mp4") {
      setErrorMessage("JPG/PNG 형식의 이미지만 대표 이미지로 설정할 수 있습니다.");
      return;
    }

    // 선택된 파일을 맨 앞으로 이동
    const fileArray = Array.from(files);
    const [movedFile] = fileArray.splice(index, 1);
    fileArray.unshift(movedFile);

    // FileList 객체로 변환
    const dataTransfer = new DataTransfer();
    fileArray.forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);

    // 기존 미리보기 URL들을 해제
    previews.forEach((url) => URL.revokeObjectURL(url));

    // 새로운 순서대로 미리보기 URL 생성
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (!files) return;

    setIsUploading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await api.post("/api/v1/photos/upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.status === 200) {
        setFiles(null);
        // 파일 입력 초기화
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // 피드 목록 갱신
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "feeds",
        });
        await queryClient.refetchQueries({
          predicate: (query) => query.queryKey[0] === "feeds",
        });

        // 사람들 목록 갱신
        await queryClient.setQueryData(["faces"], undefined);
        await queryClient.removeQueries({ queryKey: ["faces"] });
        // await queryClient.invalidateQueries({
        //   predicate: (query) => query.queryKey[0] === "faces",
        // });
        // await queryClient.refetchQueries({
        //   predicate: (query) => query.queryKey[0] === "faces",
        // });

        // await queryClient.invalidateQueries({ queryKey: ["faces"] });
        // await queryClient.refetchQueries({ queryKey: ["faces"] });

        // 업로드 성공 시 feedId 저장 및 성공 메시지 표시
        setUploadedFeedId(response.data.data.feedId);
        setErrorMessage("파일 업로드에 성공했습니다.\n확인 버튼을 누르면 해당 피드로 이동합니다.");
      }
    } catch (error: any) {
      if (error.response?.data?.status === "400") {
        setErrorMessage(error.response.data.message || "파일 업로드에 실패했습니다.");
      } else {
        setErrorMessage("파일 업로드에 실패했습니다.");
      }
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalClose = () => {
    setErrorMessage(null);
    if (uploadedFeedId) {
      router.push(`/feed/${uploadedFeedId}`);
      setUploadedFeedId(null);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((_, index) => index !== indexToRemove);

    if (newFiles.length === 0) {
      setFiles(null);
      setPreviews([]);
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      return;
    }

    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);

    // 미리보기 URL 업데이트
    URL.revokeObjectURL(previews[indexToRemove]); // 이전 URL 해제
    setPreviews(previews.filter((_, index) => index !== indexToRemove));
  };

  // 컴포넌트가 언마운트될 때 미리보기 URL 정리
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <>
      <div className={styles.uploadContainer}>
        <label htmlFor="fileInput" className={styles.uploadButton}>
          사진 업로드
        </label>
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {files && files.length > 0 && (
          <div className={styles.fileList}>
            <p>대표이미지를 선택해주세요</p>
            {Array.from(files).map((file, index) => (
              <div
                key={index}
                className={`${styles.fileItem} ${
                  file.type === "image/gif" || file.type === "video/mp4" ? styles.disabled : ""
                } ${index === 0 ? styles.firstFile : ""}`}
                onClick={() => handleThumbnailSelect(index)}
              >
                {file.type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[index]} alt={file.name} className={styles.previewImage} />
                )}
                {file.type.startsWith("video/") && (
                  <video src={previews[index]} className={styles.previewVideo} muted />
                )}
                <p className={styles.fileName}>{file.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className={styles.removeButton}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
            <p>업로드 가능한 최대 파일 크기는 20MB입니다</p>
            <button onClick={handleUpload} disabled={isUploading} className={styles.submitButton}>
              {isUploading ? "업로드 중..." : "업로드하기"}
            </button>
          </div>
        )}
      </div>
      {errorMessage && <ErrorModal message={errorMessage} onClose={handleModalClose} />}
    </>
  );
}
