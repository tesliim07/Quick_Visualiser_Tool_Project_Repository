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

    try{
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
    catch {
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
        <h2>Column Data Types</h2>
        <ul>
          { uploadStatus === "File(s) upload successful" ? columnSummary.map((column, index) => (
            <li key={index}>{column}</li>
          )) : null}
        </ul>
      </div> : null}
    </div>
  )

  // const [uploadFile, setUploadFile] = useState<File|null>(null)
  // const [uploadStatus, setUploadStatus] = useState<string>("No File Selected")
  // const [fileType, setFileType] = useState<string>("csv")
  // const [uploadFileExtension, setUploadFileExtension] = useState<string|undefined>("")

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files) {
  //     const selectedFile = event.target.files[0];
  //     const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
  //     setUploadFileExtension(fileExtension);
  //     if (fileExtension === fileType) {
  //       setUploadFile(selectedFile);
  //       setUploadStatus(`${fileType} File selected`);
  //     } else {
  //       setUploadFile(null);
  //       setUploadStatus(`Please select a ${fileType} file`);
  //     }
  //   }
  // };

  // const handleFileTypeChange = (selectedFileType: string) => {
  //   setFileType(selectedFileType);
  //   setUploadFile(null); // Reset the selected file when file type changes
  // }

  // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   if (uploadFile === null) {
  //     setUploadStatus("No file selected");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", uploadFile);
  //   formData.append("fileType", fileType);

  //   try{
  //     const response = await fetch("http://localhost:5000/upload", {
  //       method: "POST",
  //       body: formData
  //     });
  //     if(response.ok){
  //       setUploadStatus("File upload successful");
  //     }else{
  //       setUploadStatus("File upload failed");
  //     }
  //   }
  //   catch {
  //     setUploadStatus("An error occurred while uploading the file");
  //   }
  // };

  // return (
  //   <div>
  //     <h1>Upload Page</h1>
  //     <h2>Please only Upload Files of the following format: CSV, JSON(Disabled)</h2>
  //     <DropDownMenu onFileTypeChange={handleFileTypeChange}/>
  //     <form className="card" onSubmit={handleSubmit}>
  //       <input type="file" onChange={handleFileChange} disabled={fileType === ""}/>
  //       <button type="submit" disabled={uploadFileExtension !== fileType}>
  //         Upload Dataset
  //       </button>     
  //     </form>
  //     {uploadStatus === "No File Selected" ? <p>Please select a {fileType} file</p> : <p>{uploadStatus}</p>}
  //   </div>
  // )
}

export default Upload
