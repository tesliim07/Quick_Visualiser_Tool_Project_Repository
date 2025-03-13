import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';

const TableOperations: React.FC<{ file_name: string }> = ({ file_name }) => {

    const [correlationUrls, setCorrelationUrls] = useState<any[]>([]);

    useEffect(() => {
        const fetchCorrelationUrls = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/getCorrelationUrls/${file_name}`);
                if (response.status === 200) {
                    console.log("Correlation URLs: " + response.data)
                    setCorrelationUrls(response.data);
                }
            } catch (error) {
                console.error("Error fetching correlation URLs:", error);
            }
        }
        fetchCorrelationUrls();
    }
    , [file_name]);
    
    return(
        <div>
            <h1>Table Operations</h1>
            <div>
                {correlationUrls.map((plot: string, index) => {
                    // Extract column name from the plot file name
                    const linkName = plot.replace('/static/correlationVisualisations/', '').replace('.html', '');
                    return (
                        <div key={index}>
                            <a
                                href={`http://localhost:5000${plot}`}
                                target="_blank"
                                rel="noreferrer">
                                    {linkName}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TableOperations;