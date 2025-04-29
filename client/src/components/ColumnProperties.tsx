import { useEffect, useState } from "react";
import axios from "axios";

const ColumnProperties: React.FC<{files: File[]}> = ({files}) => {
    const [tableProperties, setTableProperties] = useState<{ [key: string]: any[] }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useEffect(() => {
        const fetchColumnSummaries = async () => {
            try {
                console.log("Fetching column summaries for files:", files);
                // Define the path where the files are stored
                const folderPath = './uploadedFiles/';
                const filePaths = [];
                for (let i = 0; i < files.length; i++) {
                    const filePath = folderPath + files[i].name;
                    filePaths.push(filePath);
                }
                 // Encode the file names array into a query string
                const encodedFilePaths = encodeURIComponent(JSON.stringify(filePaths));
                const response = await axios.get(`http://localhost:5000/getColumnProperties?files=${encodedFilePaths}`);
                setTableProperties(response.data);
            } catch (error) {
                console.error("Error fetching column summary:", error);
                setErrorMessage("Error fetching column summary");
            }
        };

        fetchColumnSummaries();
    }, []);

    if (errorMessage) {
        return <p style={{ color: "red" }}>{errorMessage}</p>;
    }

    return (
        <div>
            {Object.entries(tableProperties).map(([tableName, columns]) => (
                <div key={tableName}>
                    <h2>{tableName} Column Summary</h2>
                    <table border={1} style={{ margin: "0 auto", textAlign: "center" }}>
                        <thead style={{backgroundColor: "black", fontStyle: "-moz-initial", color: "white" }}>
                            <tr>
                                <th>COLUMN NAME</th>
                                <th>DATA TYPE</th>
                                <th>BAD DATA %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((col, rowIndex) => (
                                <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? "#f2f2f2" : "white" }} >
                                    <td>{col.column}</td>
                                    <td>{col.data_type}</td>
                                    <td>{col.bad_data}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default ColumnProperties;
