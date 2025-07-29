import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Table, Stack } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../Components/LoadingSpinner";
import ErrorPage from "../../ErrorPage";
import "./Inspectprint.module.css";
import gapImage from "../../Assets/logo-gajah/gap.png";

const InspectPrint = (props) => {
  const { idInspecting } = useParams();
  document.title = `Inspect ${
    props.jenisProses.charAt(0).toUpperCase() + props.jenisProses.slice(1)
  } Print 4.0 : ${idInspecting}`;

  const type = "portrait";
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
        @media print {
            @page {
            size: F4 ${type};
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
  const [kartuProsesItem, setKartuProsesItem] = useState([]);
  // const [rawData, setRawData] = useState([]);

  const grades = {
    7: "A+",
    8: "A*",
    2: "B",
    3: "C",
    4: "PK",
    5: "Sample",
    1: "A",
  };

  const width = {
    1: 44,
    2: 58,
    3: 60,
    4: 64,
    5: 66,
    6: 68,
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
  };

  const handleGetRawData = () => {
    const dataArray = [];
    const items = data.inspecting_item
      ? data.inspecting_item
      : data.inspecting_mklbj_item;
    const itemsFiltered = data.inspecting_item
      ? data.inspecting_item.filter((item) => item.is_head === 1)
      : data.inspecting_mklbj_item.filter((item) => item.is_head === 1);
    for (let i = 0; i < itemsFiltered.length; i++) {
      dataArray.push({
        id: items
          .filter((item) => item.join_piece === itemsFiltered[i].join_piece)
          .map((item) => ({
            inspecting_item_id: item.id,
            grade: item.grade,
          })),
        nilai_poin: items
          .filter((item) => item.join_piece === itemsFiltered[i].join_piece)
          .map((item) => item.defect_item)
          .flat()
          .reduce(
            (total, item) =>
              total +
              (parseInt(item.point) * 3600) /
                (itemsFiltered[i].qty_sum *
                  width[
                    data?.sc_greige?.lebar_kain ||
                      data?.wo?.sc_greige?.lebar_kain
                  ] *
                  (data.unit === 2 ? 0.9144 : 1)),
            0
          )
          .toFixed(1),

        // nilai_poin: data?.sc_greige?.lebar_kain
      });
    }
    console.log("ARRAY :", dataArray);
    const url =
      props.jenisProses === "mkl-bj"
        ? "inspecting/kalkukasi/mkl-bj/"
        : "inspecting/kalkukasi/";
    // kirim data array ke get-inspecting/kalkukasi/{id}
    axiosInstance
      .put(`${url}${idInspecting}`, dataArray)
      .then((response) => {
        // setRawData(response);
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // window.location.reload();
      });
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const url =
          props.jenisProses === "mkl-bj"
            ? "inspecting/get-inspecting-mkl-bj"
            : "inspecting/get-inspecting";
        const response = await axiosInstance.get(`${url}/${idInspecting}`);
        setData(response.data.data);
        if (props.jenisProses === "mkl-bj") {
          setInspectItem(
            response.data.data.inspecting_mklbj_item.sort((a, b) => a.no_urut - b.no_urut)
          );
        } else {
          setInspectItem(
            response.data.data.inspecting_item.sort((a, b) => a.no_urut - b.no_urut)
          );
          setKartuProsesItem(
            response.data.data.kartu_process_dyeing?.kartu_proses_dyeing_item ||
            response.data.data.kartu_process_printing.kartu_proses_printing_item
          );
        }
      } catch (error) {
        setIsError(error.response?.status);
      } finally {
        setLoading(false);
      }
    };
    fetchDataAsync();
  }, [idInspecting, props.jenisProses]);

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorPage status={isError} />
      ) : (
        <div className="container-fluid py-4 a4-portrait">
          <div className="card border-1 shadow-sm print:border-0">
            <div className="card-body print:p-0" ref={printRef}>
              <div className="row align-items-center">
                <div className="col-6 align-items-center">
                  <img src={gapImage} alt="logo" style={{ width: "50px" }} />
                </div>
                <div className="col-6 d-flex flex-column align-items-end justify-content-end">
                  <h1 className="h6 mb-0">Form No. GAP-FRM-VP-13</h1>
                  <h1
                    className="h4 mb-0"
                    style={{ textDecoration: "underline" }}
                  >
                    FABRIC INSPECTION REPORT
                  </h1>
                </div>
              </div>

              <div className="print:block">
                <div className="row" style={{ fontSize: "11px" }}>
                  <div className="col-4">
                    <table style={{ width: "100%" }}>
                      <tbody>
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
                        <tr>
                          <th style={{ width: "50%" }}>Batch</th>
                          <td>: {data?.no_lot}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-4">
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <th style={{ width: "50%" }}>MOTIF / DESIGN</th>
                          <td>
                            :{" "}
                            {data?.mo?.process === 1
                              ? data?.mo?.article
                              : data?.mo?.design}
                          </td>
                        </tr>
                        <tr>
                          <th style={{ width: "50%" }}>Colour Checked</th>
                          <td>
                            :{" "}
                            {data?.kombinasi || data?.wo_color?.mo_color?.color}
                          </td>
                        </tr>
                        <tr>
                          <th style={{ width: "50%" }}>Contract GSM</th>
                          <td>
                            : {data?.wo?.greige?.greige_group?.gramasi_kain}
                          </td>
                        </tr>
                        <tr>
                          <th style={{ width: "50%" }}>Contract Width</th>
                          <td>
                            :{" "}
                            {width[data?.wo?.greige?.greige_group?.lebar_kain]}
                          </td>
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
                          <td>
                            :{" "}
                            {props.jenisProses === "mkl-bj"
                              ? data?.tgl_inspeksi
                                ? new Date(
                                    data.tgl_inspeksi
                                  ).toLocaleDateString("id-ID")
                                : "-"
                              : data?.tanggal_inspeksi
                              ? new Date(
                                  data.tanggal_inspeksi
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Tabel Area */}
                {inspectItem.length > 0 &&
                  Array.from({
                    length: Math.ceil(
                      inspectItem.filter((item) => item.is_head === 1).length /
                        12
                    ),
                  }).map((_, i) => {
                    const unit = data.unit;
                    const inspectItems = inspectItem
                      .filter((item) => item.is_head === 1 && item.grade !== 5)
                      .slice(i * 12, (i + 1) * 12);
                    const rawInspectItems = inspectItem.slice(
                      i * 12,
                      (i + 1) * 12
                    );
                    return (
                      <Table
                        key={i}
                        className="mt-2"
                        bordered
                        responsive
                        style={{
                          borderColor: "black",
                          pageBreakInside: "avoid",
                          fontSize: "11px",
                        }}
                      >
                        <tbody>
                          <tr className="py-0">
                            <td
                              rowSpan={11}
                              style={{
                                width: "25px",
                                whiteSpace: "nowrap",
                                verticalAlign: "middle",
                              }}
                            >
                              {i + 1}
                            </td>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Tube
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td
                                key={j}
                                style={{
                                  width: "75px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.find(
                                  (item) =>
                                    item.stock_id === inspectItems[j]?.stock_id
                                )?.tube === 1
                                  ? "A"
                                  : data?.kartu_process_dyeing?.kartu_proses_dyeing_item?.find(
                                      (item) =>
                                        item.stock_id ===
                                        inspectItems[j]?.stock_id
                                    )?.tube === 2
                                  ? "B"
                                  : ""}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Roll No
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>
                                {inspectItems[j] ? (12 * i + j + 1) + ` (${inspectItems[j]?.no_urut})` : ""}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Lot No
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>{inspectItems[j]?.lot_no}</td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Gramasi (gr/m2)
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>{inspectItems[j]?.gsm_item}</td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Length (yds)
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>
                                {inspectItems[j]?.qty_sum} 
                                {/* ({inspectItems[j]?.no_urut}) */}
                                {/* {inspectItems[j]?.join_piece ? `(${inspectItems[j]?.join_piece})` : ''} */}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Width (inches)
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>
                                {inspectItems[j]?.id
                                  ? width[data?.sc_greige?.lebar_kain]
                                    ? width[data?.sc_greige?.lebar_kain]
                                    : width[data?.wo?.sc_greige?.lebar_kain]
                                  : ""}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              style={{
                                width: "170px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Meter Ke-/Defect/Point (inches)
                            </td>
                            {[...Array(12).keys()].map((j) => (
                              <td
                                key={j}
                                style={{ textAlign: "left", fontSize: "10px"}}
                              >
                                {inspectItems[j]?.defect_item?.map(
                                  (defect, idx) => (
                                    <div
                                      key={`head-${j}-${idx}-${defect.meterage}`}
                                    >
                                      {`${defect.meterage} / ${defect.mst_kode_defect.no_urut} / ${defect.point}`}
                                    </div>
                                  )
                                )}
                                {rawInspectItems
                                  .filter(
                                    (rawInspectItem) =>
                                      rawInspectItem?.join_piece ===
                                        inspectItems[j]?.join_piece &&
                                      rawInspectItem?.is_head === 0
                                  )
                                  .flatMap(
                                    (rawInspectItem) =>
                                      rawInspectItem?.defect_item || []
                                  )
                                  .map((defect, idx) => (
                                    <div
                                      key={`tail-${j}-${idx}-${defect.meterage}`}
                                    >
                                      {`${defect.meterage} / ${defect.mst_kode_defect.no_urut} / ${defect.point}`}
                                    </div>
                                  ))}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td
                              colSpan={13}
                              style={{
                                paddingBlock: "0.5px",
                                paddingInline: "0px",
                              }}
                            ></td>
                          </tr>
                          <tr>
                            <td>Jumlah Point</td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>
                                {inspectItems[j]?.defect_item ? inspectItems[j]?.defect_item.reduce(
                                  (total, item) =>
                                    total + parseInt(item.point, 10),
                                  0
                                ) +
                                  rawInspectItems
                                    .filter(
                                      (rawInspectItem) =>
                                        rawInspectItem?.join_piece ===
                                          inspectItems[j]?.join_piece &&
                                        rawInspectItem?.is_head === 0
                                    )
                                    .flatMap(
                                      (rawInspectItem) =>
                                        rawInspectItem?.defect_item || []
                                    )
                                    .reduce(
                                      (total, item) =>
                                        total + parseInt(item.point, 10),
                                      0
                                    ) : ""}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>Point/100 Square Yds</td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>
                                {inspectItems[j] &&
                                inspectItems[j].qty_sum &&
                                width[
                                  data?.sc_greige?.lebar_kain ||
                                    data?.wo?.sc_greige?.lebar_kain
                                ]
                                  ? (
                                      ((inspectItems[j]?.defect_item?.reduce(
                                        (total, item) =>
                                          total + parseInt(item.point, 10),
                                        0
                                      ) +
                                        rawInspectItems
                                          .filter(
                                            (rawInspectItem) =>
                                              rawInspectItem?.join_piece ===
                                                inspectItems[j]?.join_piece &&
                                              rawInspectItem?.is_head === 0
                                          )
                                          .flatMap(
                                            (rawInspectItem) =>
                                              rawInspectItem?.defect_item || []
                                          )
                                          .reduce(
                                            (total, item) =>
                                              total + parseInt(item.point, 10),
                                            0
                                          )) *
                                        3600) /
                                      (inspectItems[j].qty_sum *
                                        width[
                                          data?.sc_greige?.lebar_kain ||
                                            data?.wo?.sc_greige?.lebar_kain
                                        ] *
                                        (unit === 2 ? 0.9144 : 1))
                                    ).toFixed(1)
                                  : ""}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>Grade</td>
                            {[...Array(12).keys()].map((j) => (
                              <td key={j}>{grades[inspectItems[j]?.grade]}</td>
                            ))}
                          </tr>
                          {i ===
                            Math.ceil(
                              inspectItem.filter((item) => item.is_head === 1)
                                .length / 12
                            ) -
                              1 && (
                            <>
                              <tr>
                                <td colSpan={5} className="">
                                  <strong>Note:</strong>
                                  <Stack direction="horizontal" gap={3}>
                                    <p className="p-0 text-center mt-2">
                                      Point /100 Square Yds =
                                    </p>
                                    <Stack direction="vertical">
                                      <div className="p-0 text-center">
                                        Jumlah Point X 3600{" "}
                                      </div>
                                      <div
                                        className="m-1"
                                        style={{ borderTop: "3px solid black" }}
                                      />
                                      <div className="p-0 text-center">
                                      Panjang Fabric (Yds) X lebar Fabric (Inches){" "}
                                      </div>
                                    </Stack>
                                  </Stack>
                                </td>
                                <td colSpan={3} className="">
                                  <strong>REMARKS:</strong>
                                  <div>
                                    
                                  </div>
                                </td>
                                <td colSpan={5} className="">
                                  <strong></strong>
                                  <div>
                                    <strong>KETERANGAN DEFECT:</strong>
                                    <p style={{ fontSize: "9px" }}>
                                      {inspectItem
                                        .flatMap((item) => item.defect_item)
                                        .filter((defect, index, self) =>
                                          self.findIndex(
                                            (d) =>
                                              d.mst_kode_defect.no_urut === defect.mst_kode_defect.no_urut
                                          ) === index
                                        )
                                        .sort(
                                          (a, b) =>
                                            a.mst_kode_defect.no_urut - b.mst_kode_defect.no_urut
                                        )
                                        .map((defect, index, arr) => (
                                          <span key={defect.mst_kode_defect.no_urut}>
                                            <b>{defect.mst_kode_defect.no_urut}</b> = {defect.mst_kode_defect.nama_defect} ({defect.mst_kode_defect.asal_defect})
                                            {index !== arr.length - 1 && ' | '}
                                          </span>
                                        ))}
                                    </p>
                                  </div>
                                </td>
                                <td>
                                  <b>JUMLAH TOTAL:</b>
                                  <h6>{inspectItem.reduce((total, item) => total + (isNaN(parseInt(item.qty_sum)) ? 0 : parseInt(item.qty_sum)), 0)}</h6>
                                </td>
                              </tr>
                              <tr style={{ border: "none" }}>
                                <td rowSpan={5} colSpan={5}>
                                  <strong>STANDARD POINT:</strong>
                                  <p className="p-0 text-bottom mt-2">
                                    <span className="ms-1">
                                      Point A Grade &le;{" "}
                                    </span>
                                    <u style={{ textDecoration: "underline" }}>
                                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    </u>
                                    <span className="ms-1">
                                      point/100 sq yds
                                    </span>
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={4} className="text-center fw-bold">
                                  PREPARED BY
                                </td>
                                <td colSpan={4} className="text-center fw-bold">
                                  APPROVED BY
                                </td>
                                <td colSpan={4} className="text-center fw-bold">
                                  SUSUT
                                </td>
                              </tr>
                              <tr>
                                <td
                                  rowSpan={2}
                                  colSpan={4}
                                  style={{ height: "90px" }}
                                ></td>
                                <td rowSpan={2} colSpan={4}></td>
                                <td className="fw-bold">
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
                                    : null} %
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
            <button
              onClick={handlePrint}
              className="btn bg-burgundy text-white m-2 no-print"
            >
              <FiPrinter className="me-2" />
              <b>Print</b>
            </button>
            <button
              onClick={handleGetRawData}
              className="btn bg-warning m-2 no-print"
            >
              <FiPrinter className="me-2" />
              <b>Kalkulasi Point</b>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InspectPrint;
