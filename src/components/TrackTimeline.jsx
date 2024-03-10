import TrackPill from "./TrackPill";

const TrackTimeline = ({
  trackInstances,
  duration,
  onRemoveTrack,
  handlePillMouseDown,
  handleMouseDown,
  playbackPosition,
}) => {
  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          marginTop: "20px",
        }}
      >
        {trackInstances.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              height: `${trackInstances.length * 60 + 15}px`,
              left: `${playbackPosition}%`,
              width: "2px",
              backgroundColor: "red",
              cursor: "pointer",
              zIndex: 2,
              transition: "left 0.1s linear", // This creates a smooth transition effect
            }}
            onMouseDown={handleMouseDown} // Call handleMouseDown when the red line is dragged
          />
        )}
      </div>
      <div
        style={{
          background: "#333",
          color: "#fff",
          paddingTop: "20px",
          paddingBottom: "10px",
          flexGrow: "1",
        }}
      >
        {trackInstances.map((track, index) => (
          <TrackPill
            key={track.instanceId}
            track={track}
            index={index}
            onRemove={() => onRemoveTrack(track.instanceId)}
            duration={duration}
            handlePillMouseDown={handlePillMouseDown}
          />
        ))}
      </div>
    </>
  );
};

export default TrackTimeline;
