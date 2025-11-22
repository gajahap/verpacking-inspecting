import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Pagination, Stack } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import DateRangePicker from '../../../Components/DateRangePicker/DateRangePicker';
import { MdPrint } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";
import Bottom from '../../Layouts/Bottom/Bottom';
import axiosInstance from "../../../axiosConfig";
import LoadingSpinnerModal from "../../../Components/LoadingSpinnerModal";
import CustomRadioButton from "../../../Components/RadioButton/CustomRadioButton";
import CustomSelect from "../../../Components/CustomSelectThin";
import * as XLSX from 'xlsx';

const DaftarPengirimanVerpacking = () => {
    const [selectedRange, setSelectedRange] = useState();
    const [sendParams, setSendParams] = useState({});
    const printArea = useRef();
    const tableRef = useRef();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [isLoading, setIsLoading] = useState(false);
    const [controller, setController] = useState(new AbortController());
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const jenisOrder = {
        1: "Dyeing",
        2: "Printing"
    }

    const jenisMakloon = {
        1: 'Makloon Proses',
        2: 'Makloon Finish',
        3: 'Barang Jadi',
        4: 'Fresh',
    }

    const month= {
        1: 'Januari',
        2: 'Februari',
        3: 'Maret',
        4: 'April',
        5: 'Mei',
        6: 'Juni',
        7: 'Juli',
        8: 'Agustus',
        9: 'September',
        10: 'Oktober',
        11: 'November',
        12: 'Desember',
    }

    const monthOptions = Object.keys(month).map((key) => ({
        value: key,
        label: month[key],
    }));

    // ambil option year 10 tahun ke belakang 5 tahun ke depan
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 10;
    
    const yearOptions = Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => ({
        value: startYear + index,
        label: String(startYear + index), // <-- sudah jadi string
      })
    );
    

    // useEffect(() => {
    //     console.log(sendParams);
    // }, [sendParams]);



    const handleSubmit = (e) => {
        e.preventDefault();
        // if (!sendParams.jenis_data) {
        //     alert('Jenis data harus diisi');
        //     return;
        // }     
        
        sendParams.month = selectedMonth;
        sendParams.year = selectedYear;
        const url = "verpacking/rekap-pengiriman-produksi-bulan";
        console.log(sendParams);
        
        setIsLoading(true);
        axiosInstance.get(url, { 
            signal: controller.signal,
            params: sendParams })
            .then(response => {
                setCurrentPage(1); // Reset ke halaman pertama setelah cari
                setData(
                    response.data.data.sort((a, b) => new Date(a.tgl) - new Date(b.tgl))
                );
            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                setIsLoading(false);
            });
    };

    const handlePrint = () => {
        const printContent = printArea.current.innerHTML;
        const newTab = window.open('', 'print_tab');
        newTab.document.write(`
            <html>
                <head>
                    <style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 8px;
                            text-align: left;
                            border-bottom: 1px solid black;
                        }
                        .table-header {
                            background-color: #660033;
                            color: white;
                        }
                            th{
                                border-top: 1px solid black;
                            }
                        * {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        }

                        .print-area {
                        font-size: 12px;
                        }

                        .print-title {
                        font-size: 20px;
                        }

                        .no-border {
                        border: none;
                        }

                        .no-padding {
                            padding: 0px;
                        }

                        .border-top {
                            border-top: 1px solid #000;
                        }

                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        newTab.document.close();
        newTab.focus();
        newTab.print();
        newTab.close();
    };

    // Pagination calculation
    const indexOfLastItem = currentPage === 0 ? data.length : currentPage * itemsPerPage;
    const indexOfFirstItem = currentPage === 0 ? 0 : indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => paginate(number)}
                >
                    {number}
                </Pagination.Item>

            );
        }

        items.push(
            <Pagination.Item
                key={0}
                active={0 === currentPage}
                onClick={() => paginate(0)}
            >
                All
            </Pagination.Item>
        );
        return <Pagination>{items}</Pagination>;
    };

    const cancelRequest = () => {
        controller.abort(); // membatalkan request
        setController(new AbortController()); // reset controller untuk request berikutnya
    };

      const type = "landscape";
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


      const grades = {
        7: "A+",
        8: "A*",
        2: "B",
        3: "C",
        4: "PK",
        5: "Sample",
        1: "A",
      };

      const orderedGradeCodes = [1, 7, 8, 2, 3, 4, 5];

    //handle untuk konversi table ke excel
    const handleExportTableToExcel = () => {
        const table = tableRef.current;
        const ws = XLSX.utils.table_to_sheet(table, { raw: true }); // Convert dari HTML table ke worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'daftar-pengiriman-produksi.xlsx');
      };
    
    //   useEffect (() => {
    //     console.log(data);
        
    //   }, [data]);

    const datas = [
        {
            tgl:1,
            grade_a: 400,
            grade_a_plus: 300,
            grade_a_asterisk: 100,
            grade_b: 50, 
            grade_c: 25,
            grade_pk: 15,
            sample: 5,

        }
    ]
    const formatNumber = (num) => {
        if (num == null || isNaN(num)) return "0";
        return Number(num).toLocaleString("id-ID");
    };

    return (
        <Container fluid className="py-4 px-4 vh-100" style={{ marginBottom: "200px" }}>
            <Card>
                <Card.Header className="bg-burgundy-gradient bg-pattern-container">
                    <Card.Title className="text-white">Rekap Pengiriman Verpacking</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form className="mb-3" onSubmit={handleSubmit}>
                        <Stack direction="horizontal" gap={3}>
                            <div style={{minWidth: '200px'}}>
                                <Form.Group className="mb-3" controlId="noKirim">
                                    <Form.Label className="fw-bold">Bulan</Form.Label>
                                    <CustomSelect
                                        options={monthOptions}
                                        value={selectedMonth ? monthOptions.find(o => o.value === selectedMonth) : null}
                                        onChange={option => setSelectedMonth(parseInt(option.value))}
                                        name="bulan"
                                        className={"border-thin"}
                                    />
                                </Form.Group>
                            </div>
                            <div>
                                <Form.Group className="mb-3" controlId="tglKirim">
                                    <Form.Label className="fw-bold">Tahun</Form.Label>
                                    <CustomSelect
                                        options={yearOptions}
                                        value={selectedYear ? yearOptions.find(o => o.value === selectedYear) : null}
                                        onChange={option => setSelectedYear(parseInt(option.value))}
                                        name="tahun"
                                        className={"border-thin"}
                                    />
                                </Form.Group>
                            </div>
                                    <Button type="submit" variant="burgundy" className="mt-3">submit</Button>
                        </Stack>
                    </Form>

                    <Container fluid style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }} className="p-4">
                        <div className="d-flex justify-content-end mb-3">
                            <Button variant="burgundy" className="me-2" onClick={handlePrint}>
                                <MdPrint /> Print
                            </Button>
                            <Button variant="success" className="me-2" onClick={handleExportTableToExcel}>
                                <RiFileExcel2Fill /> Export to Excel
                            </Button>
                        </div>
                        {/* Pagination */}
                        <div className="mt-3 overflow-auto">
                            {renderPagination()}
                        </div>
                        <div ref={printArea} className="print-area">
                            <h4 className="text-center">PT. GAJAH ANGKASA PERKASA</h4>
                            <p className="print-title text-center">REKAP PENGIRIMAN VERPACKING</p>
                            <p className="text-center">Bulan {month[selectedMonth]}, Tahun {selectedYear}</p>
                            
                            <Table ref={tableRef} id="tabelPengiriman">
                                <thead>
                                    <tr className="border-bold-y">
                                        <th>Tgl</th>
                                        <th>Grade A</th>
                                        <th>Grade A+</th>
                                        <th>Grade A*</th>
                                        <th>Grade B</th>
                                        <th>Grade C</th>
                                        <th>Piece Kecil</th>
                                        <th>Contoh</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.map((item, index) => {
                                        const total =
                                            (item["Grade A"] ?? 0) +
                                            (item["Grade A+"] ?? 0) +
                                            (item["Grade A*"] ?? 0) +
                                            (item["Grade B"] ?? 0) +
                                            (item["Grade C"] ?? 0) +
                                            (item["Piece Kecil"] ?? 0) +
                                            (item["Sample"] ?? 0);

                                        return (
                                            <tr key={index}>
                                                <td>{item.tgl.split("-").pop().split("T")[0]}</td>

                                                <td>
                                                    <b>{formatNumber(item["Grade A"] ?? 0)}</b>
                                                    {" "}({(((item["Grade A"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Grade A+"] ?? 0)}</b>
                                                    {" "}({(((item["Grade A+"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Grade A*"] ?? 0)}</b>
                                                    {" "}({(((item["Grade A*"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Grade B"] ?? 0)}</b>
                                                    {" "}({(((item["Grade B"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Grade C"] ?? 0)}</b>
                                                    {" "}({(((item["Grade C"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Piece Kecil"] ?? 0)}</b>
                                                    {" "}({(((item["Piece Kecil"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>
                                                    <b>{formatNumber(item["Sample"] ?? 0)}</b>
                                                    {" "}({(((item["Sample"] ?? 0) / total) * 100).toFixed(2)}%)
                                                </td>

                                                <td>{formatNumber(total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot>
                                    <tr className="border-bold-y">
                                        <th>Total</th>

                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Grade A"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Grade A+"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Grade A*"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Grade B"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Grade C"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Piece Kecil"] ?? 0), 0))}</th>
                                        <th>{formatNumber(data.reduce((sum, i) => sum + (i["Sample"] ?? 0), 0))}</th>

                                        <th>
                                            {formatNumber(
                                                data.reduce((grand, i) =>
                                                    grand +
                                                    ((i["Grade A"] ?? 0) +
                                                        (i["Grade A+"] ?? 0) +
                                                        (i["Grade A*"] ?? 0) +
                                                        (i["Grade B"] ?? 0) +
                                                        (i["Grade C"] ?? 0) +
                                                        (i["Piece Kecil"] ?? 0) +
                                                        (i["Sample"] ?? 0))
                                                    , 0)
                                            )}
                                        </th>
                                    </tr>
                                </tfoot>
                            </Table>


                        </div>
                    </Container>
                </Card.Body>
                <Card.Footer>
                    <span className="text-muted" style={{ fontSize: "10px", fontStyle: "italic" }}>
                        {data.length} Data Ditemukan
                    </span>
                </Card.Footer>
            </Card>
            <Bottom />
            <LoadingSpinnerModal show={isLoading}><Button variant="burgundy" onClick={cancelRequest}>Batal</Button></LoadingSpinnerModal>
        </Container>
    );
};

export default DaftarPengirimanVerpacking;
