import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Table, Stack } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../Components/LoadingSpinner";
import ErrorPage from "../../ErrorPage";
import "./Inspectprint.module.css";
import { FaCheck } from "react-icons/fa";

const InspectPrint = ({ jenisProses }) => {
  const { idInspecting } = useParams();
  document.title = `Inspect ${
    jenisProses.charAt(0).toUpperCase() + jenisProses.slice(1)
  } Print Kartu : ${idInspecting}`;

  const type = "landscape";
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
  const [data, setData] = useState(null);
  const [inspectItem, setInspectItem] = useState([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kartuProsesItem, setKartuProsesItem] = useState([]);

  const stockGreigeGrade ={
    7: "A+",
    8: "A*",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    1: "A",
    6: 'NG',
    9: 'Putih'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          jenisProses === "mkl-bj"
            ? "inspecting/get-inspecting-mkl-bj"
            : "inspecting/get-inspecting";
        const response = await axiosInstance.get(`${url}/${idInspecting}`);
        setData(response.data.data);

        if (jenisProses === "mkl-bj") {
          setInspectItem(
            response.data.data?.inspecting_mklbj_item?.sort(
              (a, b) => a.no_urut - b.no_urut
            ) || []
          );
        } else {
          setInspectItem(
            response.data.data?.inspecting_item?.sort((a, b) => a.no_urut - b.no_urut) ||
              []
          );
          setKartuProsesItem(
            response.data.data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.sort(
              (a, b) => a.tube - b.tube
            ) || []
          );
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
    console.log(inspectItem);
    console.log(data);
    
  }, [inspectItem]);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (isError) return <ErrorPage status={isError} />;

  return (
    <div className="container-fluid py-4 a4-portrait">
      <div className="card border-1 shadow-sm print:border-0">
        <div className="card-body print:p-0 landscape-page" ref={printRef}>
          <div className="d-flex justify-content-end align-items-center no-print">
            <h1 className="h6 mb-0" style={{ fontSize: "8px" }}>
              GAP - FRM - GG - 03
            </h1>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center mb-2">
            <h1 className="h6 mb-0">
              KARTU INSPECTING {jenisProses.toUpperCase()}
            </h1>
          </div>
          <div className="print:block">
            <div className="row">
              <div className="col-6">
                <table style={{ width: "100%", fontSize: "9px" }}>
                  <tbody>
                    <tr>
                      <th style={{ width: "50%" }}>
                        OPERATOR: {data?.created_by?.full_name}
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-6">
                <table style={{ width: "100%", fontSize: "9px" }}>
                  <tbody>
                    <tr>
                      <th style={{ width: "50%" }}></th>
                      <th>
                        TGL SELESAI INSPECT :{" "}
                        {data?.tanggal_inspeksi
                          ? new Date(data.tanggal_inspeksi).toLocaleDateString(
                              "en-GB",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          : ""}
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Table
            bordered
            responsive
            style={{ fontSize: "9px", borderColor: "black" }}
          >
            <thead>
              <tr>
                <th className="text-center" rowSpan={2}>
                  Tube
                </th>
                <th className="text-center" rowSpan={2}>
                  No
                </th>
                <th colSpan={4} className="text-center">
                  Asal Greige
                </th>
                <th className="text-center" rowSpan={2} colSpan={10}>
                  HASIL INSPECT
                </th>
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
                  <td>
                    {item.tube === 1 ? "A" : item.tube === 2 ? "B" : item.tube}
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    {new Intl.DateTimeFormat("id-ID", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(new Date(item.date))}
                  </td>
                  <td>{item.mesin}</td>
                  <td>{stockGreigeGrade[item?.stock?.grade]}</td>
                  <td>{item.panjang_m}</td>
                  {[...Array(10)].map((_, idx) => {
                    const inspect = inspectItem.filter(
                      (inspect) => inspect.stock_id === item.stock_id
                    )[idx];
                    return (
                      <td
                        key={idx}
                        className="py-0"
                        style={{ fontSize: "7px", width: "50px" }}
                      >
                        <b style={{ fontSize: "10px", width: "50px" }}>
                          {inspect?.qty ||""}
                        </b>
                        {inspect?.no_urut && inspect.grade !== 5 ? ` (${inspect.no_urut})` : ""}
                        <div style={{ fontSize: "8px", color: "red" }}>
                          {inspect?.defect_item
                            ?.map(
                              (defect) =>
                                `${defect.meterage}/${defect.mst_kode_defect.no_urut}/${defect.point}`
                            )
                            .join(" , ") || ""}
                        </div>
                      </td>
                    );
                  })}
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.qty_bit !== null &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) =>
                          total + parseInt(insItem.qty_bit, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 4 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 1 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 8 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 7 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 2 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter(
                        (insItem) =>
                          insItem.grade === 3 &&
                          insItem.stock_id === item.stock_id
                      )
                      .reduce(
                        (total, insItem) => total + parseInt(insItem.qty, 10),
                        0
                      )}
                  </td>
                  <td>
                    {inspectItem
                      .filter((insItem) => insItem.stock_id === item.stock_id)
                      .reduce(
                        (total, insItem) =>
                          total +
                          parseInt(insItem.qty, 10) +
                          (insItem.qty_bit ? parseInt(insItem.qty_bit, 10) : 0),
                        0
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>TOTAL</td>
                <td>PCS</td>
                <td>
                  {kartuProsesItem.reduce(
                    (total, item) => total + item.panjang_m,
                    0
                  )}
                </td>
                <td colSpan={10}>
                  <Stack direction="horizontal" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "50%",
                      }}
                    >
                      <div
                        style={{
                          width: "25px",
                          height: "20px",
                          border: "solid",
                          marginRight: "5px",
                          padding: "2px",
                        }}
                      >
                        {data?.mo.packing_method === 1 && <FaCheck size={15}/>}
                      </div>
                      <div>
                        <b>SINGLE FOLDED</b>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "50%",
                      }}
                    >
                      <div
                        style={{
                          width: "25px",
                          height: "20px",
                          border: "solid",
                          marginRight: "5px",
                        }}
                      >
                        {data?.mo.packing_method === 2 && <FaCheck size={15}/>}
                      </div>
                      <div>
                        <b>DOUBLE FOLDED</b>
                      </div>
                    </div>
                  </Stack>
                </td>
                <td>
                  {inspectItem.reduce(
                    (total, item) => total + (parseInt(item.qty_bit, 10) || 0),
                    0
                  )}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 4)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 1)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 8)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 7)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 2)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 3)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
                <td className="fw-bold">
                  {inspectItem.reduce(
                    (total, item) =>
                      total +
                      (parseInt(item.qty_bit, 10) || 0) +
                      parseInt(item.qty, 10),
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          </Table>
          <Table bordered style={{ fontSize: "9px", borderColor: "black" }}>
            <tbody>
              <tr>
                <td>TGL TERIMA DARI FINISHING</td>
                <td></td>
                <td rowSpan={3} style={{ maxWidth: "75px", wordWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal" }}>
                  SELVEDGE
                  <br />
                  <p style={{ fontSize: "11px", margin: 0 }}>{data?.mo?.selvedge_continues}</p>
                </td>
                <td rowSpan={3}>KETERANGAN:</td>
                <td style={{ verticalAlign: "middle", textAlign: "center" }} rowSpan={3}>SUSUT</td>
                <td>YARDS</td>
                <td>%</td>
              </tr>
              <tr>
                <td>PIECE LENGTH</td>
                <td></td>
                <td rowSpan={2}></td>
                <td rowSpan={2} className="fw-bold">
                      {kartuProsesItem && inspectItem && data.unit === 1
                        ? ((kartuProsesItem.reduce(
                            (total, item) => total + item.panjang_m,
                            0
                          ) - (
                            inspectItem.reduce(
                              (total, item) =>
                                total +
                                (parseInt(item.qty_bit, 10) || 0) +
                                parseInt(item.qty, 10),
                              0
                            )
                          ))  /  kartuProsesItem.reduce(
                            (total, item) => total + item.panjang_m,
                            0
                          ) * 100
                        ).toFixed(2)
                        : null}

                      {kartuProsesItem && inspectItem && data.unit === 2
                        ? (((kartuProsesItem.reduce(
                            (total, item) => total + item.panjang_m,
                            0
                          ) / 0.9144) - (
                            inspectItem.reduce(
                              (total, item) =>
                                total +
                                (parseInt(item.qty_bit, 10) || 0) +
                                parseInt(item.qty, 10),
                              0
                            )
                          ))  /  (kartuProsesItem.reduce(
                            (total, item) => total + item.panjang_m,
                            0
                          ) / 0.9144) * 100
                        ).toFixed(2)
                        : null}
                </td>
              </tr>
              <tr>
                <td>CONTOH</td>
                <td>
                  {inspectItem
                    .filter((item) => item.grade === 5)
                    .reduce((total, item) => total + parseInt(item.qty, 10), 0)}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
        <button
          onClick={handlePrint}
          className="btn bg-burgundy text-white m-2 no-print"
        >
          <FiPrinter className="me-2" /> Print
        </button>
      </div>
    </div>
  );
};

export default InspectPrint;
