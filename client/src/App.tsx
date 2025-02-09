import {Routes, Route} from 'react-router-dom'
import "./App.css"
import Home from "./pages/Home"
import Upload from "./pages/Upload"
import UserConfigurationInterface from "./pages/UserConfigurationInterface"
import Visualisations from "./pages/Visualisations"
import NoPage from "./pages/NoPage"
import Navbar from "./components/Navbar"

const App : React.FC = () => {
  return (
    <div className="App">
      <Navbar />
	    <Routes>
		    <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/user-configuration-interface" element={<UserConfigurationInterface />} />
        <Route path="/visualisations" element={<Visualisations />} />
        <Route path="*" element={<NoPage />} />
	    </Routes>
    </div>
  );
}

export default App
