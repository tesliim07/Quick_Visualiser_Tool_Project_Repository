import { useParams } from "react-router-dom";
import axios from 'axios';
import {useState, useEffect} from 'react';
import ModifiedCSVPreviewDisplay from '../components/ModifiedCSVPreviewDisplay';
import TableOperations from '../components/TableOperations';
import PopUp from '../components/PopUp';
import './DatasetPage.css';

const DatasetPage : React.FC = () => {
    const { fileName } = useParams<{ fileName: string }>();
    const [fieldProperties, setFieldProperties] = useState<string[]>([]);
    const [isRemoveNullClicked, setIsRemoveNullClicked] = useState<boolean>(false);
    const [isViewHistogramClicked, setIsViewHistogramClicked] = useState<boolean>(false);
    const [isRevertButtonClicked, setIsRevertButtonClicked] = useState<boolean>(false);
    const [urls, setUrls] = useState<string[]>([]);
    
    useEffect(() => {
        console.log("Current fileName:", fileName);  // Debugging log

        fetchFieldProperties(); 
        fetchHistogramUrls();


    }, [isRemoveNullClicked, fileName]);

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
            const response = await axios.get(`http://localhost:5000/getHistogramUrls/${fileName}`);
            if (response.status === 200) {
                console.log("Histogram URLs: " + response.data)
                setUrls(response.data);
            }
        } catch (error) {
            console.error("Error fetching histogram URLs:", error);
        }
    };

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
                console.log("Remove nulls button has been clicked")
                setIsRemoveNullClicked(!isRemoveNullClicked);
                console.log("Nulls removed successfully")
                console.log("response.data: ", response.data);
                console.log("response.status: ", response.status);
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

    const handleNoButtonClick = () => {
        window.location.reload();
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
                        className="histogram-button" 
                        disabled={(fieldProperty[1] == "object" || fieldProperty[1] == "bool") || fieldProperty[1].includes("datetime")}
                        onClick={() => handleViewHistogram(fieldProperty[0])}>
                            View Histogram
                        </button>
                    </li>
                ))}
            </div>
            { fileName ? <div>
                <ModifiedCSVPreviewDisplay triggerGetPreview = {isRemoveNullClicked} file_name={fileName} />
                <TableOperations triggerGetPreview = {isRemoveNullClicked} file_name={fileName}/>
            </div> : null}
            <div className="revert-button-container">
                <button className="revert-button" onClick={() => setIsRevertButtonClicked(true)}> Revert to Original Dataset</button>
            </div>
            
            {isRevertButtonClicked !== false && <PopUp isOpen={true} onNo={handleNoButtonClick} file_name={fileName}/>}
        </div>
    );
};

export default DatasetPage;