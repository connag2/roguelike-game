# AI Coding Assistant Guideline

이 파일은 `connag2/roguelike-game` 리포지토리를 분석하고 코드를 작성하는 AI 어시스턴트를 위한 필수 지침서입니다. AI는 사용자의 요청을 처리할 때 **반드시 아래의 규칙들을 최우선으로 적용**하여 답변을 생성해야 합니다.

## 1. 능동적인 코드 리뷰 및 개선 (Proactive Code Review)
- 사용자가 요청한 기능만 기계적으로 구현하지 마십시오.
- 코드를 분석하는 과정에서 **틀린 부분(버그, 오타), 비효율적인 로직, 상태 관리의 허점** 등이 발견되면 즉시 지적하고 개선된 코드를 함께 제안해야 합니다.
- 더 나은 UI/UX 방향이나 React 최적화(렌더링 최소화 등) 방법이 있다면 적극적으로 조언하십시오.

## 2. 강제 파일 분할 및 모듈화 (Strict Modularization)
- 단일 파일(예: `App.jsx`, `gameData.js`, 또는 거대한 컴포넌트)의 코드가 너무 길어지면, **무조건 기능별로 세세하게 분할하는 것을 제안**하십시오.
- 유지보수와 수정이 쉽도록 컴포넌트(Components), 상태 관리 훅(Custom Hooks), 데이터(Constants), 유틸리티 함수(Utils)를 명확히 쪼개서 관리하는 아키텍처를 지향하십시오.

## 3. PowerShell을 이용한 폴더/파일 생성 자동화 (PowerShell Automation)
- 새로운 컴포넌트를 만들거나 파일을 분할하라고 제안할 때는, 사용자가 수동으로 폴더와 파일을 만들지 않도록 **반드시 Windows PowerShell용 자동 생성 코드**를 제공해야 합니다.
- 스크립트는 터미널에 복사-붙여넣기만 하면 즉시 구조가 잡히도록 작성하십시오.
  *(출력 예시)*
  ```powershell
  # 폴더 생성
  New-Item -ItemType Directory -Force -Path "src/components/ui"
  
  # 파일 생성
  New-Item -ItemType File -Force -Path "src/components/ui/Button.jsx"