import {NavLink} from 'react-router-dom';
import "./Navbar.css";


const Navbar : React.FC = () => {
    return(
        <nav>
            <ul>
                <li>
                    <NavLink to="/home">Home Page</NavLink>
                </li>
                <li>
                    <NavLink to="/upload">Upload Page</NavLink>
                </li>
                <li>
                    <NavLink to="/view-datasets">View Datasets Page</NavLink>
                </li>
                <li>
                    <NavLink to="/user-configuration-interface">User Configuration Page</NavLink>
                </li>
                <li>
                    <NavLink to="/visualisations">Visualisations Page</NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;