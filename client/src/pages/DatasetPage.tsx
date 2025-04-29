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
    const [isViewBarChartClicked, setIsViewBarChartClicked] = useState<boolean>(false);
    const [isViewBoxPlotClicked, setIsViewBoxPlotClicked] = useState<boolean>(false);
    const [isRevertButtonClicked, setIsRevertButtonClicked] = useState<boolean>(false);
    const [numberOfRows, setNumberOfRows] = useState<string>("0");
    const [histogramUrls, setHistogramUrls] = useState<string[]>([]);
    const [barChartUrls, setBarChartUrls] = useState<string[]>([]);
    const [boxPlotUrls, setBoxPlotUrls] = useState<string[]>([]);
    // const [histogramImgs, setHistogramImgs] = useState<string[]>([]);
    // const [barChartImgs, setBarChartImgs] = useState<string[]>([]);
    // const [boxPlotImgs, setBoxPlotImgs] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [iframeVisible, setIframeVisible] = useState(false);
    const tableFieldHeader = ["Field", "Inferred Type", "Nulls Found", "Percentage of Nulls Found", "Actions", "Histogram Visualisations", "Bar Chart Visualisations", "Box Plot Visualisations"];

    useEffect(() => {
        const fetchAll = async () => {
            console.log("Current fileName:", fileName);

            await fetchFieldProperties(); 
            await fetchHistogramUrls();
            fetchBarChartUrls();
            fetchBoxPlotUrls();
            fetchNumberOfRowsRetrieval();
        };
        fetchAll();

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
            setErrorMessage("Error fetching file name, Please reload page");
        }
    };


    const fetchHistogramUrls = async () => {
        console.log("Fetching histogram URLs for", fileName);
        try {
            const response = await axios.get(`http://localhost:5000/getHistogram/${fileName}/urls`);
            if (response.status === 200) {
                console.log("Histogram URLs: " + response.data)
                setHistogramUrls(response.data);
            }
        } catch (error) {
            console.error("Error fetching histogram URLs:", error);
            setErrorMessage("Error fetching histogram URLs, Please reload page");
        }
    };


    const fetchBarChartUrls = async () => {
        console.log("Fetching bar chart URLs for", fileName);
        try {
            const response = await axios.get(`http://localhost:5000/getBarChart/${fileName}/urls`);
            if (response.status === 200) {
                console.log("Bar Chart URLs: " + response.data)
                setBarChartUrls(response.data);
            }
        } catch (error) {
            console.error("Error fetching bar chart URLs:", error);
            setErrorMessage("Error fetching bar chart URLs, Please reload page");
        }
    };

    const fetchBoxPlotUrls = async () => {
        console.log("Fetching box plot URLs for", fileName);
        try {
            const response = await axios.get(`http://localhost:5000/getBoxPlot/${fileName}/urls`);
            if (response.status === 200) {
                console.log("Box Plot URLs: " + response.data)
                setBoxPlotUrls(response.data);
            }
        } catch (error) {
            console.error("Error fetching box plot URLs:", error);
            setErrorMessage("Error fetching box plot URLs, Please reload page");
        }
    };

    // const fetchHistogramImgs = async () => {
    //     console.log("Fetching histogram IMGs for", fileName);
    //     try {
    //         const response = await axios.get(`http://localhost:5000/getHistogram/${fileName}/imgs`);
    //         if (response.status === 200) {
    //             console.log("Histogram IMGs: " + response.data)
    //             setHistogramImgs(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching histogram URLs:", error);
    //     }
    // };


    // const fetchBarChartImgs = async () => {
    //     console.log("Fetching bar chart IMGs for", fileName);
    //     try {
    //         const response = await axios.get(`http://localhost:5000/getBarChart/${fileName}/imgs`);
    //         if (response.status === 200) {
    //             console.log("Bar Chart IMGs: " + response.data)
    //             setBarChartImgs(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching bar chart URLs:", error);
    //     }
    // };

    // const fetchBoxPlotImgs = async () => {
    //     console.log("Fetching box plot IMGs for", fileName);
    //     try {
    //         const response = await axios.get(`http://localhost:5000/getBoxPlot/${fileName}/imgs`);
    //         if (response.status === 200) {
    //             console.log("Box Plot IMGs: " + response.data)
    //             setBoxPlotImgs(response.data);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching box plot URLs:", error);
    //     }
    // };

    const fetchNumberOfRowsRetrieval = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/getNumberOfRows/${fileName}`);
            if (response.status === 200) {
                setNumberOfRows(response.data);
            }
        } catch (error) {
            console.error("Error fetching number of rows:", error);
            setErrorMessage("Error fetching number of rows, Please reload page");
        }
    }

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
            setErrorMessage("Error removing nulls");
        }
    }

    const handleViewHistogram = (fieldName: string) => {
        console.log("handleViewHistogram called for", fieldName);
        const histogramUrl = histogramUrls.find(url => url.includes(fieldName)); // Find the URL related to the field
        if (histogramUrl) {
            console.log("Histogram URL found for", histogramUrl);
            setIsViewHistogramClicked(!isViewHistogramClicked);
            // Open the histogram in a new tab
            window.open(`http://localhost:5000${histogramUrl}`, '_blank', 'noopener noreferrer');
        } else {
            console.log("Histogram URL not found for", fieldName);
        }
        setIframeVisible(!iframeVisible);
    };

    const handleViewBarChart = (fieldName: string) => {
        console.log("handleViewBarChart called for", fieldName);
        const barChartUrl = barChartUrls.find(url => url.includes(fieldName)); // Find the URL related to the field
        if (barChartUrl) {
            console.log("Bar Chart URL found for", barChartUrl);
            setIsViewBarChartClicked(!isViewBarChartClicked);
            // Open the bar chart in a new tab
            window.open(`http://localhost:5000${barChartUrl}`, '_blank', 'noopener noreferrer');
        } else {
            console.log("Bar Chart URL not found for", fieldName);
        }
    }

    const handleViewBoxPlot = (fieldName: string) => {
        console.log("handleViewBoxPlot called for", fieldName);
        const boxPlotUrl = boxPlotUrls.find(url => url.includes(fieldName)); // Find the URL related to the field
        if (boxPlotUrl) {
            console.log("Box Plot URL found for", boxPlotUrl);
            setIsViewBoxPlotClicked(!isViewBoxPlotClicked);
            // Open the box plot in a new tab
            window.open(`http://localhost:5000${boxPlotUrl}`, '_blank', 'noopener noreferrer');
        } else {
            console.log("Box Plot URL not found for", fieldName);
        }
    };

    if (errorMessage) {
        return <p style={{ color: 'red' }}>{errorMessage}</p>;
    }

    const handleNoButtonClick = () => {
        window.location.reload();
    };


    return(
        <div>
            <div>
                <h1>Dataset Page for : {fileName} </h1>
            </div>
            <div className="container">
                <table border={1} style={{ margin: "auto", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                    <tr>
                        {tableFieldHeader.map((col) => (
                            <th key={col} style={{ padding: "2px", border: "1px solid black", fontSize: "20px", backgroundColor: "black", fontStyle: "-moz-initial", color: "white"}}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                {fieldProperties.map((fieldProperty, rowIndex) => (
                    <tr key ={fieldProperty[0]} style={{ backgroundColor: rowIndex % 2 === 0 ? "#f2f2f2" : "white" }}>
                        {Array.isArray(fieldProperty) ? fieldProperty.map((property, index) => (
                            <td key={index} style={{ padding: "10px", border: "1px solid black" }}>
                                {property === true ? "true" : property === false ? "false" : property}
                            </td>
                        )) : (
                            <td style={{ padding: "10px", border: "1px solid black" }}>
                                {fieldProperty}
                            </td>
                        )}
                        <td style={{ padding: "10px", border: "1px solid black"}}>
                            <button className="button-dataset" disabled={(fieldProperty[2] == "False")} onClick = {() => handleRemoveNulls(fieldProperty[0])}>Remove Nulls</button>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid black"}}>
                        <div className="hover-container">
                            <button 
                            className="visualisation-button" 
                            disabled={(fieldProperty[1] == "string" || fieldProperty[1] == "bool") || fieldProperty[1].includes("datetime")}
                            onClick={() => handleViewHistogram(fieldProperty[0])}>
                                {/* <iframe src={`http://127.0.0.1:5000/static/histogramVisualisations/histogramVisualisations_${fileName}/histogram_${fieldProperty[0]}.html`}/> */}
                                View Histogram
                            </button>
                            {/* <iframe
                                    src={`http://127.0.0.1:5000/static/histogramVisualisations/histogramVisualisations_${fileName}/histogram_${fieldProperty[0]}.html`}
                                    className="histogram-iframe"
                                /> */}
                            <div className="hover-iframe">
                                {histogramUrls.some(url => url.includes(fieldProperty[0])) && (<iframe
                                    src={`http://127.0.0.1:5000/static/histogramVisualisations/histogramVisualisations_${fileName}/histogram_${fieldProperty[0]}.html?ts=${Date.now()}`}
                                    className="histogram-iframe"
                                />)}
                            </div>
                        </div>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid black"}}>
                        <div className="hover-container">
                            <button 
                            className="visualisation-button" 
                            onClick={() => handleViewBarChart(fieldProperty[0])}>
                                View Bar Chart
                            </button>
                            {/* <iframe
                                    src={`http://127.0.0.1:5000/static/barChartVisualisations/barChartVisualisations_${fileName}/bar_chart_${fieldProperty[0]}.html`}
                                    className="histogram-iframe"
                                /> */}
                            <div className="hover-iframe">
                                {barChartUrls.some(url => url.includes(fieldProperty[0])) && (<iframe
                                    src={`http://127.0.0.1:5000/static/barChartVisualisations/barChartVisualisations_${fileName}/bar_chart_${fieldProperty[0]}.html?ts=${Date.now()}`}
                                    className="histogram-iframe"
                                />)} 
                            </div>
                        </div>
                        </td>
                        <td style={{ padding: "10px", border: "1px solid black"}}>
                        <div className="hover-container">
                            <button 
                            className="visualisation-button" 
                            disabled={(fieldProperty[1] == "string" || fieldProperty[1] == "bool") || fieldProperty[1].includes("datetime")}
                            onClick={() => handleViewBoxPlot(fieldProperty[0])}>
                                View Box Plot
                            </button>
                            {/* <iframe
                                    src={`http://127.0.0.1:5000/static/boxPlotVisualisations/boxPlotVisualisations_${fileName}/box_plot_${fieldProperty[0]}.html`}
                                    className="histogram-iframe"
                                /> */}
                            <div className="hover-iframe">

                                {boxPlotUrls.some(url => url.includes(fieldProperty[0])) && (<iframe
                                    src={`http://127.0.0.1:5000/static/boxPlotVisualisations/boxPlotVisualisations_${fileName}/box_plot_${fieldProperty[0]}.html?ts=${Date.now()}`}
                                    className="histogram-iframe"
                                />)}
                            </div>
                        </div>
                        </td>
                        
                    </tr>
                ))}
                </tbody>
                </table>
                
            </div>
            { fileName ? <div>
                <ModifiedCSVPreviewDisplay triggerGetPreview = {isRemoveNullClicked} file_name={fileName} number_of_rows={numberOfRows}/>
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