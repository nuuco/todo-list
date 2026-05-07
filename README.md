# Todo 앱

바닐라 JavaScript로 구현한 반응형 Todo 애플리케이션입니다.

## AI 활용 프롬프트 기록
- [사용한 프롬프트 로그](./PROMPT_LOG.md)
- [개발 계획 문서](./PLAN.md)

## 주요 기능 요약 문서
- Todo CRUD(추가/조회/상태 변경/삭제)
- 할 일 수정(텍스트 클릭 인라인 편집, Enter/blur 저장, Esc 취소)
- 빈값 입력 방지 및 안내 문구 표시
- 완료/미완료 상태 즉시 반영
- 상태 필터링(전체/진행/완료)
- 남은 할 일 개수 실시간 표시
- 입력 글자수/최대 글자수 실시간 표시
- LocalStorage 기반 데이터 및 테마 영구 저장
- 수동 라이트/다크 모드 전환
- 완료 연출(단일 완료 콘페티 + 전체 완료 메가 콘페티/배지/사운드)
- 할 일 증가 시 리스트 영역 내부 스크롤 및 커스텀 스크롤바
- 모바일/태블릿 대응 반응형 레이아웃

## 기술 스택
- HTML5
- CSS3 (반응형, 다크모드)
- Vanilla JavaScript (ES6+)
- Web Storage API (LocalStorage)

## 배포 주소
- [To Do List 웹페이지](https://nuuco.github.io/todo-list/)

## 스크린샷
![Todo 앱 스크린샷](./screenshot.png)

## 개발 회고록
기본 기능 구현은 계획 단계에서 빠르게 마무리했지만, 최종적으로는 심플하고 깔끔하며 가독성 높은 형태를 목표로 CSS 디테일을 반복적으로 조정했습니다.  
작은 간격, 정렬, 타이포 차이도 전체 인상에 영향을 주기 때문에 전반적인 톤이 자연스럽게 이어지도록 세밀하게 보완했습니다.

특히 중점적으로 다룬 부분은 할 일 CRUD 흐름의 일관성이었습니다.  
수정 기능은 별도 버튼 대신 텍스트 클릭 인라인 편집 방식으로 구성해 화면 복잡도를 줄이고, 입력-저장 흐름을 단순하게 유지했습니다.  
추가로 완료 시 콘페티와 효과음을 적용하고, 전체 완료 시에는 강화된 연출을 넣어 상호작용 피드백을 명확하게 구성했습니다.

이번 작업에서 새로웠던 점은 효과음을 파일이 아닌 코드로 생성한 부분입니다.  
초기에는 외부 음원 파일을 연결해야 한다고 생각했지만, Web Audio API로 간단한 비트음을 직접 만들 수 있다는 점을 확인했고, 향후 유사한 인터랙션 구현에도 활용 가능성이 높다고 판단했습니다.

효과음 구현 코드 참고:
```javascript
function playSingleCompleteSound() {
  if (reducedMotionMedia.matches) return;

  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(740, now);
  oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.17);
}
```
