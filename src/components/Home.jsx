import { useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h2>Welcome to Home Page</h2>
      <button onClick={() => navigate("/counter")}>Go to Counter</button><br></br>
      <button onClick={() => navigate("/upload")}>Go to Image Upload</button><br></br>
      <button onClick={() => navigate("/Users")}>go to all data </button><br></br>
      <button onClick={() => navigate("/TicTac")}>go to GAME  </button><br></br>
     <button onClick={() => navigate("/Category")}>go to Category</button><br></br>
     
      

     

    </div>
  );  
};

export default Home;  
