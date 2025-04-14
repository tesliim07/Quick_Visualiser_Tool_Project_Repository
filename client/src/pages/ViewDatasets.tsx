import axios from 'axios';
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import './ViewDatasets.css';

const ViewDataSets : React.FC = () => {
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [fileInfos, setFileInfos] = useState<string[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const tableViewDataSetsHeader = ["Dataset Name", "Time Uploaded", "Action"];

    useEffect(() => {

        const fetchFileNames = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getFileNames");
                const fileInfoResponse = await axios.get("http://localhost:5000/getFileInfos");
                if (response.status === 200) {
                    setFileNames(response.data);
                    console.log("ViewDataSets: " + response.data)
                }
                if (response.status !== 400 && fileInfoResponse.status === 200) {
                    setFileInfos(fileInfoResponse.data);
                    console.log("ViewDataSetsInfo: " + fileInfoResponse.data)
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 400) {
                    setStatusMessage("No files uploaded yet. Please upload a file first.");
                }
                console.error("Error fetching file name or file info:", error);
            }
        };

        fetchFileNames();
    }, []);

    const removeFile = async (fileName: string) => {
        try {
            const response = await axios.delete(`http://localhost:5000/removeFile/${fileName}`);
            if (response.status === 200) {
                console.log("File removed successfully");
            }
        } catch (error) {
            console.error("Error removing file:", error);
        }
        window.location.reload();
    }

    if (statusMessage) {
        return <h2 style={{ color: "black" }}>{statusMessage}</h2>;
    }
    
    return (
        <div className="container">
            <h1>View Data Sets:</h1>
            <table border={1} style={{ margin: "auto", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                    <tr>
                        {tableViewDataSetsHeader.map((col) => (
                             <th key={col} style={{ padding: "2px", border: "1px solid black", fontSize: "20px"}}>{col}</th>
                        ))}
                    </tr>
                    </thead>
                <tbody>
                    {fileNames.map((fileName,index) => (
                    
                        <tr key={fileName}>
                            <td style={{ padding: "10px", border: "1px solid black" }}>
                                <Link to={`/dataset-page/${fileName}`}>{fileName}</Link>
                            </td>
                            <td style={{ padding: "10px", border: "1px solid black" }}>
                                {fileInfos[index].includes(fileName) && fileInfos[index].split(";")[1]}
                            </td>
                            <td style={{ padding: "10px", border: "1px solid black" }}>
                                <button onClick={() => removeFile(fileName)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                
            
        </div>
    );
}

export default ViewDataSets;