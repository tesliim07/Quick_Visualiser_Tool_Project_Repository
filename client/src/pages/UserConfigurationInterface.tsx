import {useState, useEffect} from 'react';
import axios from 'axios';
import './UserConfigurationInterface.css';
import ModifiedCSVPreviewDisplay from '../components/ModifiedCSVPreviewDisplay';
import Popup from '../components/PopUp';

interface ColumnNamesDict {
    [filename: string]: string[];
  }

const UserConfigurationInterface : React.FC = () => {
    const dataTypesOptions = ["int", "float", "object", "bool", "datetime"];
    const [columnNamesDict, setColumnNamesDict] = useState<ColumnNamesDict>({});
    const [userConfigs, setUserConfigs] = useState<any>(null);
    const[selectedRemoveDuplicatesCheckbox, setselectedRemoveDuplicatesCheckbox] = useState<string>("yes");
    const[selectedRemoveRowsWithNullsCheckbox, setselectedRemoveRowsWithNullsCheckbox] = useState<string>("yes");
    // const[selectedIgnoreIndexColumnsCheckbox, setselectedIgnoreIndexColumnsCheckbox] = useState<string>("yes");
    // const[selectedDetectBadDataPercentagePerColumnCheckbox, setselectedDetectBadDataPercentagePerColumnCheckbox] = useState<string>("yes");
    const[selectedChangeDataTypesCheckbox, setselectedChangeDataTypesCheckbox] = useState<string>("yes");
    const [changeDataTypesText, setChangeDataTypesText] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successfulMessage, setSuccessfulMessage] = useState<string>("");
    const [saveMessage, setSaveMessage] = useState<string>("");
    const[disableApplyCleaningButton, setDisableApplyCleaningButton] = useState<boolean>(false);
    const [tableNamesFromDB, setTableNamesFromDB] = useState<string[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);

    useEffect(() => {
        const fetchTableNames = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getTableNamesFromDatabase");
                if (response.status === 200) {
                    setTableNamesFromDB(response.data);
                    console.log("User configuration interface: " + response.data)
                }
            } catch (error) {
                console.error("Error fetching table names from Database:", error);
            }
        };

        const fetchFileNames = async () => {
            try {
                const response = await axios.get("http://localhost:5000/getFileNames");
                if (response.status === 200) {
                    setFileNames(response.data);
                    console.log("User configuration interface: " + response.data)
                }
            } catch (error) {
                console.error("Error fetching file name:", error);
            }
        };

        const fetchColumnNames = async () => {
            try{
                const response = await axios.get("http://localhost:5000/getColumnNames");
                if(response.status === 200){
                  setColumnNamesDict(response.data);
                  console.log("User configuration interface: " + response.data)
                }
              }
              catch (error) {
                console.error("UserConfigurationInterface: Error fetching column names:", error);
                // setErrorMessage("Error fetching column names");
                return;
              }

        }

        fetchTableNames();
        fetchFileNames();
        fetchColumnNames();
        setErrorMessage("");
        setSuccessfulMessage("");
        setDisableApplyCleaningButton(false);
    },[selectedChangeDataTypesCheckbox, selectedRemoveRowsWithNullsCheckbox, selectedRemoveDuplicatesCheckbox]);
    const handleRemoveDuplicatesCheckboxChange = (value: string) => {
        setselectedRemoveDuplicatesCheckbox(value);
    }

    const handleRemoveRowsWithNullsCheckboxChange = (value: string) => {
        setselectedRemoveRowsWithNullsCheckbox(value);
    }

    // const handleIgnoreIndexColumnsCheckboxChange = (value: string) => {
    //     setselectedIgnoreIndexColumnsCheckbox(value);
    // }

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
        
        // Parse the changeDataTypesText into a JSON object
        const changeDataTypes: { [key: string]: { [key: string]: string } } = {};
        let hasError = false;

        //Split the input into file entries (for each file)
        if(selectedChangeDataTypesCheckbox === "yes"){
            const fileEntries = changeDataTypesText.split('.');
            console.log("fileEntries:", fileEntries)

            //Iterate through each file entry to validate it 
            fileEntries.forEach((fileEntry) => {
                const [filename, columnsStr] = fileEntry.split('|').map(str => str.trim());
                if (!fileNames.map(name => name.trim()).includes(filename.trim())) {
                    const error = `Invalid filename: ${filename}`;
                    console.error(error);
                    setErrorMessage(error);
                    hasError = true;
                    return;
                }
                if (!columnsStr) {
                    const error = `No columns specified for ${filename}.`;
                    console.error(error);
                    setErrorMessage(error);
                    hasError = true;
                    return;
                }
                 // Split the columns and types, and validate each column and type
                const columnsAndTypes = columnsStr.split(',').map(col => col.trim());
                columnsAndTypes.forEach((columnAndType) => {
                    const [columnName, columnType] = columnAndType.split(':').map(str => str.trim());               
                
                    // Check if the column exists in the specific file's columns
                    if (!columnNamesDict[filename].includes(columnName)) {
                        const error = `Invalid column name: "${columnName}" for file "${filename}".`;
                        console.error(error);
                        setErrorMessage(error);
                        hasError = true;
                        return;
                    }
                
                    // Check if the data type is valid
                    if (!dataTypesOptions.includes(columnType)) {
                        const error = `Invalid data type: "${columnType}" for column "${columnName}".`;
                        console.error(error);
                        setErrorMessage(error);
                        hasError = true;
                        return;
                    }

                    // Store in changeDataTypes object
                    if (!changeDataTypes[filename]) {
                        changeDataTypes[filename] = {};
                    }
                    changeDataTypes[filename][columnName] = columnType;
                });
            })}
        
        if (hasError) {
            setDisableApplyCleaningButton(false);
            return;
        }
        

        const formData = {
            removeDuplicates: selectedRemoveDuplicatesCheckbox,
            removeRowsWithNullValues: selectedRemoveRowsWithNullsCheckbox,
            // ignoreIndexColumns: selectedIgnoreIndexColumnsCheckbox,
            // detectBadDataPercentagePerColumn: selectedDetectBadDataPercentagePerColumnCheckbox,
            changeColumnDataTypes: selectedChangeDataTypesCheckbox,
            changeDataTypes: selectedChangeDataTypesCheckbox === "yes" ? changeDataTypes : {}
        };

        setSuccessfulMessage("User configuration successful");

        console.log(JSON.stringify(formData, null, 2));
        setUserConfigs(formData);
    }

    const handleYesButtonClicked = async() => {
        try{
            const response = await axios.post("http://localhost:5000/saveCleanedFiles", userConfigs, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if(response.status === 200){
                setSaveMessage("File(s) saved successfully");
                console.log("UserConfigurationInterface: File(s) saved successfully");
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
                {/* <div className='container'>
                    <p>Ignore Index Columns</p>
                    <label>No</label>
                    <input type='checkbox' name='ignoreIndexColumnsNo' id='ignoreIndexColumnsNo' checked={selectedIgnoreIndexColumnsCheckbox === "no"} onChange={() => handleIgnoreIndexColumnsCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='ignoreIndexColumnsYes' id='ignoreIndexColumnsYes' checked={selectedIgnoreIndexColumnsCheckbox === "yes"} onChange={() => handleIgnoreIndexColumnsCheckboxChange("yes")}/>
                </div> */}
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
                        <p className='important-info'>Please enter the filenames along with the columns whose data types you would like to change</p>
                        <p className='important-info'>Use the following format:</p>
                        <p className='important-info'>filename | column1:datatype, column2:datatype, column3:datatype</p>
                        <p className='important-info'>e.g titanic | Age:float, PassengerId:int, Fare:float. employees | Salary:int, JoinDate:string, Department:string</p>
                        <input type='text' name='changeDataTypesText' id='changeDataTypesText' placeholder='Enter the column name with the datatype' value={changeDataTypesText} onChange={handleChangeDataTypesText}/>
                    </div> : null}
                </div>
                {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
                
                {successfulMessage ? <p className="success-message">{successfulMessage}</p> : null}
                <button type='submit' disabled={(selectedChangeDataTypesCheckbox=="yes" && changeDataTypesText==="") || (disableApplyCleaningButton==true)}>Apply Cleaning</button>
            </form>
        </div>
        {
            (userConfigs!==null && disableApplyCleaningButton ) && <div className="">
                <ModifiedCSVPreviewDisplay userConfigs={userConfigs}/>
                <div className='container'>
                    {fileNames.some((file) => tableNamesFromDB.includes(file)) ? 
                    <div className='container'>
                        <p>File already exists in the database, do you want to overwrite it?</p>
                        <button type="button" onClick={handleYesButtonClicked} >Yes</button>
                        <button type="button" onClick={handleNoButtonClick}>No</button>
                    </div> : 
                    <div>
                        <p>Do you want to save cleaned file</p>
                        <button type="button" onClick={handleYesButtonClicked}>Yes</button>
                        <button type="button" onClick={handleNoButtonClick}>No</button>
                    </div>}
                    {saveMessage &&
                        <Popup isOpen={true} message={saveMessage} onClose={handleNoButtonClick}/>
                    }
                </div>
                
            </div>
        }
    </>
    )
}

export default UserConfigurationInterface;