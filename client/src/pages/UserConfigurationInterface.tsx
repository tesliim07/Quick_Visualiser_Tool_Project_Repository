import {useState} from 'react';

const UserConfigurationInterface : React.FC = () => {
    const[selectedRemoveDuplicatesCheckbox, setselectedRemoveDuplicatesCheckbox] = useState<string>("yes");
    const[selectedRemoveRowsWithNullsCheckbox, setselectedRemoveRowsWithNullsCheckbox] = useState<string>("yes");
    const[selectedIgnoreIndexColumnsCheckbox, setselectedIgnoreIndexColumnsCheckbox] = useState<string>("yes");
    const[selectedDetectBadDataCheckbox, setselectedDetectBadDataCheckbox] = useState<string>("yes");

    const handleRemoveDuplicatesCheckboxChange = (value: string) => {
        setselectedRemoveDuplicatesCheckbox(value);
    }

    const handleRemoveRowsWithNullsCheckboxChange = (value: string) => {
        setselectedRemoveRowsWithNullsCheckbox(value);
    }

    const handleIgnoreIndexColumnsCheckboxChange = (value: string) => {
        setselectedIgnoreIndexColumnsCheckbox(value);
    }

    const handleDetectBadDataCheckboxChange = (value: string) => {
        setselectedDetectBadDataCheckbox(value);
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = {
            removeDuplicates: selectedRemoveDuplicatesCheckbox,
            removeRowsWithNulls: selectedRemoveRowsWithNullsCheckbox,
            ignoreIndexColumns: selectedIgnoreIndexColumnsCheckbox,
            detectBadData: selectedDetectBadDataCheckbox    
        };

        console.log(JSON.stringify(formData, null, 2));
    }

    return(
        <div>
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
                <div>
                    <p>Detect bad data</p>
                    <label>No</label>
                    <input type='checkbox' name='detectBadDataNo' id='detectBadDataNo' checked={selectedDetectBadDataCheckbox === "no"} onChange={() => handleDetectBadDataCheckboxChange("no")}/>
                    <label>Yes</label>
                    <input type='checkbox' name='detectBadDataYes' id='detectBadDataYes' checked={selectedDetectBadDataCheckbox === "yes"} onChange={() => handleDetectBadDataCheckboxChange("yes")}/>
                </div>
                <button type='submit' >Submit</button>
            </form>
        </div>
    )

}

export default UserConfigurationInterface;