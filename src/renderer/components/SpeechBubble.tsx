interface SpeechBubbleProps {
  todoContent: string;
  remindTime: string;
  onConfirm(): void;
  onClose(): void;
}

export function SpeechBubble({
  todoContent,
  remindTime,
  onConfirm,
  onClose,
}: SpeechBubbleProps) {
  return (
    <aside
      className="speech-bubble"
      data-pet-interactive="true"
      aria-label="할 일 알림"
    >
      <time className="speech-bubble-time" dateTime={remindTime}>
        {remindTime}
      </time>
      <p className="speech-bubble-content">{todoContent}</p>

      <div className="speech-bubble-actions">
        <button type="button" onClick={onConfirm}>
          완료
        </button>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    </aside>
  );
}
