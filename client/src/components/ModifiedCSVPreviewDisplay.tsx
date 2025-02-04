import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface ModifiedCSVPreviewDisplayProps {
    userConfigs: any;
}

const ModifiedCSVPreviewDisplay: React.FC<ModifiedCSVPreviewDisplayProps> = ({userConfigs}) => {
    const [fileName,setFileName] = useState<string>("");
    const [modifiedCSVPreview, setModifiedCSVPreview] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchModifiedCSVPreview = async () => {
            try{
                const response = await axios.get("http://localhost:5000/getFileName");
                if(response.status === 200){
                  setFileName(response.data);
                  try{
                    const response = await axios.post("http://localhost:5000/userConfigs", userConfigs,{
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if(response.status === 200){
                        setModifiedCSVPreview(response.data);
                        console.log(response.data);
                    }
                  }
                  catch (error) {
                    console.error("Error displaying modified preview:", error);
                    setErrorMessage("Error displaying modified preview",);
                    return; // Exit the function if there's an error
                  }
                }
              }
            catch (error) {
                console.error("Error fetching" + fileName + ":", error);
                setErrorMessage("Error displaying" + fileName + "modified preview",);
            }
        };

        fetchModifiedCSVPreview();
    }, [userConfigs]);

    if (errorMessage) {
        return <p style={{ color: 'red' }}>{errorMessage}</p>;
    }

    if (!modifiedCSVPreview) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Modified {fileName} Preview Display</h1>
            <table>
                <thead>
                    <tr>
                        {modifiedCSVPreview.columns.map((col: string) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {modifiedCSVPreview.data.map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex}>
                            {row.map((cell: any, cellIndex: number) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ModifiedCSVPreviewDisplay;