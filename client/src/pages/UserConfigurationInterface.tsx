import {useState, useEffect} from 'react';
import axios from 'axios';
import './UserConfigurationInterface.css';
import ModifiedCSVPreviewDisplay from '../components/ModifiedCSVPreviewDisplay';

const UserConfigurationInterface : React.FC = () => {
    const dataTypesOptions = ["int", "float", "object", "bool", "datetime"];
    const [columnNames, setColumnNames] = useState<string[]>([]);
    const [userConfigs, setUserConfigs] = useState<any>(null);
    const[selectedRemoveDuplicatesCheckbox, setselectedRemoveDuplicatesCheckbox] = useState<string>("yes");
    const[selectedRemoveRowsWithNullsCheckbox, setselectedRemoveRowsWithNullsCheckbox] = useState<string>("yes");
    const[selectedIgnoreIndexColumnsCheckbox, setselectedIgnoreIndexColumnsCheckbox] = useState<string>("yes");
    // const[selectedDetectBadDataPercentagePerColumnCheckbox, setselectedDetectBadDataPercentagePerColumnCheckbox] = useState<string>("yes");
    const[selectedChangeDataTypesCheckbox, setselectedChangeDataTypesCheckbox] = useState<string>("yes");
    const [changeDataTypesText, setChangeDataTypesText] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successfulMessage, setSuccessMessage] = useState<string>("");
    const [saveMessage, setSaveMessage] = useState<string>("");
    const[disableApplyCleaningButton, setDisableApplyCleaningButton] = useState<boolean>(false);
    const [showSaveContainer, setShowSaveContainer] = useState<boolean>(false);

    useEffect(() => {
        setErrorMessage("");
        setSuccessMessage("");
       setDisableApplyCleaningButton(false);
       setShowSaveContainer(false);
    },[selectedChangeDataTypesCheckbox, selectedIgnoreIndexColumnsCheckbox, selectedRemoveRowsWithNullsCheckbox, selectedRemoveDuplicatesCheckbox]);
    const handleRemoveDuplicatesCheckboxChange = (value: string) => {
        setselectedRemoveDuplicatesCheckbox(value);
    }

    const handleRemoveRowsWithNullsCheckboxChange = (value: string) => {
        setselectedRemoveRowsWithNullsCheckbox(value);
    }

    const handleIgnoreIndexColumnsCheckboxChange = (value: string) => {
        setselectedIgnoreIndexColumnsCheckbox(value);
    }

    // const handleDetectBadDataPercentagePerColumnCheckboxChange = (value: string) => {
    //     setselectedDetectBadDataPercentagePerColumnCheckbox(value);
    // }

    const handleChangeDataTypesCheckboxChange = (value: string) => {
        setselectedChangeDataTypesCheckbox(value);
    }

    const handleChangeDataTypesText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChangeDataTypesText(event.target.value);
        setErrorMessage("");
    }

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setDisableApplyCleaningButton(true);

        try{
            const response = await axios.get("http://localhost:5000/getColumnNames");
            if(response.status === 200){
              setColumnNames(response.data);
            }
          }
          catch (error) {
            console.error("UserConfigurationInterface: Error fetching column names:", error);
            setErrorMessage("Error fetching column names");
            return; // Exit the function if there's an error
          }

        
        // Parse the changeDataTypesText into a JSON object
        let changeDataTypes = {};
        if (selectedChangeDataTypesCheckbox === "yes"){
            changeDataTypes = changeDataTypesText.split(',').reduce((acc, item) => {
                const [key, value] = item.split(':').map(str => str.trim());
                if (!columnNames.includes(key) || !dataTypesOptions.includes(value)) {
                    const error = `Invalid column name or data type: ${key}, ${value}`;
                    console.error(error);
                    setErrorMessage(error);
                    return acc;
                }
                if (key && value) {
                    acc[key] = value;
                }
                return acc;
            }, {} as { [key: string]: string });
        }
        
        

        const formData = {
            removeDuplicates: selectedRemoveDuplicatesCheckbox,
            removeRowsWithNullValues: selectedRemoveRowsWithNullsCheckbox,
            ignoreIndexColumns: selectedIgnoreIndexColumnsCheckbox,
            // detectBadDataPercentagePerColumn: selectedDetectBadDataPercentagePerColumnCheckbox,
            changeColumnDataTypes: selectedChangeDataTypesCheckbox,
            changeDataTypes: selectedChangeDataTypesCheckbox === "yes" ? changeDataTypes : {}
        };

        setSuccessMessage("User configuration successful");

        console.log(JSON.stringify(formData, null, 2));
        setUserConfigs(formData);
    }

    const handleYesButtonClicked = async() => {

        try{
            const response = await axios.post("http://localhost:5000/saveCleanedFile", userConfigs, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(response.status === 200){
                setSaveMessage("File saved successfully");
                console.log("UserConfigurationInterface: File saved successfully");
            }
        }
        catch (error) {
            console.log("UserConfigurationInterface: Error saving file:", error);
            setSaveMessage("Error saving file");
        }
    }

    const handleNoButtonClick = () => {
        window.location.reload();
    };

    const handleApplyCleaning = () => {
        setShowSaveContainer(true);
    }

    return(
    <>
        <div>
            <p>This page is where you can set out you want to clean your file</p>
            <p>When done you will see a save to database button at the bottom of this page</p>
        </div>
        <div className="container">
            <h1>User Configuration Interface Page</h1>
            <form onSubmit={handleSubmit}>
                <div className='container'>
                    <p>Remove Duplicates</p>
                    <label>No</label>
                    <input type='checkbox' name='removeDuplicatesNo' id='removeDuplicatesNo' checked={selectedRemoveDuplicatesCheckbox === "no"} onChange={() => handleRemoveDuplicatesCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='removeDuplicatesYes' id='removeDuplicatesYes' checked={selectedRemoveDuplicatesCheckbox === "yes"} onChange={() => handleRemoveDuplicatesCheckboxChange("yes")}/>
                </div>
                <div className='container'>
                    <p>Remove Rows with Nulls</p>
                    <label>No</label>
                    <input type='checkbox' name='removeRowsWithNullsNo' id='removeRowsWithNullsNo' checked={selectedRemoveRowsWithNullsCheckbox === "no"} onChange={() => handleRemoveRowsWithNullsCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='removeRowsWithNullsYes' id='removeRowsWithNullsYes' checked={selectedRemoveRowsWithNullsCheckbox === "yes"} onChange={() => handleRemoveRowsWithNullsCheckboxChange("yes")}/>
                </div>
                <div className='container'>
                    <p>Ignore Index Columns</p>
                    <label>No</label>
                    <input type='checkbox' name='ignoreIndexColumnsNo' id='ignoreIndexColumnsNo' checked={selectedIgnoreIndexColumnsCheckbox === "no"} onChange={() => handleIgnoreIndexColumnsCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='ignoreIndexColumnsYes' id='ignoreIndexColumnsYes' checked={selectedIgnoreIndexColumnsCheckbox === "yes"} onChange={() => handleIgnoreIndexColumnsCheckboxChange("yes")}/>
                </div>
                {/* <div>
                    <p>Detect bad data percentage per column</p>
                    <label>No</label>
                    <input type='checkbox' name='detectBadDataPercentagePerColumnNo' id='detectBadDataPercentagePerColumnNo' checked={selectedDetectBadDataPercentagePerColumnCheckbox === "no"} onChange={() => handleDetectBadDataPercentagePerColumnCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='detectBadDataPercentagePerColumnYes' id='detectBadDataPercentagePerColumnYes' checked={selectedDetectBadDataPercentagePerColumnCheckbox === "yes"} onChange={() => handleDetectBadDataPercentagePerColumnCheckboxChange("yes")}/>
                </div> */}
                <div className='container'>
                    <p>Change Data Types</p>
                    <label>No</label>
                    <input type='checkbox' name='changeDataTypesNo' id='changeDataTypesNo' checked={selectedChangeDataTypesCheckbox === "no"} onChange={() => handleChangeDataTypesCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='changeDataTypesYes' id='changeDataTypesYes' checked={selectedChangeDataTypesCheckbox === "yes"} onChange={() => handleChangeDataTypesCheckboxChange("yes")}/>
                    {selectedChangeDataTypesCheckbox === "yes" ? 
                    <div>
                        <p className='important-info'>The following data types you can change your columns to are: int, float, object, bool, datetime</p>
                        <p className='important-info'>Enter the Columns whose data type you will like to change along with the specified datatypes and please split them by a comma(,) e.g Name: object, Time: datetime64</p>
                        <input type='text' name='changeDataTypesText' id='changeDataTypesText' placeholder='Enter the column name with the datatype' value={changeDataTypesText} onChange={handleChangeDataTypesText}/>
                    </div> : null}
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successfulMessage && <p className="success-message">{successfulMessage}</p>}
                <button type='submit' onClick={handleApplyCleaning}disabled={(selectedChangeDataTypesCheckbox=="yes" && changeDataTypesText==="") || (disableApplyCleaningButton==true)}>Apply Cleaning</button>
            </form>
        </div>
        {
            (userConfigs!==null && disableApplyCleaningButton ) && <div className="">
                {/* <button type="button" className="" onClick={handleFetchModifiedCSVPreview}>Fetch Modified Preview</button> */}
                <ModifiedCSVPreviewDisplay userConfigs={userConfigs}/>
            </div>
        }
        {showSaveContainer && <div className='container'>
            <p>Do you want to save cleaned file</p>
            <button type="button" onClick={handleYesButtonClicked}>Yes</button>
            <button type="button" onClick={handleNoButtonClick}>No</button>
            {saveMessage && <p>{saveMessage}</p>}
        </div>}
    </>
    )

}

export default UserConfigurationInterface;