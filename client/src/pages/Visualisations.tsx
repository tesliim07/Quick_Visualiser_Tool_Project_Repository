// import {useState} from 'react';
// import axios from 'axios';


// const Visualsiations : React.FC = () => {
//     const [images, setImages] = useState<any>(null); // State to hold the images
//     const [loading, setLoading] = useState<boolean>(false); // State for loading
//     const [errorMessage, setErrorMessage] = useState<string>(''); // State for error handling
//     const [fileName, setFileName] = useState<string>('');

//     const handleFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setFileName(event.target.value);
//         // setLoading(true);
//     }

//     const fetchVisualizations = async () => {
//         setLoading(true);
//         setErrorMessage(''); // Clear any previous error message
//         try {
//             const response = await axios.get(`http://localhost:5000/getVisualisations/${fileName}`,{
//                 headers: {
//                     'Accept': 'application/json'
//                 }
//             });
//             if (response.status === 200) {
//                 console.log(response.data);
//                 setImages(response.data);  // Set the visualizations in state
//             }
//         } 
//         catch (error) {
//             console.error("Error fetching visualizations:", error);
//             setErrorMessage("An error occurred while fetching visualizations.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <form>
//                 <label>Enter the filename you want to generate visualisations without the extension:</label>
//                 <input type="text" value={fileName} onChange={handleFileName}></input>
//                 <button type="button" onClick={fetchVisualizations}>
//                     Generate Visualizations
//                 </button>
//             </form>
//             {loading ? <div>Loading...</div>:
//             <div>
//                 {errorMessage && <div>{errorMessage}</div>}
//                 {images && (
//                 <div>
//                     {/* Correlation Heatmap */}
//                     {images.correlation_heatmap && (
//                         <div>
//                             <h3>Correlation Heatmap</h3>
//                             <img
//                                 src={`data:image/png;base64,${images.correlation_heatmap}`}
//                                 alt="Correlation Heatmap"
//                                 style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                             />
//                         </div>
//                     )}

//                     {/* Correlation Heatmap Squared */}
//                     {images.correlation_heatmap_squared && (
//                         <div>
//                             <h3>Correlation Heatmap Squared</h3>
//                             <img
//                                 src={`data:image/png;base64,${images.correlation_heatmap_squared}`}
//                                 alt="Correlation Heatmap Squared"
//                                 style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                             />
//                         </div>
//                     )}

//                     {/* Histograms */}
//                     {Array.isArray(images.histograms) && images.histograms.length > 0 && (
//                         <div>
//                             <h3>Histograms</h3>
//                             {images.histograms.map((plot: string, index: number) => (
//                                 <img
//                                     key={index}
//                                     src={`data:image/png;base64,${plot}`}
//                                     alt={`Histogram ${index + 1}`}
//                                     style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                                 />
//                             ))}
//                         </div>
//                     )}

//                     {/* Box Plots */}
//                     {Array.isArray(images.box_plots) && images.box_plots.length > 0 && (
//                         <div>
//                             <h3>Box Plots</h3>
//                             {images.box_plots.map((plot: string, index: number) => (
//                                 <img
//                                     key={index}
//                                     src={`data:image/png;base64,${plot}`}
//                                     alt={`Box Plot ${index + 1}`}
//                                     style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                                 />
//                             ))}
//                         </div>
//                     )}

//                     {/* Bar Plots */}
//                     {Array.isArray(images.bar_plots) && images.bar_plots.length > 0 && (
//                         <div>
//                             <h3>Bar Plots</h3>
//                             {images.bar_plots.map((plot: string, index: number) => (
//                                 <img
//                                     key={index}
//                                     src={`data:image/png;base64,${plot}`}
//                                     alt={`Bar Plot ${index + 1}`}
//                                     style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                                 />
//                             ))}
//                         </div>
//                     )}

