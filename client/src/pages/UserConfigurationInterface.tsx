import {useState} from 'react';
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
    const [errorMessage, setErrorMessage] = useState<string|null>(null);
    const [successfulMessage, setSuccessMessage] = useState<string | null>(null);

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
        setErrorMessage(null);
    }

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
            removeRowsWithNulls: selectedRemoveRowsWithNullsCheckbox,
            ignoreIndexColumns: selectedIgnoreIndexColumnsCheckbox,
            // detectBadDataPercentagePerColumn: selectedDetectBadDataPercentagePerColumnCheckbox,
            changeColumnDataTypes: selectedChangeDataTypesCheckbox,
            changeDataTypes: selectedChangeDataTypesCheckbox === "yes" ? changeDataTypes : {}
        };

        setSuccessMessage("User configuration successful");

        console.log(JSON.stringify(formData, null, 2));
        setUserConfigs(formData);
    }

    return(
    <>
        <div className="container">
            <h1>User Configuration Interface Page</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <p>Remove Duplicates</p>
                    <label>No</label>
                    <input type='checkbox' name='removeDuplicatesNo' id='removeDuplicatesNo' checked={selectedRemoveDuplicatesCheckbox === "no"} onChange={() => handleRemoveDuplicatesCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='removeDuplicatesYes' id='removeDuplicatesYes' checked={selectedRemoveDuplicatesCheckbox === "yes"} onChange={() => handleRemoveDuplicatesCheckboxChange("yes")}/>
                </div>
                <div>
                    <p>Remove Rows with Nulls</p>
                    <label>No</label>
                    <input type='checkbox' name='removeRowsWithNullsNo' id='removeRowsWithNullsNo' checked={selectedRemoveRowsWithNullsCheckbox === "no"} onChange={() => handleRemoveRowsWithNullsCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='removeRowsWithNullsYes' id='removeRowsWithNullsYes' checked={selectedRemoveRowsWithNullsCheckbox === "yes"} onChange={() => handleRemoveRowsWithNullsCheckboxChange("yes")}/>
                </div>
                <div>
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
                <div>
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
                <button type='submit' disabled={selectedChangeDataTypesCheckbox=="yes" && changeDataTypesText===""}>Submit</button>
            </form>
        </div>
        {
            successfulMessage && <div className="">
                <ModifiedCSVPreviewDisplay userConfigs={userConfigs}/>
            </div>
        }
    </>
    )

}

export default UserConfigurationInterface;