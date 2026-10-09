import "./ProgressBar.css";
import { useAudioTime } from "../usePlayer";
import { formatTime } from "../types_and_functions";

function ProgressBar() {
  const { currentTime, duration } = useAudioTime();
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="progress_bar_row">
      <span className="progress_time">{formatTime(currentTime)}</span>
      <div className="progress_track">
        <div className="progress_fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress_time">{formatTime(duration)}</span>
    </div>
  );
}

export { ProgressBar };