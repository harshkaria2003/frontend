import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";





import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Counter from "./components/Counter";
import ImageUpload from "./components/ImageUpload";
import UserForm from "./components/UserForm";
import UserProfile from "./components/Userprofile";
import TicTac from "./components/TicTac";
import ExperienceForm from "./components/ExperienceForm";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Category from "./components/Category";

import { UserProvider } from "./context/UserContext";
import { useContext } from "react";
import UserContext from "./context/UserContext";

// Component shown when access is denied
const AccessDenied = () => (
  <div className="text-center mt-5">
    <h2 className="text-danger">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
  </div>
);


const ProfileRoute = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);

  if (!user || !id) return <AccessDenied />;

  const currentUserId = parseInt(user.id, 10);
  const profileId = parseInt(id, 10);
  const isAdmin = parseInt(user.role_id, 10) === 1;

  const isOwnProfile = currentUserId === profileId;

  return isAdmin || isOwnProfile ? <UserProfile /> : <AccessDenied />;
};

function App() {
  return (
    <UserProvider>
      <ThemedApp />
    </UserProvider>
  );
}

const ThemedApp = () => {
  const { theme, user } = useContext(UserContext);
  const isAdmin = parseInt(user?.role_id || 0, 10) === 1;

  return (
    <div className={theme}>
      <Router>
        {user && <Navbar />}

        <Routes>
          {/* Root Route */}
          <Route
            path="/"
            element={
              user ? (
                isAdmin ? (
                  <Home />
                ) : (
                  <Navigate to={`/profile/${user.id}`} />
                )
              ) : (
                <Login />
              )
            }
          />

         
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

          <Route path="/users" element={user ? <UserForm /> : <AccessDenied />} />
          <Route path="/profile/:id" element={<ProfileRoute />} />
          <Route path="/about" element={user ? <About /> : <AccessDenied />} />
          <Route path="/contact" element={user ? <Contact /> : <AccessDenied />} />
          <Route path="/counter" element={user ? <Counter /> : <AccessDenied />} />
          <Route path="/upload" element={user ? <ImageUpload /> : <AccessDenied />} />
          <Route path="/experience" element={user ? <ExperienceForm /> : <AccessDenied />} />
          <Route path="/tictac" element={user ? <TicTac /> : <AccessDenied />} />
          <Route path="/category" element={user ? <Category /> : <AccessDenied />} />
          <Route path="/" element={user ? <Category /> : <AccessDenied />} />

        
        
         

         
          <Route path="*" element={<AccessDenied />} />
        </Routes>

        {user && <Footer />}
      </Router>
    </div>
  );
};

export default App;
