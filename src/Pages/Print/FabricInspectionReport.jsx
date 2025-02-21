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

    const grades = {
        7: 'A+',
        8: 'A*',
        2: 'B',
        3: 'C',
        4: 'PK',
        5: 'Sample',
        1: 'A'
    };

    const width = {
        '1': 44,
        '2': 58,
        '3': 60,
        '4': 64,
        '5': 66,
        '6': 68,
    };

  
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
                                    <td>: {data?.sc?.no}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>MO No</th>
                                    <td>: {data?.mo?.no}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>DO No</th>
                                    <td>: {data?.wo?.no}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Nomor Kartu (NK)</th>
                                    <td>: {data?.kartu_process_dyeing?.no}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-4">
                            <table style={{ width: "100%" }}>
                                <tbody>
                                <tr>
                                    <th style={{ width: "50%" }}>MOTIF / DESIGN</th>
                                    <td>: {data?.mo?.process === 1 ? data?.mo?.article : data?.mo?.design}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Colour Checked</th>
                                    <td>: {data?.kombinasi || data?.wo_color?.mo_color?.color}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Contract GSM</th>
                                    <td>: {data?.wo?.greige?.greige_group?.gramasi_kain}</td>
                                </tr>
                                <tr>
                                    <th style={{ width: "50%" }}>Contract Width</th>
                                    <td>: {width[data?.wo?.greige?.greige_group?.lebar_kain]}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-4">
                            <table style={{ width: "100%" }}>
                                <tbody>
                                <tr>
                                    <th style={{ width: "50%" }}>Buyer</th>
                                    <td>: {data?.sc?.customer?.cust_no}</td>
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
                    {inspectItem.length > 0 && Array.from({ length: Math.ceil(inspectItem.length / 12) }).map((_, i) => {
                        const unit = 1;
                        const inspectItems = inspectItem.slice(i * 12, (i + 1) * 12).filter(item => item.is_head === 1);   
                        const rawInspectItems = inspectItem.slice(i * 12, (i + 1) * 12);   
                        return (
                            <Table key={i} className="mt-2" bordered style={{tableLayout: "fixed", borderColor: "black",pageBreakInside: "avoid", fontSize: "11px"}}>
                                <tbody>
                                    <tr className="py-0">
                                        <td rowSpan={11} style={{ width: "25px", whiteSpace: "nowrap", verticalAlign: "middle"}} >{i+1}</td>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Tube</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j} style={{ width: "75px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.find(item => item.stock_id === inspectItems[j]?.stock_id)?.tube === 1 ? 'A' : data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.find(item => item.stock_id === inspectItems[j]?.stock_id)?.tube === 2 ? 'B' : ''}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >Roll No</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>{inspectItems[j]? 12 * i + j+1 : ''}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Lot No</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>{inspectItems[j]?.lot_no}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Gsm (gr/m2)</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>{inspectItems[j]?.gsm_item}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>length (yds)</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>
                                                {inspectItems[j]?.qty_sum} 
                                                {/* {inspectItems[j]?.join_piece ? `(${inspectItems[j]?.join_piece})` : ''} */}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Width (inches)</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>{inspectItems[j]?.id ? width[data?.sc_greige?.lebar_kain] : ''}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td style={{ width: "170px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Meter Ke-/Defect Point (inches)</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>
                                                {inspectItems[j]?.defect_item?.map(defect => (
                                                    <div key={defect.meterage}>
                                                        {`${defect.meterage} / ${defect.mst_kode_defect_id} / ${defect.point}`} 
                                                    </div>
                                                ))}
                                                {rawInspectItems
                                                    .filter(rawInspectItem => rawInspectItem?.join_piece === inspectItems[j]?.join_piece && rawInspectItem?.is_head === 0)
                                                    .flatMap(rawInspectItem => rawInspectItem?.defect_item || [])
                                                    .map(defect => (
                                                        <div key={defect.meterage}>
                                                            {`${defect.meterage} / ${defect.mst_kode_defect_id} / ${defect.point}`} 
                                                        </div>
                                                    ))
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td colSpan={13} style={{paddingBlock: "0.5px", paddingInline: "0px"}}></td>
                                    </tr>
                                    <tr>
                                        <td>Jumlah Point</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>
                                                {inspectItems[j]?.defect_item?.reduce((total, item) => total + parseInt(item.point, 10), 0) + 
                                                rawInspectItems
                                                    .filter(rawInspectItem => rawInspectItem?.join_piece === inspectItems[j]?.join_piece && rawInspectItem?.is_head === 0)
                                                    .flatMap(rawInspectItem => rawInspectItem?.defect_item || [])
                                                    .reduce((total, item) => total + parseInt(item.point, 10), 0)
                                                || ''}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Point/100 Square Yds</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>
                                            {inspectItems[j] && inspectItems[j].qty_sum && width[data?.sc_greige?.lebar_kain] ? 
                                                (((inspectItems[j]?.defect_item?.reduce((total, item) => total + parseInt(item.point, 10), 0) + 
                                                rawInspectItems
                                                    .filter(rawInspectItem => rawInspectItem?.join_piece === inspectItems[j]?.join_piece && rawInspectItem?.is_head === 0)
                                                    .flatMap(rawInspectItem => rawInspectItem?.defect_item || [])
                                                    .reduce((total, item) => total + parseInt(item.point, 10), 0)) * 3600) / 
                                                    (inspectItems[j].qty_sum * width[data?.sc_greige?.lebar_kain] * (unit === 2 ? 0.9144 : 1))).toFixed(1)
                                                    : ''}
                                            </td>

                                        ))}
                                    </tr>
                                    <tr>
                                        <td>Grade</td>
                                        {[...Array(12).keys()].map(j => (
                                            <td key={j}>{grades[inspectItems[j]?.grade]}</td>
                                        ))}
                                    </tr>
                                    {i === Math.ceil(inspectItem.length / 12) - 1 && (
                                        <>
                                            <tr>
                                                <td colSpan={6} className="">
                                                    <strong>Note:</strong>
                                                    <Stack direction="horizontal" gap={3}>
                                                        <p className="p-0 text-center mt-2">Point /100 Square Yds = </p>
                                                        <Stack direction="vertical">
                                                            <div className="p-0 text-center">Jumlah Point X 3600 </div>
                                                            <div className="m-1" style={{ borderTop: "3px solid black" }} />
                                                            <div className="p-0 text-center">lebar Fabric (Inches) X Panjang Fabric (Yds) </div>
                                                        </Stack>
                                                    </Stack>
                                                </td>
                                                <td colSpan={8} className="">
                                                    <strong>REMARKS:</strong>
                                                </td>
                                            </tr>
                                            <tr style={{ border: "none" }}>
                                                <td rowSpan={5} colSpan={6}>
                                                    <strong>STANDARD POINT:</strong>
                                                    <p className="p-0 text-bottom mt-2">
                                                        <span className="ms-1">Point A Grade &le; </span>
                                                        <u style={{ textDecoration: "underline" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
                                                        <span className="ms-1">point//100 sq yds</span>
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={4} className="text-center fw-bold">PREPARED</td>
                                                <td colSpan={4} className="text-center fw-bold">APPROVED</td>
                                            </tr>
                                            <tr>
                                                <td rowSpan={2} colSpan={4} style={{height: "90px"}}>
                                                </td>
                                                <td rowSpan={2} colSpan={4}>
                                                    
                                                </td>
                                            </tr>
                                        </>

                                )}
                                </tbody>

                            </Table>
                        );
                    })}
                    {/* Tabel Area */}
        
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