//                     {/* Time Plots */}
//                     {Array.isArray(images.time_plots) && images.time_plots.length > 0 && (
//                         <div>
//                             <h3>Time Plots</h3>
//                             {images.time_plots.map((plot: string, index: number) => (
//                                 <img
//                                     key={index}
//                                     src={`data:image/png;base64,${plot}`}
//                                     alt={`Time Plot ${index + 1}`}
//                                     style={{ width: "100%", maxWidth: "800px", height: "auto" }}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             )}
//             </div>
//             }

//         </div>
//     );
// }

// export default Visualsiations;






import {useState} from 'react';
import axios from 'axios';


const Visualsiations : React.FC = () => {
    const [urls, setUrls] = useState<any>(null);
    const [images, setImages] = useState<any>(null); // State to hold the images
    const [loading, setLoading] = useState<boolean>(false); // State for loading
    const [errorMessage, setErrorMessage] = useState<string>(''); // State for error handling
    const [fileName, setFileName] = useState<string>('');

    const handleFileName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value);
        // setLoading(true);
    }

    const fetchVisualisationUrlsAndImages = async () => {
        setLoading(true);
        setErrorMessage(''); // Clear any previous error message
        try {
            const response = await axios.get(`http://localhost:5000/getVisualisationUrls/${fileName}`,{
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (response.status === 200) {
                console.log(response.data);
                setUrls(response.data);  // Set the visualizations in state
            }
            try{
                const response = await axios.get(`http://localhost:5000/getVisualisationImages/${fileName}`,{
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.status === 200) {
                    console.log(response.data);
                    setImages(response.data);  // Set the visualizations in state
                }
            }
            catch (error) {
                console.error("Error fetching visualizations:", error);
                setErrorMessage("An error occurred while fetching visualizations.");
            } finally {
                setLoading(false);
            }
        } 
        catch (error) {
            console.error("Error fetching visualizations:", error);
            setErrorMessage("An error occurred while fetching visualizations.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div>
            <form>
                <label>Enter the filename you want to generate visualisations without the extension:</label>
                <input type="text" value={fileName} onChange={handleFileName}></input>
                <button type="button" onClick={fetchVisualisationUrlsAndImages}>
                    Generate Visualisations
                </button>
            </form>
            {loading ? <div>Loading...</div>:
            <div>
                {errorMessage && <div>{errorMessage}</div>}
                {urls && (
                <div>
                    {/* Correlation Heatmap */}
                    {urls.correlation_heatmap_url && (
                        <div>
                            <h3>Correlation Heatmap</h3>
                            <a
                                href={`http://localhost:5000${urls.correlation_heatmap_url}`}  // Link to download or view the interactive HTML
                                target="_blank"  // Open in a new tab for viewing the interactive visualization
                                rel="noopener noreferrer"
                            >View Correlation Heatmap</a>
                        </div>
                    )}

                    {/* Correlation Heatmap Squared */}
                    {urls.correlation_heatmap_squared_url && (
                        <div>
                            <h3>Correlation Heatmap Squared</h3>
                            <a
                                href={`http://localhost:5000${urls.correlation_heatmap_squared_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >View Correlation Heatmap Squared</a>
                        </div>
                    )}

                    {/* Histograms */}
                    {Array.isArray(urls.histogram_urls) && urls.histogram_urls.length > 0 && (
                        <div>
                            <h3>Histograms</h3>
                            {urls.histogram_urls.map((plot: string, index: number) => {
                                // Extract column name from the plot file name
                                const columnName = plot.replace('/static/Visualisations/histogram_', '').replace('.html', ''); // Remove 'histogram_' part and file extension
                                return (
                                    <div key={index}>
                                        <a
                                            href={`http://localhost:5000${plot}`}  // Link to the image HTML file
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Histogram for {columnName}  {/* Show the extracted column name */}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Box Plot */}
                    {urls.box_plot_url && (
                        <div>
                            <h3>Box Plot</h3>
                            <a
                                href={`http://localhost:5000${urls.box_plot_url}`}  // Link to download or view the interactive HTML
                                target="_blank"  // Open in a new tab for viewing the interactive visualization
                                rel="noopener noreferrer"
                            >View Box plot</a>
                        </div>
                    )}

                    {/* Bar Plots */}
                    {Array.isArray(urls.bar_plots_urls) && urls.bar_plots_urls.length > 0 && (
                        <div>
                            <h3>Bar Plots</h3>
                            {urls.bar_plots_urls.map((plot: string, index: number) => {
                                // Extract column name from the plot file name
                                const columnName = plot.replace('/static/Visualisations/bar_plot_', '').replace('.html', '');
                                return (
                                    <div key={index}>
                                        <a
                                            href={`http://localhost:5000${plot}`}  // Link to the image HTML file
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Bar Plot for {columnName}  {/* Show the extracted column name */}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Time Plots */}
                    {Array.isArray(urls.time_plots_urls) && urls.time_plots_urls.length > 0 && (
                        <div>
                            <h3>Time Plots</h3>
                            {urls.time_plots_urls.map((plot: string, index: number) => {
                                // Extract column name from the plot file name
                                const columnName = plot.replace('/static/Visualisations/time_plot_', '').replace('.html', '');
                                return (
                                    <div key={index}>
                                        <a
                                            href={`http://localhost:5000${plot}`}  // Link to the image HTML file
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Time Plots for {columnName}  {/* Show the extracted column name */}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            </div>
            }

        </div>
        <div>
            {loading ? <div>Loading...</div>:
            <div>
                {errorMessage && <div>{errorMessage}</div>}
                {images && (
                <div>
                    {/* Correlation Heatmap */}
                    {images.correlation_heatmap_img && (
                        <div>
                            <h3>Correlation Heatmap</h3>
                            <img
                                src={`data:image/png;base64,${images.correlation_heatmap_img}`}
                                alt="Correlation Heatmap"
                                style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                            />
                        </div>
                    )}

                    {/* Correlation Heatmap Squared */}
                    {images.correlation_heatmap_squared_img && (
                        <div>
                            <h3>Correlation Heatmap Squared</h3>
                            <img
                                src={`data:image/png;base64,${images.correlation_heatmap_squared_img}`}
                                alt="Correlation Heatmap Squared"
                                style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                            />
                        </div>
                    )}

                    {/* Histograms */}
                    {Array.isArray(images.histogram_imgs) && images.histogram_imgs.length > 0 && (
                        <div>
                            <h3>Histograms</h3>
                            {images.histogram_imgs.map((plot: string, index: number) => (
                                 <img
                                    key={index}
                                    src={`data:image/png;base64,${plot}`}
                                    alt={`Histogram ${index + 1}`}
                                    style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                                 />
                             ))}
                        </div>
                    )}

                    {/* Box Plot */}
                    {images.box_plot_img && (
                        <div>
                            <h3>Box Plot</h3>
                            <img
                                src={`data:image/png;base64,${images.box_plot_img}`}
                                alt="Box Plot"
                                style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                            />
                        </div>
                    )}

                    {/* Bar Plots */}
                    {Array.isArray(images.bar_plots_imgs) && images.bar_plots_imgs.length > 0 && (
                        <div>
                            <h3>Bar Plots</h3>
                            {images.bar_plots_imgs.map((plot: string, index: number) => (
                                 <img
                                    key={index}
                                    src={`data:image/png;base64,${plot}`}
                                    alt={`Bar Plot ${index + 1}`}
                                    style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                                 />
                             ))}
                        </div>
                    )}

                    {/* Time Plots */}
                    {Array.isArray(images.time_plots_imgs) && images.time_plots_imgs.length > 0 && (
                        <div>
                            <h3>Time Plots</h3>
                            {images.time_plots_imgs.map((plot: string, index: number) => (
                                 <img
                                    key={index}
                                    src={`data:image/png;base64,${plot}`}
                                    alt={`Time Plot ${index + 1}`}
                                    style={{ width: "100%", maxWidth: "800px", height: "auto" }}
                                 />
                             ))}
                        </div>
                    )}
                </div>
            )}
            </div>
            }

        </div>
        </>
    );
}

export default Visualsiations;