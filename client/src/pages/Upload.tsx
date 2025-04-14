import { useCallback, useState } from 'react'
import { useDropzone } from "react-dropzone"
import DropDownMenu from '../components/DropDownMenu'
import ColumnProperties from '../components/ColumnProperties'
import "./Upload.css"
import axios from 'axios';

const Upload : React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<string>("csv");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [disableUploadButton, setDisableUploadButton] = useState<boolean>(true);
  const maxFileSizeInMB = 21;

  //Function to handle file selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxFileSizeInMB * 1024 * 1024);
    const validFiles = acceptedFiles.filter(file => file.size <= maxFileSizeInMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map(file => file.name).join(", ");
      alert(`The following files are larger than ${maxFileSizeInMB}MB and won't be uploaded: ${names}`);
    }
    setFiles(validFiles)
    setUploadStatus("");
    if (validFiles.length > 0){
      setDisableUploadButton(false);
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
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post("http://localhost:5000/uploadFiles", formData, {
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
              <div key={index}>
                <li>{file.name}  — {(file.size / (1024 * 1024)).toFixed(2)} MB</li>
                <button disabled={uploadStatus === "File(s) upload successful" } className="remove-file-button" onClick={() => setFiles(files.filter((_, i) => i !== index))}>Remove</button>
              </div>
            ))}
          </ul>
      </div>
      <p className="upload-status">{uploadStatus}</p>
      {uploadStatus === "File(s) upload successful" ? <ColumnProperties /> : null}
    </div>
  )
}

export default Upload
