import {NavLink} from 'react-router-dom';
import "./Navbar.css";


const Navbar : React.FC = () => {
    return(
        <nav>
            <ul>
                <li>
                    <NavLink to="/upload">Upload Page</NavLink>
                </li>
                <li>
                    <NavLink to="/view-datasets">View Datasets Page</NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;