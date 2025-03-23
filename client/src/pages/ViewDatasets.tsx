import axios from 'axios';
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import './ViewDatasets.css';

const ViewDataSets : React.FC = () => {
    const [fileNames, setFileNames] = useState<string[]>([]);

    useEffect(() => {

        const fetchFileNames = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getFileNames");
                if (response.status === 200) {
                    setFileNames(response.data);
                    console.log("ViewDataSets: " + response.data)
                }
            } catch (error) {
                console.error("Error fetching file name:", error);
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
    
    return (
        <div>
            <h1>View Data Sets:</h1>
            {fileNames.map((fileName) => (
                <div>
                    <li key ={fileName} style={{ margin: "0 auto", textAlign: "center" }}>
                        <Link to={`/dataset-page/${fileName}`}>{fileName}</Link>
                        <button onClick={() => removeFile(fileName)}>Remove</button>
                    </li>
                </div>
            ))}
        </div>
    );
}

export default ViewDataSets;