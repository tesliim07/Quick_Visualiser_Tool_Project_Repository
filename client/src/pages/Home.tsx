import React from 'react';
import './HomePage.css';

const Home: React.FC = () => {

    const handleDirectToUploadPage = () => {
        window.location.href = '/upload';
    };

    return (
        <div className="container">
            <h1>Home Page</h1>
            <p>This is a Quick Visualiser Tool</p>
            <p>Please Click the start button and it will direct you to the upload page or you can click the upload page link also</p>
            <button type='button' onClick={handleDirectToUploadPage}>Start</button>
        </div>
    );
};

export default Home;