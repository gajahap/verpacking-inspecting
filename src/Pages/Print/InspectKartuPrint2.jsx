import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Table } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../Components/LoadingSpinner";
import ErrorPage from "../../ErrorPage";
import './Inspectprint.module.css';

const InspectPrint = ({ jenisProses }) => {
  const printRef = useRef();
  const { idInspecting } = useParams();
  const [data, setData] = useState(null);
  const [inspectItem, setInspectItem] = useState([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kartuProsesItem, setKartuProsesItem] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = jenisProses === "mkl-bj" ? "inspecting/get-inspecting-mklbj" : "inspecting/get-inspecting";
        const response = await axiosInstance.get(`${url}/${idInspecting}`);
        setData(response.data.data);
        
        if (jenisProses === "mkl-bj") {
          setInspectItem(response.data.data?.inspecting_mklbj_item?.sort((a, b) => a.id - b.id) || []);
        } else {
          setInspectItem(response.data.data?.inspecting_item?.sort((a, b) => a.id - b.id) || []);
          setKartuProsesItem(response.data.data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.sort((a, b) => a.tube - b.tube) || []);
        }
      } catch (error) {
        setIsError(error.response?.status || true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idInspecting, jenisProses]);

  useEffect(() => {
    console.log(kartuProsesItem);
    
  }, [kartuProsesItem]);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (isError) return <ErrorPage status={isError} />;

  return (
    <div className="container py-4 a4-portrait">
      <div className="card border-1 shadow-sm print:border-0">
        <div className="card-body print:p-0 landscape-page" ref={printRef} >
          <div className="d-flex justify-content-end align-items-center no-print">
            <h1 className="h6 mb-0" style={{ fontSize: "8px" }}>GAP - FRM - GG - 03</h1>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center mb-2">
            <h1 className="h6 mb-0">KARTU INSPECTING {jenisProses.toUpperCase()}</h1>
          </div>
          <div className="print:block">
                <div className="row">
                    <div className="col-6">
                        <table style={{ width: "100%", fontSize: "9px" }}>
                        <tbody>
                            <tr>
                            <th style={{ width: "50%" }}>OPERATOR:</th>
                            <td></td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    <div className="col-6">
                        <table style={{ width: "100%", fontSize: "9px" }}>
                        <tbody>
                            <tr>
                            <th style={{ width: "50%" }}></th>
                            <th>TGL SELESAI INSPECT :</th>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
          </div>

          <Table bordered responsive style={{ fontSize: "9px", borderColor: "black" }}>
            <thead>
              <tr>
                <th className="text-center" rowSpan={2}>Tube</th>
                <th className="text-center" rowSpan={2}>No</th>
                <th colSpan={4} className="text-center">Asal Greige</th>
                <th className="text-center" rowSpan={2} colSpan={10}>HASIL INSPECT</th>
                <th rowSpan={2}>BITS</th>
                <th rowSpan={2}>PK</th>
                <th rowSpan={2}>A</th>
                <th rowSpan={2}>A*</th>
                <th rowSpan={2}>A+</th>
                <th rowSpan={2}>B</th>
                <th rowSpan={2}>C</th>
                <th rowSpan={2}>TOTAL</th>
              </tr>
              <tr>
                <th>Tgl</th>
                <th>Mc</th>
                <th>Grade</th>
                <th>M/YD</th>
              </tr>
            </thead>
            <tbody>
              {kartuProsesItem.map((item, index) => (
                <tr key={index}>
                  <td>{item.tube === 1 ? "A" : item.tube === 2 ? "B" : item.tube}</td>
                  <td>{index + 1}</td>
                  <td>{new Intl.DateTimeFormat("id-ID", { year: "2-digit", month: "2-digit", day: "2-digit" }).format(new Date(item.date))}</td>
                  <td>{item.mesin}</td>
                  <td></td>
                  <td>{item.panjang_m}</td>
                  {[...Array(10)].map((_, idx) => {
                    const inspect = inspectItem.filter(inspect => inspect.stock_id === item.stock_id)[idx];
                    return (
                      <td key={idx} className="py-0" style={{ fontSize: "10px", width: "50px" }}>
                        <b>{inspect?.qty || ""}</b>
                        <div style={{ fontSize: "8px", color: "red" }}>
                          {inspect?.defect_item?.map(defect => `${defect.meterage}/${defect.mst_kode_defect_id}/${defect.point}`).join(" , ") || ""}
                        </div>
                      </td>
                    );
                  })}
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <button onClick={handlePrint} className="btn bg-burgundy text-white m-2 no-print">
          <FiPrinter className="me-2" /> Print
        </button>
      </div>
    </div>
  );
};

export default InspectPrint;
