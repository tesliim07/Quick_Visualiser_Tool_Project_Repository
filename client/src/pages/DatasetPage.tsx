import { useParams } from "react-router-dom";
import axios from 'axios';
import {useState, useEffect} from 'react';
import './DatasetPage.css';

const DatasetPage : React.FC = () => {
    const { fileName } = useParams<{ fileName: string }>();
    const [fieldProperties, setFieldProperties] = useState<string[]>([]);
    const [isRemoveNullClicked, setIsRemoveNullClicked] = useState<boolean>(false);
    const [isViewHistogramClicked, setIsViewHistogramClicked] = useState<boolean>(false);

    const [urls, setUrls] = useState<string[]>([]);
    
    useEffect(() => {
        console.log("Current fileName:", fileName);  // Debugging log
        const fetchFieldProperties = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/getFieldsProperties/${fileName}`);
                if (response.status === 200) {
                    setFieldProperties(response.data);
                    console.log("Dataset Page: " + response.data)
                }
            } catch (error) {
                console.error("Error fetching file name:", error);
            }
        };


        const fetchHistogramUrls = async () => {
            console.log("Fetching histogram URLs for", fileName);
            try {
                const response = await axios.get(`http://localhost:5000/getHistogramUrl/${fileName}`);
                if (response.status === 200) {
                    console.log("Histogram URLs: " + response.data)
                    setUrls(response.data);
                }
            } catch (error) {
                console.error("Error fetching histogram URLs:", error);
            }
        };

        fetchFieldProperties();
        fetchHistogramUrls();

    }, [isRemoveNullClicked, isViewHistogramClicked, fileName]);

    const handleRemoveNulls = async (columnName: string) => {
        try {
            const response = await axios.post("http://localhost:5000/removeNulls", {
                file_name: fileName,
                column_name: columnName
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                setIsRemoveNullClicked(!isRemoveNullClicked);
                console.log("Nulls removed successfully")
            }
        } catch (error) {
            console.error("Error removing nulls:", error);
        }
    }

    const handleViewHistogram = (fieldName: string) => {
        console.log("handleViewHistogram called for", fieldName);
        const histogramUrl = urls.find(url => url.includes(fieldName)); // Find the URL related to the field
        if (histogramUrl) {
            console.log("Histogram URL found for", histogramUrl);
            setIsViewHistogramClicked(!isViewHistogramClicked);
            // Open the histogram in a new tab
            window.open(`http://localhost:5000${histogramUrl}`, '_blank', 'noopener noreferrer');
        } else {
            console.log("Histogram URL not found for", fieldName);
        }
    };


    return(
        <div>
            <div>
                <h1>Dataset Page for : {fileName} </h1>
            </div>
            <div className="container">
                <h2>Field, Inferred Type, Nulls Found, Percentage of Nulls Found, Actions, Visualisations</h2>
                {fieldProperties.map((fieldProperty) => (
                    <li key ={fieldProperty[0]}>
                        {Array.isArray(fieldProperty) ? fieldProperty.join(", ") : fieldProperty}
                        <button className="button-dataset" disabled={(fieldProperty[2] == "False")} onClick = {() => handleRemoveNulls(fieldProperty[0])}>Remove Nulls</button>
                        <button 
                        className="button-dataset" 
                        disabled={(fieldProperty[1] == "object" || fieldProperty[1] == "bool") || fieldProperty[1].includes("datetime")}
                        onClick={() => handleViewHistogram(fieldProperty[0])}>
                            View Histogram
                        </button>
                    </li>
                ))}
            </div>
        </div>
    );
};

export default DatasetPage;