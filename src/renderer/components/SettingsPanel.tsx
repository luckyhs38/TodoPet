import { useEffect, useState } from 'react';

import type { SpeechBubbleDurationMinutes } from '../../shared/types';

export function SettingsPanel() {
  const [isAutoLaunchEnabled, setIsAutoLaunchEnabled] = useState(false);
  const [isSpeechBubbleEnabled, setIsSpeechBubbleEnabled] = useState(true);
  const [speechBubbleDurationMinutes, setSpeechBubbleDurationMinutes] =
    useState<SpeechBubbleDurationMinutes>(1);
  const [speechBubbleDurationInput, setSpeechBubbleDurationInput] =
    useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadSettings = async (): Promise<void> => {
      try {
        const [autoLaunchEnabled, speechBubbleSettings] = await Promise.all([
          window.desktopPet.getAutoLaunchEnabled(),
          window.desktopPet.getSpeechBubbleSettings(),
        ]);
        if (isActive) {
          setIsAutoLaunchEnabled(autoLaunchEnabled);
          setIsSpeechBubbleEnabled(
            speechBubbleSettings.speechBubbleEnabled,
          );
          setSpeechBubbleDurationMinutes(
            speechBubbleSettings.speechBubbleDurationMinutes,
          );
          setSpeechBubbleDurationInput(
            String(speechBubbleSettings.speechBubbleDurationMinutes),
          );
        }
      } catch (error) {
        console.error('환경설정을 불러오지 못했습니다.', error);
        if (isActive) setMessage('환경설정을 확인하지 못했습니다.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadSettings();

    return () => {
      isActive = false;
    };
  }, []);

  const handleToggleAutoLaunch = async (): Promise<void> => {
    if (isLoading || isSaving) return;

    const nextEnabled = !isAutoLaunchEnabled;
    setIsSaving(true);
    setMessage('');

    try {
      const savedEnabled = await window.desktopPet.setAutoLaunchEnabled(
        nextEnabled,
      );
      setIsAutoLaunchEnabled(savedEnabled);

      if (savedEnabled !== nextEnabled) {
        setMessage('설치된 Windows 앱에서 설정을 확인해 주세요.');
      }
    } catch (error) {
      console.error('자동실행 설정을 변경하지 못했습니다.', error);
      setMessage('자동실행 설정을 변경하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSpeechBubble = async (): Promise<void> => {
    if (isLoading || isSaving) return;

    setIsSaving(true);
    setMessage('');

    try {
      const savedSettings =
        await window.desktopPet.setSpeechBubbleEnabled(
          !isSpeechBubbleEnabled,
        );
      setIsSpeechBubbleEnabled(savedSettings.speechBubbleEnabled);
      setSpeechBubbleDurationMinutes(
        savedSettings.speechBubbleDurationMinutes,
      );
      setSpeechBubbleDurationInput(
        String(savedSettings.speechBubbleDurationMinutes),
      );
    } catch (error) {
      console.error('말풍선 알림 설정을 변경하지 못했습니다.', error);
      setMessage('말풍선 알림 설정을 변경하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeSpeechBubbleDuration = async (
    inputValue: string,
  ): Promise<void> => {
    if (isLoading || isSaving || !isSpeechBubbleEnabled) return;

    const durationMinutes = Number(inputValue);
    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 120
    ) {
      setSpeechBubbleDurationInput(String(speechBubbleDurationMinutes));
      setMessage('표시 시간은 1~120분 사이의 정수로 입력해 주세요.');
      return;
    }

    if (durationMinutes === speechBubbleDurationMinutes) return;

    setIsSaving(true);
    setMessage('');

    try {
      const savedSettings =
        await window.desktopPet.setSpeechBubbleDurationMinutes(
          durationMinutes,
        );
      setSpeechBubbleDurationMinutes(
        savedSettings.speechBubbleDurationMinutes,
      );
      setSpeechBubbleDurationInput(
        String(savedSettings.speechBubbleDurationMinutes),
      );
    } catch (error) {
      console.error('말풍선 표시 시간을 변경하지 못했습니다.', error);
      setMessage('말풍선 표시 시간을 변경하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="settings-stage">
      <section className="todo-panel settings-panel">
        <header className="todo-panel-header settings-header">
          <span aria-hidden="true" />
          <h1 className="todo-panel-title">환경설정</h1>
          <button
            type="button"
            className="todo-close-button"
            aria-label="환경설정 닫기"
            onClick={() => window.close()}
          >
            ×
          </button>
        </header>

        <div className="todo-panel-body settings-body">
          <h2 className="settings-section-title">일반</h2>
          <div className="settings-row">
            <span>Windows 시작 시 자동 실행</span>
            <button
              type="button"
              className="settings-toggle"
              role="switch"
              aria-checked={isAutoLaunchEnabled}
              aria-label="Windows 시작 시 자동 실행"
              disabled={isLoading || isSaving}
              onClick={() => void handleToggleAutoLaunch()}
            >
              <span className="settings-toggle-label">
                {isAutoLaunchEnabled ? 'ON' : 'OFF'}
              </span>
              <span className="settings-toggle-handle" aria-hidden="true" />
            </button>
          </div>

          <h2 className="settings-section-title">알림</h2>
          <div className="settings-row">
            <span>말풍선 알림</span>
            <button
              type="button"
              className="settings-toggle"
              role="switch"
              aria-checked={isSpeechBubbleEnabled}
              aria-label="말풍선 알림"
              disabled={isLoading || isSaving}
              onClick={() => void handleToggleSpeechBubble()}
            >
              <span className="settings-toggle-label">
                {isSpeechBubbleEnabled ? 'ON' : 'OFF'}
              </span>
              <span className="settings-toggle-handle" aria-hidden="true" />
            </button>
          </div>

          <label className="settings-row">
            <span>말풍선 표시 시간</span>
            <span className="settings-duration-control">
              <input
                type="number"
                min={1}
                max={120}
                step={1}
                inputMode="numeric"
                aria-label="말풍선 표시 시간(분)"
                value={speechBubbleDurationInput}
                disabled={isLoading || isSaving || !isSpeechBubbleEnabled}
                onChange={(event) =>
                  setSpeechBubbleDurationInput(event.target.value)
                }
                onBlur={() =>
                  void handleChangeSpeechBubbleDuration(
                    speechBubbleDurationInput,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
              <span>분</span>
            </span>
          </label>
          {message && <p className="settings-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}
