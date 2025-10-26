#front-mission

## 🚩 개요
- **프로젝트 이름** : front-mission
- **프로젝트 기간** : 2025.10.20 ~ 2025.10.27
- **배포 주소** : https://front-mission.vercel.app/

<br>

## 🛠️ 기술 스택
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20Web%20Tokens&logoColor=white)
![Google Fonts](https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white)

<br>

## ✨ 주요 기능

**1. 회원가입**
- 이메일 입력 후 도메인 우측에 있는 확인 버튼 클릭<strong>(필수)</strong>
  - 이메일 입력 시 영문과 숫자 조합만 사용 가능하며, 숫자로는 시작할 수 없습니다. 도메인을 반드시 선택 또는 입력해주세요.
- 비밀번호와 비밀번호 재확인 입력 후 우측에 있는 확인 버튼 클릭 <strong>(필수)</strong>
  - 비밀번호 입력 시 8자 이상, 영문자/숫자/특수문자 각 1개 이상 포함해야 합니다.
- 회원가입 버튼이 초록색으로 바뀌지 않았다면 입력하신 정보를 다시 확인해주세요.
- 회원가입 버튼 클릭 시 회원가입이 완료되고 Home 화면으로 이동합니다.

##2. 로그인##
- Home화면의 우측 상단에 있는 로그인 버튼을 클릭하여 로그인 모달을 열 수 있습니다.
- Email 입력 후, 도메인을 선택 또는 직접 입력을 선택하여 입력 후 비밀번호를 입력해주세요.
- 로그인 모달 하단에 있는 로그인 정보 저장 체크박스 선택 시, 로그인 정보가 기록되어 다음에 접속할때 자동 로그인이 됩니다.
- Email: developer@bigs.or.kr Password: 123qwe!@# 계정으로 접속해주세요.
  - 해당 이메일로 접속 시, 많은 게시글을 확인하실 수 있습니다.
- 로그인을 하지 않으면 모든 서비스를 이용할 수 없습니다.
 
##3. 게시글 목록조회 기능##
- 로그인 후 Home 화면 기준 우측 상단에 있는 "전체", "공지", "자유", "Q&A", "기타" 버튼을 선택하여 필터링해서 볼 수 있습니다.
- 필터링 버튼 하단에 있는 최신글 클릭 시 최신글부터 보기, 오래된글부터 보기(드롭다운) 설정을 선택할 수 있습니다.
  - 기본값은 최신글로 설정되어 있습니다.
- 글쓰기 버튼 클릭 시, 게시글 작성 페이지로 이동합니다.
- Home 화면에 있는 게시글 클릭 시, 해당 게시글의 상세 페이지로 이동합니다.

##4. 게시글 검색 기능##
- Home 화면 기준 좌측 검색바에서 제목을 검색하여 게시글을 찾고, 검색 결과 게시글 선택 시, 해당 게시글로 이동합니다.
  - 검색 시, 우측에 실시간으로 필터링 되어 게시글이 렌더링 됩니다.
  - 768 * 1080 이하는 검색바가 상단으로 올라가고, 회원의 정보는 우측 하단에 있는 프로필 호버 시, 확인할 수 있습니다.

##5. 게시글 작성 기능###
- Home 화면의 우측 상단에 글쓰기 버튼 클릭 시, 게시글 작성 페이지로 이동합니다.
- 카테고리와, 게시글 제목, 내용은 필수로 작성해야합니다.
  - 첨부파일(이미지)는 선택사항입니다.
- 내용을 모두 입력 후 작성완료 버튼 클릭 시, 게시글 작성이 완료됩니다.
- 뒤로가기 버튼 클릭 시, Home 화면으로 이동합니다.

##6. 게시글 상세조회 기능##
- 게시글 상세 페이지의 우측 상단에 수정 버튼과 삭제 버튼이 있습니다.
  - 수정 버튼 클릭 시, 게시글 수정 페이지로 이동하고, 삭제 버튼 클릭 시 상단에 안내문이 나옵니다.
- 뒤로가기 버튼 클릭 시, Home 화면으로 이동합니다.

##7. 게시글 수정 기능##
- 게시글 수정은 카테고리, 제목, 내용, 이미지를 수정할 수 있습니다.
  - 제목, 내용은 공백이 될 수 없습니다.
- 수정 완료 버튼 클릭 시, 수정이 완료되며 수정 완료 된 게시글의 상세 페이지로 이동합니다.

##8. 게시글 삭제 기능##
- 게시글 상세 페이지에서 삭제 버튼 클릭 후, 정말 삭제하시겠습니까? 안내문에서 확인 클릭 시, 삭제 후 Home 화면으로 이동합니다.


