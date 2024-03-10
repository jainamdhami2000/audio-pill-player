import { Card, Button } from "react-bootstrap";
import "./TrackCards.css"; // Assuming you have a CSS file for this component

/**
 * Component to render a collection of track cards.
 *
 * Props:
 * - tracks: Object containing track details.
 * - handleCardClick: Function to handle when a card is clicked.
 * - removeTrack: Function to handle when a track is to be removed.
 */

const TrackCards = ({ tracks, handleCardClick, removeTrack }) => {
  return (
    <div className="track-cards-container">
      {Object.values(tracks).map((track) => (
        <Card
          key={track.id}
          className="track-card"
          onClick={() => handleCardClick(track.name)}
          style={{ backgroundColor: track.color }}
        >
          <Card.Body>
            <Card.Title>{track.name}</Card.Title>
            <Button
              className="card-close-icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevents the card click event
                removeTrack(track.name);
              }}
            >
              &times; {/* Multiplication symbol used as a close icon */}
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default TrackCards;
