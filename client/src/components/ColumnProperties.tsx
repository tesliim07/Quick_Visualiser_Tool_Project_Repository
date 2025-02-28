import { useEffect, useState } from "react";
import axios from "axios";

const ColumnProperties: React.FC = () => {
    const [tableProperties, setTableProperties] = useState<{ [key: string]: any[] }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchColumnSummaries = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getColumnProperties");
                setTableProperties(response.data);
            } catch (error) {
                console.error("Error fetching column properties:", error);
                setErrorMessage("Error fetching column properties");
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
                        <thead>
                            <tr>
                                <th>COLUMN NAME</th>
                                <th>DATA TYPE</th>
                                <th>BAD DATA %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((col, index) => (
                                <tr key={index}>
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
