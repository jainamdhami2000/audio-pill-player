import { Form } from "react-bootstrap";

/**
 * FileUpload is a component that provides an interface to upload files.
 * It displays an error message if any error occurs during file upload.
 *
 * Props:
 * - onFileUpload: Function to call when a file is selected for upload.
 * - error: Error message to display, if any.
 */

const FileUpload = ({ onFileUpload, error }) => {
  return (
    <Form.Group controlId="formFile" className="mb-3">
      <Form.Label>Upload Track</Form.Label>
      <Form.Control type="file" onChange={onFileUpload} />
      {error && <div className="text-danger mt-2">{error}</div>}
    </Form.Group>
  );
};

export default FileUpload;
