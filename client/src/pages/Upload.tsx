import { useCallback, useState } from 'react'
import { useDropzone } from "react-dropzone"
import DropDownMenu from '../components/DropDownMenu'
import "./Upload.css"
import axios from 'axios';

const Upload : React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<string>("csv");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [columnSummary, setColumnSummary] = useState<string[]>([]);
  const [disableUploadButton, setDisableUploadButton] = useState<boolean>(true);
  const [enableDisplayColumnSummaryButton, setEnableDisplayColumnSummaryButton] = useState<boolean>(true);

  //Function to handle file selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setUploadStatus("");
    setColumnSummary([]);
    if (acceptedFiles.length > 0){
      setDisableUploadButton(false);
      setEnableDisplayColumnSummaryButton(true);
    }
  }, [])


  //configure react-dropzone
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: fileType === "csv" ? { 'text/csv': ['.csv'] } : {'application/json': ['.json']},
    multiple: true
  })


  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if(response.status === 200){
        setUploadStatus("File(s) upload successful");
        setDisableUploadButton(true);
      }else{
        setUploadStatus("File(s) upload failed");
      }
    }
    catch(error){
      console.log(error);
      setUploadStatus("An error occurred while uploading the file");
    }
  };

  const handleDisplayColumnSummary = async() => {
    try{
      const response = await axios.get("http://localhost:5000/getColumnDataTypesWithTheirBadDataPercentage");
      if(response.status === 200){
        setColumnSummary(response.data);
        setEnableDisplayColumnSummaryButton(false);
      }
    }
    catch (error) {
      console.error("Error fetching column types:", error);
    }
  }

  const handleUserConfigurationInterface = () => {
    window.location.href = '/user-configuration-interface';
  }

  return (
    <div className="upload-container">
      <h1>Upload your Dataset(s)</h1>
      <DropDownMenu onFileTypeChange={setFileType}/>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {
          isDragActive ? <p>Drop the file(s) here ...</p> : 
          <p>Drag and drop some file(s) here, or click to select file(s) </p>
        }
      </div>
      <form onSubmit={handleUpload}>
        <button type="submit" disabled={disableUploadButton} className="upload-button">Upload</button>
      </form>
      <div className="file-list">
        <h2>Files</h2>
          <ul>
            {files.map((file, index)=> (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
      </div>
      <p className="upload-status">{uploadStatus}</p>
      {uploadStatus === "File(s) upload successful" ? <button onClick={handleDisplayColumnSummary} disabled={!enableDisplayColumnSummaryButton} className="display-column-summary-button">Display Column Summary</button> : null}
      {columnSummary.length > 0 ? <div>
        <h2>Column Data Types with Bad Data Percentage</h2>
        <ul>
          { uploadStatus === "File(s) upload successful" ? columnSummary.map((column, index) => (
            <li key={index}>{column}</li>
          )) : null}
        </ul>
      </div> : null}
      { uploadStatus === "File(s) upload successful" ? <div>
        <button type='button' onClick={handleUserConfigurationInterface}>Go to User Configuration Interface</button>
      </div> : null}
    </div>
  )
}

export default Upload
