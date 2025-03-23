// import React, { useEffect, useState } from 'react';
// import axios from 'axios';


// interface ModifiedCSVPreviewDisplayProps {
//     userConfigs: any;
// }

// const ModifiedCSVPreviewDisplay: React.FC<ModifiedCSVPreviewDisplayProps> = ({userConfigs}) => {
//     const [fileNames,setFileNames] = useState<string[]>([]);
//     const [modifiedCSVPreview, setModifiedCSVPreview] = useState<any[]>([]);
//     const [errorMessage, setErrorMessage] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchModifiedCSVPreview = async () => {
//             try{
//                 const response = await axios.get("http://localhost:5000/getFileNames");
//                 if(response.status === 200){
//                   setFileNames(response.data);
//                   try{
//                     const response = await axios.post("http://localhost:5000/userConfigs", userConfigs,{
//                         headers: {
//                             'Content-Type': 'application/json'
//                         }
//                     });
//                     if(response.status === 200){
//                         setModifiedCSVPreview(response.data);
//                         console.log(response.data);
//                     }
//                   }
//                   catch (error) {
//                     console.error("Error displaying modified preview:", error);
//                     setErrorMessage("Error displaying modified preview",);
//                     return; // Exit the function if there's an error
//                   }
//                 }
//               }
//             catch (error) {
//                 console.error("Error fetching" + fileNames + ":", error);
//                 setErrorMessage("Error displaying" + fileNames + "modified preview",);
//             }
//         };

//         fetchModifiedCSVPreview();
//     }, [userConfigs]);

//     if (errorMessage) {
//         return <p style={{ color: 'red' }}>{errorMessage}</p>;
//     }


//     const transformedData = modifiedCSVPreview.map((filePreview) => {
//         if (!filePreview || filePreview.length === 0) return null;
    
//         // Extract column names from first row's keys
//         const columns = Object.keys(filePreview[0]);
    
//         // Extract data as a 2D array
//         const data = filePreview.map((row: any) => columns.map((col) => row[col]));
    
//         return { columns, data };
//     });
    
//     return (
//         <div>
//             {fileNames.length > 0 ? (
//                 <div>
//                     {transformedData.map((filePreview, index) => (
//                         filePreview ? (
//                             <div key={index}>
//                                 <h1>Modified {fileNames[index]} Preview Display</h1>
//                                 <table border={1}>
//                                     <thead>
//                                         <tr>
//                                             {filePreview.columns.map((col: string) => (
//                                                 <th key={col}>{col}</th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {filePreview.data.map((row: any[], rowIndex: number) => (
//                                             <tr key={rowIndex}>
//                                                 {row.map((cell: any, cellIndex: number) => (
//                                                     <td key={cellIndex}>
//                                                         {cell === true ? "true" : cell === false ? "false" : cell}
//                                                     </td>
//                                                 ))}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         ) : null
//                     ))}
//                 </div>
//             ) : null}
//         </div>
//     );
    
// }

// export default ModifiedCSVPreviewDisplay;



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