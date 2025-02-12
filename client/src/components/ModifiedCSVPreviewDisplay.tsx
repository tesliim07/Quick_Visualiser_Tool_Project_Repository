import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface ModifiedCSVPreviewDisplayProps {
    userConfigs: any;
}

const ModifiedCSVPreviewDisplay: React.FC<ModifiedCSVPreviewDisplayProps> = ({userConfigs}) => {
    const [fileNames,setFileNames] = useState<string[]>([]);
    const [modifiedCSVPreview, setModifiedCSVPreview] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchModifiedCSVPreview = async () => {
            try{
                const response = await axios.get("http://localhost:5000/getFileNames");
                if(response.status === 200){
                  setFileNames(response.data);
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
                console.error("Error fetching" + fileNames + ":", error);
                setErrorMessage("Error displaying" + fileNames + "modified preview",);
            }
        };

        fetchModifiedCSVPreview();
    }, [userConfigs]);

    if (errorMessage) {
        return <p style={{ color: 'red' }}>{errorMessage}</p>;
    }


    const transformedData = modifiedCSVPreview.map((filePreview) => {
        if (!filePreview || filePreview.length === 0) return null;
    
        // Extract column names from first row's keys
        const columns = Object.keys(filePreview[0]);
    
        // Extract data as a 2D array
        const data = filePreview.map((row: any) => columns.map((col) => row[col]));
    
        return { columns, data };
    });
    
    return (
        <div>
            {fileNames.length > 0 ? (
                <div>
                    {transformedData.map((filePreview, index) => (
                        filePreview ? (
                            <div key={index}>
                                <h1>Modified {fileNames[index]} Preview Display</h1>
                                <table border={1}>
                                    <thead>
                                        <tr>
                                            {filePreview.columns.map((col: string) => (
                                                <th key={col}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filePreview.data.map((row: any[], rowIndex: number) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell: any, cellIndex: number) => (
                                                    <td key={cellIndex}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null
                    ))}
                </div>
            ) : null}
        </div>
    );
    
}

export default ModifiedCSVPreviewDisplay;