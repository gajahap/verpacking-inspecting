import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Row, Col, Table, Stack } from "react-bootstrap";
import axiosInstance from '../../axiosConfig';
import LoadingSpinner from "../../Components/LoadingSpinner";
import ErrorPage from '../../ErrorPage';
import './Inspectprint.module.css';
import gapImage from "../../Assets/logo-gajah/gap.png";

const InspectPrint = (props) => {
    const type = "portrait";
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
        @media print {
            @page {
            size: A4 ${type};
            margin: 0.5cm;
            }
        }
        `;
        document.head.appendChild(style);

        return () => {
        document.head.removeChild(style);
        };
    }, [type]);

    const printRef = useRef();
    const [data, setData] = useState([]);
    const [inspectItem, setInspectItem] = useState([]);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);
  
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
    };
  
    const { idInspecting } = useParams();
  
    useEffect(() => {
      const fetchDataAsync = async () => {
        try {
          const url = props.jenisProses === 'mkl-bj' ? 'inspecting/get-inspecting-mkl-bj' : 'inspecting/get-inspecting';
          const response = await axiosInstance.get(`${url}/${idInspecting}`);
          setData(response.data.data);
          if (props.jenisProses === 'mkl-bj') {
            setInspectItem(response.data.data.inspecting_mklbj_item.sort((a, b) => a.id - b.id));
          }else{
            setInspectItem(response.data.data.inspecting_item.sort((a, b) => a.id - b.id));
          }
        } catch (error) {
          setIsError(error.response?.status);
        } finally {
          setLoading(false);
        }
      };
      fetchDataAsync();
    }, [idInspecting, props.jenisProses]);
  
    useEffect(() => {
      console.log(data);
    }, [inspectItem]);

    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : isError ? <ErrorPage status={isError} /> : (
            <div className="container py-4 a4-portrait">
                <div className="card border-1 shadow-sm print:border-0">
                <div className="card-body print:p-0" ref={printRef}>
                    <div className="row align-items-center">
                        <div className="col-6 align-items-center">
                            <img src={gapImage} alt="logo" style={{width: "100px"}} />
                        </div>
                        <div className="col-6 d-flex flex-column align-items-end justify-content-end">
                            <h1 className="h6 mb-0">Form No.</h1>
                            <h1 className="h2 mb-0" style={{textDecoration: "underline"}}>FABRIC INSPECTION REPORT</h1>
                        </div>
                    </div>
        
                    <div className="print:block">
                    <div className="row" style={{fontSize: "11px"}}>
                        <div className="col-4">
                            <table style={{ width: "100%" }}>
                                <tbody>
                                <tr>
                                    <th style={{ width: "50%" }}>SC No</th>
                                    <td>: </td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>MO No</th>
                                    <td>: {data?.wo?.greige?.nama_kain}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>DO No</th>
                                    <td>: {data?.wo?.no}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Nomor Kartu (NK)</th>
                                    <td>: {data?.wo?.greige?.nama_kain}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-4">
                            <table style={{ width: "100%" }}>
                                <tbody>
                                <tr>
                                    <th style={{ width: "50%" }}>MOTIF / DESIGN</th>
                                    <td>: {data?.wo?.greige?.nama_kain}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Colour Checked</th>
                                    <td>: {data?.mo?.process === 1 ? data?.mo?.article : data?.mo?.design}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Contract GSM</th>
                                    <td>: {data?.kombinasi || data?.wo_color?.mo_color?.color}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Contract Width</th>
                                    <td>: {data?.wo?.greige?.nama_kain}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-4">
                            <table style={{ width: "100%" }}>
                                <tbody>
                                <tr>
                                    <th style={{ width: "50%" }}>Buyer</th>
                                    <td>: {data?.wo?.greige?.nama_kain}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Inspector</th>
                                    <td>: {data?.created_by.full_name}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Inspector Table No.</th>
                                    <td>: {data?.inspection_table}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Inspection Date</th>
                                    <td>: {props.jenisProses === 'mkl-bj' ? data?.tgl_inspeksi ? new Date(data.tgl_inspeksi).toLocaleDateString('id-ID') : '-' : data?.tanggal_inspeksi ? new Date(data.tanggal_inspeksi).toLocaleDateString('id-ID') : '-'}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Tabel Area */}
                    <Table className="mt-2" bordered style={{tableLayout: "fixed", borderColor: "black",pageBreakInside: "avoid", fontSize: "11px"}}>
                        <tbody>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Tube</td>
                                <td>A</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Roll No</td>
                                <td>1</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Lot No</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Gsm (gr/m2)</td>
                                <td>240</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>length (yds)</td>
                                <td>35</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Width (inches)</td>
                                <td>58</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Meter Ke-/Defect Point (inches)</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>

                    </Table>
                    {/* Tabel Area */}
                    <div style={{pageBreakInside: "avoid"}}>

                    </div>
        
                    </div>
                </div>
                <button onClick={handlePrint} className="btn bg-burgundy text-white m-2 no-print">
                    <FiPrinter className="me-2" />
                    Print
                </button>
                </div>
            </div>
            )}
        </>
        

    );
};

export default InspectPrint;
