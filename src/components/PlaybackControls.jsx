import { Button } from "react-bootstrap";
import {
  PlayFill,
  PauseFill,
  ArrowCounterclockwise,
} from "react-bootstrap-icons";
import "./PlaybackControls.css"; // Assuming you have a CSS file for this component

/**
 * PlaybackControls component to provide play, pause, and restart functionality.
 *
 * Props:
 * - isPlaying: Boolean indicating whether playback is active.
 * - onPlay: Function to call when the play button is clicked.
 * - onPause: Function to call when the pause button is clicked.
 * - onRestart: Function to call when the restart button is clicked.
 * - playbackPosition: The current position of playback.
 * - currentTime: The current time of the track.
 * - duration: The total duration of the track.
 * - trackInstances: The list of track instances to determine if there are tracks present.
 */

const PlaybackControls = ({
  isPlaying,
  onPlay,
  onPause,
  onRestart,
  currentTime,
  duration,
  trackInstances,
}) => {
  return (
    <div className="playback-controls">
      <Button
        variant="outline-secondary"
        onClick={onRestart}
        className="control-button"
      >
        <ArrowCounterclockwise size={32} />
      </Button>
      <Button
        variant="outline-secondary"
        disabled={trackInstances.length === 0}
        onClick={isPlaying ? onPause : onPlay}
        className="control-button"
      >
        {isPlaying ? <PauseFill size={32} /> : <PlayFill size={32} />}
      </Button>
      <span className="time-display">
        Time: {currentTime.toFixed(1)} / {duration}
      </span>
    </div>
  );
};

export default PlaybackControls;
