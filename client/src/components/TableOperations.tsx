import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';
import './TableOperations.css';

const TableOperations: React.FC<{ triggerGetPreview: boolean, file_name: string }> = ({ triggerGetPreview, file_name }) => {

    const [correlationUrls, setCorrelationUrls] = useState<any[]>([]);
    // const [boxPlotUrl, setBoxPlotUrl] = useState<any>();

    useEffect(() => {
        fetchCorrelationUrls();
        // fetchBoxplotUrl();
    }
    , [triggerGetPreview]);

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

    // const fetchBoxplotUrl = async () => {
    //     try {
    //         const response = await axios.get(`http://localhost:5000/getBoxPlotUrl/${file_name}`);
    //         if (response.status === 200) {
    //             console.log("Box Plot URL: " + response.data)
    //             setBoxPlotUrl(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching correlation URLs:", error);
    //     }
    // }
    
    return(
        <div>
            <h1 className="table-operations-h1">Table Operations</h1>
            <div className="view-table-operations">
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
            
                {/* {boxPlotUrl && (
                    <div>
                        <a
                            href={`http://localhost:5000${boxPlotUrl}`}
                            target="_blank"
                            rel="noreferrer">
                                Box Plot
                        </a>
                    </div>
                )} */}
            </div>
        
        </div>
    );
};

export default TableOperations;