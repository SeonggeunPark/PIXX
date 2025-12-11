# PIXX
![PIXX_main](/uploads/a16ab69d5690f9c1757cc4b7f1378aee/PIXX_main.png)
## 목차
1. [프로젝트 콘셉트](#프로젝트-콘셉트)
2. [핵심 기능](#핵심-기능)
3. [추가 기능](#추가-기능)
4. [기능 소개](#기능-소개)
5. [기술 스택](#기술-스택)
   - [Management Tool](#management-tool)
   - [IDE](#ide)
   - [Infra](#infra)
   - [Frontend](#frontend)
   - [Backend](#backend)
6. [서비스 아키텍처](#서비스-아키텍처)
7. [설계 문서](#설계-문서)
   - [요구사항 정의서](#요구사항-정의서)
   - [기능 명세서](#기능-명세서)
   - [Flow Chart](#flow-chart)
   - [Mockup](#mockup)
   - [API 명세서](#api-명세서)
8. [ERD](#erd)
9. [프로젝트 구조](#프로젝트-구조)
   - [Frontend](#frontend-1)
   - [Backend](#backend-1)
10. [포팅메뉴얼](#포팅메뉴얼)
11. [발표자료](#발표자료)
12. [팀 구성원](#팀-구성원)

## 프로젝트 콘셉트
### 네컷 사진 아카이브 플랫폼
    → QR 기반으로 사진, GIF, 영상을 자동으로 저장하고, 날짜·장소·브랜드·인물 등 메타정보 기반으로 사진들을 정리하여
      사용자는 단순 저장을 넘어서 추억의 "맥락"까지 함께 기록하고 체계적으로 관리할 수 있습니다.

### 핵심 기능
- **QR 코드 기반 자동 저장 (크롤링)**
  - 네컷 사진 QR 코드 인식 기반으로 사진·영상·GIF 자동 크롤링 및 저장
  - 크롤링된 여러 파일을 하나의 피드(feed) 로 통합 관리
  - 사용자가 직접 사진·영상·GIF 파일 다중 업로드 가능
- **촬영 정보 기반 자동 정리**
  - 촬영 브랜드, 날짜, 위치 등 사진 메타데이터 기반으로 자동 분류
  - 사용자가 직접 촬영 정보를 편집하여 추가·수정 가능
- **개인화된 앨범 관리**
  - 즐겨찾기 기능을 통해 자주 보는 피드를 빠르게 접근
  - 사용자가 직접 앨범을 생성해 별도 보관 가능
- **AI 얼굴 인식 자동 분류**
  - 사진 속 인물의 얼굴을 인식해 사람별 자동 분류 및 관리
  - 인물별로 필터링해 원하는 사진을 쉽게 찾기 가능

### 상세 기능
- **회원 관리**
  - Spring Security와 JWT를 활용한 인증 시스템 구축
  - kakao 로그인으로 간편한 회원가입 및 로그인 구현
- **파일 보안 관리**
  - AWS S3를 활용한 파일 스토리지 관리
  - CloudFront Signed URL 기반 접근 제한으로 민감한 사진 데이터 보호
- **피드 상세정보 관리**
  - 해시태그 추가, 피드 제목, 촬영 날짜, 촬영 위치, 브랜드 정보 등을 자유롭게 추가·수정 가능
  - 피드별 상세 메타데이터 관리 기능 제공
- **필터링 및 정렬**
  - 브랜드별, 최신순, 오래된 순 등 다양한 필터링 옵션 제공
  - 특정 앨범 또는 특정 인물(얼굴인식 AI) 기준으로 사진 조회 가능

## 기능 소개
### 메인 화면 (작성 예정)\



## 기술 스택

### Management Tool

![gitlab](https://img.shields.io/badge/gitlab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![jira](https://img.shields.io/badge/jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)
![notion](https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![figma](https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

### IDE

![intellij](https://img.shields.io/badge/intellij_idea-000000?style=for-the-badge&logo=intellijidea&logoColor=white)
![vscode](https://img.shields.io/badge/vscode-0078d7?style=for-the-badge&logo=visual%20studio&logoColor=white)
![postman](https://img.shields.io/badge/postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

### Infra

![amazonec2](https://img.shields.io/badge/amazon%20ec2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![AWS RDS](https://img.shields.io/badge/AWS_RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![AWS CloudFront](https://img.shields.io/badge/AWS_CloudFront-8933CD?style=for-the-badge&logo=amazon&logoColor=white)
![GCP](https://img.shields.io/badge/GCP-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![docker](https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![docker-compose](https://img.shields.io/badge/Docker_Compose-393E46?style=for-the-badge&logo=docker&logoColor=white)
![ubuntu](https://img.shields.io/badge/ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
 <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white">


### Frontend

![html](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![css3](https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white) 
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
<img src="https://img.shields.io/badge/Typescript_-3178C6?style=for-the-badge&logo=Typescript&logoColor=white"> 
<img src="https://img.shields.io/badge/React_-61DAFB?style=for-the-badge&logo=React&logoColor=white"> 
![nodejs](https://img.shields.io/badge/nodejs-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
<img src="https://img.shields.io/badge/React Query_-61DAFB?style=for-the-badge&logo=React&logoColor=white">
<img src="https://img.shields.io/badge/AXIOS-000000?style=for-the-badge&logo=&logoColor=white">


### Backend

![java](https://img.shields.io/badge/Java-007396?style=for-the-badge)
![springboot](https://img.shields.io/badge/spring%20boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![springjpa](https://img.shields.io/badge/spring%20jpa-6DB33F?style=for-the-badge&logo=Spring&logoColor=white)
![springsecurity](https://img.shields.io/badge/spring%20security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![jwt](https://img.shields.io/badge/jwt-000000?style=for-the-badge&logo=jwt&logoColor=white)
![mysql](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white)


## 서비스 아키텍처
![architecture](/uploads/20b1626a2edc018e027e53641e14e5c5/architecture.png)

## 설계 문서

### [요구사항 정의서](https://bottlenose-twist-ec3.notion.site/1dcb7e3f38b88091a73bf22d8eb056bd?pvs=4)

### [기능 명세서](https://www.notion.so/1dcb7e3f38b88031b1d6f4fee7e261c8?pvs=4)

### [Flow Chart](https://bottlenose-twist-ec3.notion.site/1fab7e3f38b8800fa4f0db8199ff5a04?pvs=4)

### [와이어프레임](https://bottlenose-twist-ec3.notion.site/1ddb7e3f38b880d496a2c1959be8f01f?pvs=4)

### [API 명세서](https://bottlenose-twist-ec3.notion.site/API-1ddb7e3f38b880c3a12fdecf25504498?pvs=4) 

## ERD
![ERD](/uploads/5026f43f3702a3cbab36f26e5822ef43/ERD.png)

## 프로젝트 구조
### Frontend
```
frontend/
├── public/                   # 정적 파일 (favicon, index.html, 이미지/아이콘 등)
├── src/                      # 애플리케이션 코드
│   ├── app/                  # Next.js App Router 루트(레이아웃, 페이지, 전역 CSS)
│   │   ├── layout.tsx        # 전체 레이아웃 정의
│   │   ├── page.tsx          # 루트 페이지
│   │   └── ...               # (with-menubar/, oauth/callback/, profile/, welcome/ 등)
│   │
│   ├── components/           # UI 컴포넌트 모음
│   │   ├── album/            # 앨범 리스트·로딩·선택 바 등
│   │   ├── feed/             # 피드 리스트·정렬 바·모달 등
│   │   ├── people/           # 사용자 목록·상세 컴포넌트
│   │   │   └── people-feed/  #   └─ 사람별 피드 그리드/리스트 컴포넌트 집합
│   │   └── common/           # 버튼·모달·아이콘 등 공통 컴포넌트
│   │
│   ├── apis/                 # REST API 호출 함수 (auth/, feed/, album/ 등)
│   ├── hooks/                # 커스텀 React 훅 모음
│   ├── stores/               # Zustand 상태 관리 파일
│   ├── utils/                # 날짜 포맷터, 에러 처리 등 유틸 함수
│   ├── types/                # 공통 타입 정의 (API 응답, 컴포넌트 Props 등)
│   ├── App.tsx               # 루트 컴포넌트 (공통 프로바이더 포함)
│   └── index.tsx             # ReactDOM 진입점
│
├── .env.development          # 개발 환경 변수
├── next.config.ts            # Next.js 커스텀 설정
├── tsconfig.json             # TypeScript 컴파일러 설정
├── package.json              # 의존성 및 스크립트
├── .eslintrc.json            # ESLint 설정
├── Dockerfile                # 컨테이너 이미지 빌드 설정
└── README.md                 # 프로젝트 개요 및 실행 방법
```

### Backend
```
backend/
├── .gitignore                # Git 무시 파일 목록
├── Dockerfile                # 도커 이미지 빌드 설정
├── build.gradle              # Gradle 빌드 스크립트
├── settings.gradle           # Gradle 설정 (프로젝트 이름 등)
├── gradlew                   # Gradle wrapper 실행 스크립트
├── gradle/
│   └── wrapper/              # Gradle wrapper 관련 파일
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
│
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/ssafy/fourcut/
    │   │       ├── FourcutApplication.java
    │   │       │   # Spring Boot 애플리케이션 진입점
    │   │       ├── domain/                
    │   │       │   # 핵심 도메인 로직
    │   │       │
    │   │       │   ├── faceDetection/       
    │   │       │   │   # 얼굴 인식 기능 (controller, service, repository, dto, entity)
    │   │       │   ├── image/               
    │   │       │   │   # 이미지 처리 기능 (controller, service, repository, dto, entity)
    │   │       │   ├── user/                
    │   │       │   │   # 사용자 관련 기능 (controller, service, repository, dto, entity)
    │   │       │   └── TestController.java  
    │   │       │       # 간단 기능 테스트용 컨트롤러
    │   │       │
    │   │       └── global/                
    │   │           # 전역 설정 및 공통 모듈
    │   │
    │   │           ├── config/              
    │   │           │   # CORS, 보안, RestTemplate 등 설정 클래스
    │   │           │
    │   │           ├── dto/                 
    │   │           │   # 공통 API 응답용 DTO (ApiResponse 등)
    │   │           │
    │   │           ├── exception/           
    │   │           │   # 예외 정의 및 전역 핸들러
    │   │           │
    │   │           ├── s3/                  
    │   │           │   # S3 업로드 로직 (S3Config, S3Uploader)
    │   │           │
    │   │           └── security/            
    │   │               # JWT 인증 필터 및 토큰 제공자
    │   │
    │   └── resources/
    │       ├── application.yml            
    │       │   # Spring 설정 (포트, DB, S3, JWT 등)
    │       └── logback-spring.xml         
    │           # 로깅 설정
    │
    └── test/
        └── java/
            └── com/ssafy/fourcut/
                └── FourcutApplicationTests.java  # 기본 통합 테스트 클래스
```

## [포팅메뉴얼](https://bottlenose-twist-ec3.notion.site/1fab7e3f38b8803bbb4ad5a231930ca6?pvs=4)

## 팀 구성원

| 역할   | 이름   | 담당 업무                          |
| ------ | ------ | --------------------------------- |
| **FE** | 이현희 | 피드 관리 구현, 앨범 관리 구현 |
| **FE** | 민승용 | qr인식 및 파일 업로드 구현, 카카오 로그인 구현, 가이드 페이지 구현|
| **BE** | 황대규 | AI 얼굴 인식 구현, Fast API 구현, 피드·앨범·얼굴 별 사진 관리 API 구현 |
| **BE** | 김세림 | 카카오 로그인 구현, HttpOnly 적용, AI 얼굴 분류 구현 |
| **BE** | 송용인 | QR 및 FILE 업로드 API 구현, 브랜드 별 크롤링 로직 구현, CloudFront Signed URL을 적용한 S3 조회 API 구현               |
| **INFRA** | 박성근 | Jenkins 및 Docker 기반 CI/CD 파이프라인 구축, Blue/Green 무중단 배포 구현, AWS RDS·S3·CloudFront 인프라 운영 담당          |

