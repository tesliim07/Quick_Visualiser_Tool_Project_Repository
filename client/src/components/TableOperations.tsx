import React from 'react';
import { useState,useEffect } from 'react';
import axios from 'axios';
import './TableOperations.css';

const TableOperations: React.FC<{ triggerGetPreview: boolean, file_name: string }> = ({ triggerGetPreview, file_name }) => {

    const [correlationUrls, setCorrelationUrls] = useState<any[]>([]);
    const [hasDuplicates, setHasDuplicates] = useState<boolean>(false);
    const [isRemoveDuplicatesClicked, setIsRemoveDuplicatesClicked] = useState<boolean>(false);

    useEffect(() => {
        fetchCorrelationUrls();
        fetchHasDuplicates();
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

    const fetchHasDuplicates = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/hasDuplicates/${file_name}`);
            if (response.status === 200) {
                console.log("Has Duplicates: " + response.data)
                if (response.data === "True") {
                    setHasDuplicates(true);
                }
            }
        } catch (error) {
            console.error("Error fetching correlation URLs:", error);
        }
    }

    const handleRemoveDuplicates = async () => {
        try {
            const response = await axios.post("http://localhost:5000/removeDuplicates", {
                file_name: file_name
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                console.log("Remove duplicates button has been clicked")
                setIsRemoveDuplicatesClicked(!isRemoveDuplicatesClicked);
                console.log("Nulls removed successfully")
                console.log("response.data: ", response.data);
                console.log("response.status: ", response.status);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error removing duplicates:", error);
        }
    }
    
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
                <div className="">
                    <button disabled={hasDuplicates === false} onClick={() => handleRemoveDuplicates()}>
                        Remove Duplicates
                    </button>
                </div>
            </div>
        
        </div>
    );
};

export default TableOperations;