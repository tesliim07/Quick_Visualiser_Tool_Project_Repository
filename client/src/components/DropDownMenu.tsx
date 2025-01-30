import React from 'react'
import { useState } from 'react'

interface DropDownMenuProps {
    onFileTypeChange: (fileType: string) => void;
}
const DropDownMenu: React.FC<DropDownMenuProps> = ({ onFileTypeChange }) => {
    const [fileType, setFileType] = useState<string>("csv");

    const handleFileTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFileType = event.target.value;
        setFileType(selectedFileType);
        onFileTypeChange(selectedFileType);
    };

  return (
    <div>
      <p>File Types:</p>
      <select onChange={handleFileTypeChange}>
        <option value="csv">csv</option>
        <option value="json" disabled>json</option>
      </select>
      <p>Selected file type: {fileType}</p>
    </div>
  );
};

export default DropDownMenu;