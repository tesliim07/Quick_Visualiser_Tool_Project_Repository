import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModifiedCSVPreviewDisplay: React.FC<{ triggerGetPreview: boolean, file_name: string }> = ({ triggerGetPreview, file_name }) => {
    const [modifiedCSVPreview, setModifiedCSVPreview] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchModifiedCSVPreview();
 
    }, [triggerGetPreview]);

    const fetchModifiedCSVPreview = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/getPreview/${file_name}`);
            if (response.status === 200) {
                console.log("Fucking Fetched Data:",response.data);
                setModifiedCSVPreview(response.data);
            }
        } catch (error) {
            console.error("Error displaying modified preview:", error);
            setErrorMessage("Error displaying modified preview");
        }
    };

    if (errorMessage) {
        return <p style={{ color: 'red' }}>{errorMessage}</p>;
    }

    if (!modifiedCSVPreview || modifiedCSVPreview.length === 0) {
        console.log("NOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
        return <p>No data available.</p>;
    }

    // Extract column names dynamically from the first object in the data
    const columns = Object.keys(modifiedCSVPreview[0]);


    console.log("columns:", columns);
    console.log("Modified CSV Preview Data:", modifiedCSVPreview);

    return (
        <div>
            <h1>{file_name} Preview Display</h1>
            <table border={1} style={{ margin: "auto", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} style={{ padding: "10px", border: "1px solid black" }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {modifiedCSVPreview.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => (
                                <td key={col} style={{ padding: "10px", border: "1px solid black" }}>
                                    {row[col] === true ? "true" : row[col] === false ? "false" : row[col]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ModifiedCSVPreviewDisplay;