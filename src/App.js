import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Middleware from './Middleware';
import Dashboard from './Pages/Dashboard';
import InspectingCreate from './Pages/Inspecting/InspectingCreate';
import InspectingCreateMklBj from './Pages/Inspecting/InspectingCreateMklBj'
import InspectingView from './Pages/Inspecting/InspectingView';
import ErrorPage from './ErrorPage';
import InspectPrint from './Pages/Print/InspectPrint';
import InspectKartuPrint from './Pages/Print/InspectKartuPrint2';
import FabricInspectionReport from './Pages/Print/FabricInspectionReport';


const App = () => {
  return (
    <Router>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/" element={<Middleware><Dashboard /></Middleware>} />
          <Route path="/inspecting-create-dyeing" element={<Middleware><InspectingCreate jenisProses="dyeing" /></Middleware>} />
          <Route path="/inspecting-create-printing" element={<Middleware><InspectingCreate jenisProses="printing" /></Middleware>} />
          <Route path="/inspecting-create-mkl-bj" element={<Middleware><InspectingCreateMklBj jenisProses="mkl-bj" /></Middleware>} />

          <Route path="/inspecting-dyeing/:idInspecting" element={<Middleware><InspectingView jenisProses="dyeing" /></Middleware>} />
          <Route path="/inspecting-printing/:idInspecting" element={<Middleware><InspectingView jenisProses="printing" /></Middleware>} />
          <Route path="/inspecting-mkl-bj/:idInspecting" element={<Middleware><InspectingView jenisProses="mkl-bj"/></Middleware>} />

          <Route path="/print/inspecting/dyeing/:idInspecting" element={<Middleware><InspectPrint jenisProses="dyeing" /></Middleware>} />
          <Route path="/print/inspecting/printing/:idInspecting" element={<Middleware><InspectPrint jenisProses="printing" /></Middleware>} />
          <Route path="/print/inspecting/mkl-bj/:idInspecting" element={<Middleware><InspectPrint jenisProses="mkl-bj" /></Middleware>} />

          <Route path="/print/inspecting-kartu/dyeing/:idInspecting" element={<Middleware><InspectKartuPrint jenisProses="dyeing" /></Middleware>} />
          <Route path="/print/inspecting-kartu/printing/:idInspecting" element={<Middleware><InspectKartuPrint jenisProses="printing" /></Middleware>} />
          <Route path="/print/inspecting-kartu/mkl-bj/:idInspecting" element={<Middleware><InspectKartuPrint jenisProses="mkl-bj" /></Middleware>} />

          <Route path="/print/fir/dyeing/:idInspecting" element={<Middleware><FabricInspectionReport jenisProses="dyeing" /></Middleware>} />
          <Route path="/print/fir/printing/:idInspecting" element={<Middleware><FabricInspectionReport jenisProses="printing" /></Middleware>} />
          <Route path="/print/fir/mkl-bj/:idInspecting" element={<Middleware><FabricInspectionReport jenisProses="mkl-bj" /></Middleware>} />

      </Routes>
    </Router>
  );
};

export default App;

