import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModifiedCSVPreviewDisplay: React.FC<{ triggerGetPreview: boolean, file_name: string, number_of_rows: string }> = ({ triggerGetPreview, file_name, number_of_rows }) => {
    const [modifiedCSVPreview, setModifiedCSVPreview] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             await fetchModifiedCSVPreview();
    //         } catch (error) {
    //             console.error("Error fetching modified CSV preview:", error);
    //         }
    //     }; 
    //     fetchData();
 
    // }, [triggerGetPreview]);

    useEffect(() => {
        fetchModifiedCSVPreview();
 
    }, [triggerGetPreview]);

    const fetchModifiedCSVPreview = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/getPreview/${file_name}`);
            if (response.status === 200) {
                console.log("Fetched Data:",response.data);
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
            <h1>{file_name} Preview Display (15/{number_of_rows} rows)</h1>
            <table border={1} style={{ margin: "auto", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} style={{ padding: "2px", border: "1px solid black", backgroundColor: "black", fontStyle: "-moz-initial", color: "white" }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {modifiedCSVPreview.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? "#f2f2f2" : "white" }}>
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