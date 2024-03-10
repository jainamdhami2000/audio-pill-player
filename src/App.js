import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import DurationInput from "./components/DurationInput";
import FileUpload from "./components/FileUpload";
import PlaybackControls from "./components/PlaybackControls";
import TrackTimeline from "./components/TrackTimeline";
import TrackCards from "./components/TrackCards";

const App = () => {
  const [duration, setDuration] = useState(40); // Default duration of 40s
  const [tracks, setTracks] = useState({}); // Store track data
  const [trackInstances, setTrackInstances] = useState([]); // Store track instances
  const [lastTrackInstanceId, setLastTrackInstanceId] = useState(0); // Track instance ID counter
  const [playbackPosition, setPlaybackPosition] = useState(0); // Playback position in percentage
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const [durationError, setDurationError] = useState(""); // Duration error message
  const [fileUploadError, setFileUploadError] = useState(""); // File upload error message

  // Refs to keep track of mutable values like audio elements and timeouts
  const playbackRef = useRef(null); // Reference to the playback interval
  const timeoutRefs = useRef({}); // Store playback start timeouts
  const audioRefs = useRef({}); // Store audio elements
  const trackInstancesRef = useRef(trackInstances); // Reference to track instances

  // Update the playback position whenever currentTime or duration changes
  useEffect(() => {
    const newPlaybackPosition = (currentTime / duration) * 100;
    setPlaybackPosition(newPlaybackPosition);
  }, [currentTime, duration]);

  // Function to update track instances and the ref
  const updateTrackInstances = (newTrackInstances) => {
    setTrackInstances(newTrackInstances);
    trackInstancesRef.current = newTrackInstances;
  };

  // Function to handle duration change
  const handleDurationChange = (e) => {
    const newDuration = Number(e.target.value);

    // Find the maximum duration among all track instances
    const maxTrackDuration = Math.max(
      ...trackInstances.map((track) => track.duration),
      0
    );

    if (newDuration < maxTrackDuration) {
      setDurationError(
        `Duration cannot be less than the longest track instance of ${maxTrackDuration.toFixed(
          1
        )}s.`
      );
    } else {
      setDuration(newDuration);
      setDurationError(""); // Clear error if the new duration is valid
    }
  };

  // Function to handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formattedName = file.name.replace(/\.[^/.]+$/, ""); // Removes the extension

    // Check if track is already present
    if (tracks[formattedName]) {
      setFileUploadError("This track has already been uploaded.");
      // Reset the file input
      e.target.value = "";
      return;
    }
    setFileUploadError(""); // Clear error if all checks pass

    const newTrack = {
      id: uuidv4(),
      name: formattedName,
      color: `#${Math.floor(Math.random() * 0xcccccc + 0x333333).toString(16)}`, // Ensures color is never too light
      duration: 0,
      src: URL.createObjectURL(file), // Create a local URL for the file
    };

    // Create a new audio element to load metadata
    const audio = new Audio(newTrack.src);
    audio.onloadedmetadata = () => {
      newTrack.duration = audio.duration;
      setTracks((prevTracks) => ({ ...prevTracks, [newTrack.name]: newTrack }));
    };

    // After setting the track in state, reset the file input
    e.target.value = "";
  };

  // Function to handle card click
  const handleCardClick = (trackName) => {
    const track = tracks[trackName];
    // Check if the track duration is greater than the timeline duration
    if (track.duration > duration) {
      setDurationError(
        "Please increase Duration as the track duration is greater than the timeline duration."
      );
      return; // Prevent adding the track instance
    }
    setDurationError(""); // Clear error if all checks pass
    const newTrackInstance = {
      ...tracks[trackName],
      instanceId: lastTrackInstanceId + 1, // Increment the instance ID for each new instance
      start: 0, // Default start time is 0
    };

    updateTrackInstances([...trackInstances, newTrackInstance]);
    setLastTrackInstanceId(lastTrackInstanceId + 1); // Update the last used ID
  };

  // New function to handle mouse drag on the red line
  const handleMouseDown = (e) => {
    e.preventDefault();

    // Find the timeline container
    const timelineContainer = document.querySelector(".timeline-container");

    // Ensure the timelineContainer is found
    if (timelineContainer) {
      // Then, attach mousemove and mouseup event listeners
      const handleMouseMove = (moveEvent) => {
        const rect = timelineContainer.getBoundingClientRect();
        // Calculating the playback position within the timeline bounds
        const position = (moveEvent.clientX - rect.left) / rect.width;
        const newPosition = Math.max(
          0,
          Math.min(position * duration, duration)
        );
        setCurrentTime(Math.round(newPosition * 10) / 10);
      };

      // Cleanup function to remove event listeners
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Function to remove a track
  const removeTrack = (trackName) => {
    // Remove track from the track list
    const updatedTracks = { ...tracks };
    delete updatedTracks[trackName];
    setTracks(updatedTracks);

    // Remove all instances of that track from the trackInstances array
    const updatedTrackInstances = trackInstances.filter(
      (instance) => instance.name !== trackName
    );

    // Update track instances and ref
    updateTrackInstances(updatedTrackInstances);

    // Also, stop and remove any playing audio elements for the removed track
    Object.entries(audioRefs.current).forEach(([instanceId, audio]) => {
      if (audio && trackInstancesRef.current[instanceId]?.name === trackName) {
        audio.pause();
        delete audioRefs.current[instanceId];
      }
    });
  };

  // Function to remove a track instance
  const removeTrackInstance = (instanceId) => {
    // Stop and remove the audio element for this instance
    if (audioRefs.current[instanceId]) {
      audioRefs.current[instanceId].pause();
      audioRefs.current[instanceId].src = ""; // Clear the src
      delete audioRefs.current[instanceId];
    }
    // Clear any pending playback start timeout for this instance
    if (timeoutRefs.current[instanceId]) {
      clearTimeout(timeoutRefs.current[instanceId]);
      delete timeoutRefs.current[instanceId];
    }

    // Remove this instance from the trackInstances state
    updateTrackInstances(
      trackInstances.filter((instance) => instance.instanceId !== instanceId)
    );
  };

  // Function to start playback
  const startPlayback = () => {
    setIsPlaying(true);

    // Start playback for each track instance
    trackInstancesRef.current.forEach((instance) => {
      const track = tracks[instance.name];
      const audio =
        audioRefs.current[instance.instanceId] || new Audio(track.src);
      audioRefs.current[instance.instanceId] = audio;

      // Calculate the start time for each instance
      const startTime = instance.start - currentTime;
      // If the start time is positive, start playback after the timeout
      if (startTime > 0) {
        audio.currentTime = 0;
        timeoutRefs.current[instance.instanceId] = setTimeout(() => {
          audio
            .play()
            .catch((error) => console.error("Playback failed:", error));
        }, startTime * 1000);
      } else if (-startTime < track.duration) {
        // If the start time is negative, start playback from the correct position
        audio.currentTime = -startTime;
        audio.play().catch((error) => console.error("Playback failed:", error));
      }
    });

    // Start the playback interval
    clearInterval(playbackRef.current);
    // Update the playback position every 100ms
    playbackRef.current = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 0.1;
        if (nextTime >= duration) {
          clearInterval(playbackRef.current);
          setIsPlaying(false);
          return duration;
        }
        return nextTime;
      });
    }, 100);
  };

  // Function to pause playback
  const pausePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(playbackRef.current);
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      Object.values(timeoutRefs.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current = {}; // Reset timeouts
    }
  };

  // Function to handle mouse drag on the track pill
  const handlePillMouseDown = (e, instanceId) => {
    e.preventDefault();

    const wasPlaying = isPlaying;

    if (isPlaying) {
      pausePlayback();
    }

    const timelineContainer = document.querySelector(".timeline-container");
    const pillElement = e.target.closest(".track-pill"); // Get the pill element

    // Calculate the click position within the pill
    const clickOffsetX = e.clientX - pillElement.getBoundingClientRect().left;

    // Ensure the timelineContainer and pillElement are found
    if (timelineContainer && pillElement) {
      const handleMouseMove = (moveEvent) => {
        const rect = timelineContainer.getBoundingClientRect();
        let newStart =
          ((moveEvent.clientX - rect.left - clickOffsetX) / rect.width) *
          duration; // Adjust start based on click offset
        // Ensure the new start time is within bounds
        newStart = Math.max(
          0,
          Math.min(
            newStart,
            duration -
              trackInstancesRef.current.find(
                (inst) => inst.instanceId === instanceId
              ).duration
          )
        );
        const newTrackInstances = trackInstancesRef.current.map((instance) =>
          instance.instanceId === instanceId
            ? { ...instance, start: newStart }
            : instance
        );

        updateTrackInstances(newTrackInstances);
      };

      // Cleanup function to remove event listeners
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (wasPlaying) {
          startPlayback();
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  // Function to restart playback
  const restartPlayback = () => {
    if (isPlaying) {
      pausePlayback();
    }
    setCurrentTime(0);
    // Reset all audio elements to the start
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.currentTime = 0;
      }
    });
  };

  return (
    <div
      style={{ backgroundColor: "#121212", minHeight: "100vh", color: "white" }}
    >
      <Container
        className="py-5"
        style={{ minHeight: "100vh", display: "flex", flexFlow: "column" }}
      >
        <Row className="justify-content-center">
          <Col md={6}>
            {/* Component to input and validate duration */}
            <DurationInput
              duration={duration}
              onDurationChange={handleDurationChange}
              error={durationError}
            />
          </Col>
          <Col md={6}>
            {/* Component to upload and validate track files */}
            <FileUpload
              onFileUpload={handleFileUpload}
              error={fileUploadError}
            />
          </Col>

          {/* Component to display and manage track cards */}
          <TrackCards
            tracks={tracks}
            handleCardClick={handleCardClick}
            removeTrack={removeTrack}
          />
        </Row>

        {/* Component to control track playback */}
        <PlaybackControls
          isPlaying={isPlaying}
          onPlay={startPlayback}
          onPause={pausePlayback}
          onRestart={restartPlayback}
          currentTime={currentTime}
          duration={duration}
          trackInstances={trackInstances}
        />

        {/* Component to display and interact with the track timeline */}
        <TrackTimeline
          onRemoveTrack={removeTrackInstance}
          trackInstances={trackInstances}
          duration={duration}
          handlePillMouseDown={handlePillMouseDown}
          handleMouseDown={handleMouseDown}
          playbackPosition={playbackPosition}
        />
      </Container>
    </div>
  );
};

export default App;
