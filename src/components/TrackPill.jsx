import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { XCircleFill } from "react-bootstrap-icons";
import "./TrackPill.css"; // CSS file for the TrackPill component

/**
 * Component representing an individual track pill.
 *
 * Props:
 * - track: Object containing track details (name, color, duration, start).
 * - index: The index of the track in the list for top margin calculation.
 * - onRemove: Function to call when the remove button is clicked.
 * - duration: The total duration of the timeline for width calculation.
 * - handlePillMouseDown: Function to handle mouse down event for dragging.
 */

const TrackPill = ({
  track,
  index,
  onRemove,
  duration,
  handlePillMouseDown,
}) => {
  return (
    <OverlayTrigger
      key={track.id}
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${track.id}`}>
          Name: {track.name} <br />
          Start: {Math.round(track.start * 10) / 10}s <br />
          Duration: {Math.round(track.duration * 10) / 10}s
        </Tooltip>
      }
    >
      <div
        className={`track-pill ${index === 0 ? "first" : ""}`}
        onMouseDown={(e) => handlePillMouseDown(e, track.instanceId)}
        style={{
          backgroundColor: track.color,
          width: `${(track.duration / duration) * 100}%`,
          marginLeft: `${(track.start / duration) * 100}%`,
        }}
      >
        <XCircleFill className="remove-button" onClick={() => onRemove()}>
          {/* Icon is self-explanatory, no need for &times; */}
        </XCircleFill>
      </div>
    </OverlayTrigger>
  );
};

export default TrackPill;
