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

## 스크린샷
![Todo 앱 스크린샷](./screenshot.png)

## 개발 회고록
기본 기능 구현은 계획 문서를 만들 때 이미 어느 정도 끝났지만, 내가 원하는 심플하고 깔끔하고 가독성 좋은 형태로 만들기 위해 CSS를 계속 다듬느라 시간이 꽤 걸렸다.  
그냥 넘어가도 되는 자잘한 부분도 디자이너 자아가 계속 걸렸는데, 그렇게 디테일하게 손보면서 내 마음에 드는 형태로 바뀌는 과정이 제일 재밌었다. 전반적으로 톤이 어울리고 자연스러운 디자인이 되도록 신경썼다.

특히 신경 쓴 부분은 할 일 CRUD 흐름이 매끄럽게 이어지도록 만드는 것이었다.  
수정 UI를 어떻게 가져갈지 고민하다가 텍스트를 클릭하면 바로 편집되는 방식으로 정리했는데, 버튼을 따로 두는 것보다 훨씬 깔끔해서 만족스럽다.  
개인적인 욕심으로 완료 시 콘페티와 효과음을 넣었고, 전체 완료 시에는 더 큰 효과를 추가했다(한 번 다 체크해보세요ㅎㅎ).

새로웠던 점은 효과음 구현이었다. 처음에는 효과음 파일을 직접 구해 붙여야 하나 생각했는데, 요청하니 코드로 바로 만들어져서 꽤 신기했다.  
간단한 비트음을 코드로 만들 수 있다는 걸 알게 돼서, 앞으로도 종종 써볼 수 있을 것 같다.

효과음 코드 참고:
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
