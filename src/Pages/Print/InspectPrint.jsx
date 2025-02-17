import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Row, Col, Table, Stack } from "react-bootstrap";
import axiosInstance from '../../axiosConfig';
import LoadingSpinner from "../../Components/LoadingSpinner";
import ErrorPage from '../../ErrorPage';
import './Inspectprint.module.css';

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
                    <div className="d-flex justify-content-end align-items-center mb-4 no-print">
                    <h1 className="h6 mb-0">GAP - FRM - VP 03</h1>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center mb-4">
                    <h1 className="h4 mb-0">INSPECTING KAIN</h1>
                    <h1 className="h6 mb-0">BAGIAN : VERPACKING</h1>
                    </div>
        
                    <div className="print:block">
                    <div className="row">
                        <div className="col-6">
                        <table style={{ width: "100%", fontSize: "13px" }}>
                            <tbody>
                            <tr>
                                <th style={{ width: "50%" }}>TGL INSPECT</th>
                                <td>: {props.jenisProses === 'mkl-bj' ? data?.tgl_inspeksi ? new Date(data.tgl_inspeksi).toLocaleDateString('id-ID') : '-' : data?.tanggal_inspeksi ? new Date(data.tanggal_inspeksi).toLocaleDateString('id-ID') : '-'}</td>
                            </tr>
                            <tr>
                                <th style={{ width: "50%" }}>NO. DO</th>
                                <td>: {data?.wo?.no}</td>
                            </tr>
                            <tr>
                                <th style={{ width: "50%" }}>MOTIF</th>
                                <td>: {data?.wo?.greige?.nama_kain}</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                        <div className="col-6">
                        <table style={{ width: "100%", fontSize: "13px" }}>
                            <tbody>
                            <tr>
                                <th style={{ width: "50%" }}>DESIGN</th>
                                <td>: {data?.mo?.process === 1 ? data?.mo?.article : data?.mo?.design}</td>
                            </tr>
                            <tr>
                                <th style={{ width: "50%" }}>KOMBINASI</th>
                                <td>: {data?.kombinasi || data?.wo_color?.mo_color?.color}</td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                    {/* Tabel Area */}
                    {[...Array(Math.max(Math.ceil(inspectItem.length / 10), 4))].map((_, j) => (
                            <Table className="mt-2" bordered key={j} style={{tableLayout: "fixed", borderColor: "black",pageBreakInside: "avoid"}}>
                            <tbody style={{ fontSize: "12px" }}>
                                <tr >
                                <td style={{width: "10%"}} >NO. PCS</td>
                                {[...Array(10)].map((_, i) => (
                                    <td style={{width: "8",fontSize: "9px"}} key={i}>{j * 10 + i + 1}</td>
                                ))}
                                </tr>
                                <tr>
                                <td style={{width: "10%"}}>GRADE A</td>
                                {[
                                    ...inspectItem
                                    .filter(item => [7, 1, 8].includes(item.grade))
                                    .slice(j * 10, j * 10 + 10),
                                    ...Array(10).fill({ qty: '' })
                                ]
                                    .slice(0, 10)
                                    .map((item, i) => (
                                    <td style={{width: "8",fontSize: "14px"}} key={i} className="py-0">
                                        <b>{item.qty}</b> {item.join_piece && "(" + item.join_piece + ")"}
                                        <div style={{fontSize: "10px", color: "red"}}>{item.defect_item?.map(defect => defect.mst_kode_defect_id).join(' , ') || ''}</div>
                                    </td>
                                    ))}
                                </tr>
                                <tr>
                                <td style={{width: "10%"}}>GRADE C</td>
                                {[
                                    ...inspectItem
                                    .filter(item => ![7, 1, 8, 4,5].includes(item.grade))
                                    .slice(j * 10, j * 10 + 10),
                                    ...Array(10).fill({ qty: '' })
                                ]
                                    .slice(0, 10)
                                    .map((item, i) => (
                                    <td style={{width: "8" ,fontSize: "14px"}} key={i} className="py-0">
                                        <b>{item.qty}</b> {item.join_piece && "(" + item.join_piece + ")"}
                                        <div style={{fontSize: "10px", color: "red"}}>{item.defect_item?.map(defect => defect.mst_kode_defect_id).join(' , ') || ''}</div>

                                    </td>
                                ))}
                                </tr>
                            </tbody>
                            </Table>
                    ))}
                    {/* Tabel Area */}
                    <div style={{pageBreakInside: "avoid"}}>
                        <Row style={{ fontSize: "14px" }}>
                        <div className="col-8">
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">TGL KIRIM KE GD. JADI</div>
                                <div className="col">: {data?.date ? new Date(data.date).toLocaleDateString('id-ID') : '-'}</div>
                            </Stack>
                            </Row>
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">STAMPING</div>
                                <div className="col">: Face : {data?.mo?.face_stamping?.replace(/<[^>]*>/g, '')} / Selvedge : {data?.mo?.selvedge_stamping?.replace(/<[^>]*>/g, '')}</div>
                            </Stack>
                            </Row>
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">PIECE LENGTH</div>
                                <div className="col">: {data?.mo?.piece_length}</div>
                            </Stack>
                            </Row>
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">JML GRADE A</div>
                                <div className="col">
                                <Stack direction="horizontal" gap={4}>
                                    <div>: {inspectItem.filter(item => [7, 1, 8].includes(item.grade)).length} PCS</div>
                                    <div>: {inspectItem.filter(item => [7, 1, 8].includes(item.grade)).reduce((total, item) => total + parseInt(item.qty, 10), 0)} Y/M</div>
                                </Stack>
                                </div>
                            </Stack>
                            </Row>
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">JML GRADE C</div>
                                <div className="col">
                                <Stack direction="horizontal" gap={4}>
                                    <div>: {inspectItem.filter(item => ![7, 1, 8].includes(item.grade)).length} PCS</div>
                                    <div>: {inspectItem.filter(item => ![7, 1, 8,4,5].includes(item.grade)).reduce((total, item) => total + parseInt(item.qty, 10), 0)} Y/M</div>
                                </Stack>
                                </div>
                            </Stack>
                            </Row>
                            <Row className="my-2">
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">JML P/K</div>
                                <div className="col">
                                <Stack direction="horizontal" gap={4}>
                                <div>: {inspectItem.filter(item => [4].includes(item.grade)).length} PCS</div>
                                <div>: {inspectItem.filter(item => [4].includes(item.grade)).reduce((total, item) => total + parseInt(item.qty, 10), 0)} Y/M</div>
                                </Stack>
                                </div>
                            </Stack>
                            </Row>
                            <Row>
                            <Stack direction="horizontal">
                                <div className="col-4 fw-bold">JML CONTOH</div>
                                <div className="col">
                                <Stack direction="horizontal" gap={4}>
                                <div>: {inspectItem.filter(item => [5].includes(item.grade)).length} PCS</div>
                                <div>: {inspectItem.filter(item => [5].includes(item.grade)).reduce((total, item) => total + parseInt(item.qty, 10), 0)} Y/M</div>
                                </Stack>
                                </div>
                            </Stack>
                            </Row>
                            <hr />
                        </div>
                        
                        <div className="col-4">
                            <Table bordered className="mt-1"  style={{ borderColor: "black"}}>
                            <thead>
                                <tr style={{textAlign:'center'}}>
                                <td>PENGIRIM</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ height: "9em" }}>
                                <td></td>
                                </tr>
                            </tbody>
                            </Table>
                            <Table bordered className="mt-1"  style={{ borderColor: "black"}}>
                            <thead>
                                <tr style={{textAlign:'center'}}>
                                <td>PENERIMA</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ height: "9em" }}>
                                <td></td>
                                </tr>
                            </tbody>
                            </Table>
                        </div>
                        </Row>
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
