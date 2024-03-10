import { Form } from "react-bootstrap";

/**
 * DurationInput is a component for inputting duration.
 * It displays any validation error passed as props.
 *
 * Props:
 * - duration: The current value of the duration input.
 * - onDurationChange: Function to call when the duration changes.
 * - error: Error message to display, if any.
 */

const DurationInput = ({ duration, onDurationChange, error }) => {
  // Function to handle the change event of the input
  const handleChange = (e) => {
    // Call the onDurationChange prop with the new value
    onDurationChange(e);
  };

  return (
    <Form className="mb-3 duration-input">
      <Form.Label>Duration</Form.Label>
      <Form.Control
        type="number"
        placeholder="Enter duration"
        value={duration}
        onChange={handleChange} // Using the handleChange method
        // className="duration-input-control" // Use class instead of inline styles
      />

      {/* Conditionally rendered error message */}
      {error && <div className="text-danger mt-2">{error}</div>}
    </Form>
  );
};

export default DurationInput;
