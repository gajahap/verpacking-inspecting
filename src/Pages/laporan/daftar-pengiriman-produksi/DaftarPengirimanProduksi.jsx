import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Pagination } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import DateRangePicker from '../../../Components/DateRangePicker/DateRangePicker';
import { MdPrint } from "react-icons/md";
import Bottom from '../../Layouts/Bottom/Bottom';
import axiosInstance from "../../../axiosConfig";
import LoadingSpinnerModal from "../../../Components/LoadingSpinnerModal";
import CustomRadioButton from "../../../Components/RadioButton/CustomRadioButton";
import CustomSelect from "../../../Components/CustomSelectThin";

const DaftarPengirimanProduksi = () => {
    const [selectedRange, setSelectedRange] = useState();
    const [sendParams, setSendParams] = useState({});
    const printArea = useRef();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [isLoading, setIsLoading] = useState(false);
    const [controller, setController] = useState(new AbortController());
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

    const jenisMakloonOptions = Object.keys(jenisMakloon).map((key) => ({
        value: key,
        label: jenisMakloon[key],
    }));

    const jenisOrderOptions = Object.keys(jenisOrder).map((key) => ({
        value: key,
        label: jenisOrder[key],
    }));

    const handleChangeRange = (range) => {
        setSelectedRange(range);
    
        if (range?.from && range?.to) {
            setSendParams((prevParams) => ({
                ...prevParams,
                start_date: range.from,
                end_date: range.to,
            }));
        } else {
            setSendParams((prevParams) => ({
                ...prevParams,
                start_date: null,
                end_date: null,
            }));
        }
    };

    useEffect(() => {
        console.log(sendParams);
    }, [sendParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'jenis_data' && value !== sendParams.jenis_data) {
            setSendParams((prevParams) => ({ ...prevParams, jenis_order: null }));
        }
        
        setSendParams((prevParams) => ({ ...prevParams, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sendParams.jenis_data) {
            alert('Jenis data harus diisi');
            return;
        }        
        const url = parseInt(sendParams.jenis_data) === 1 ?   "verpacking/daftar-pengiriman-produksi": "verpacking/daftar-pengiriman-produksi-mklbj";

        console.log(url);
        
        setIsLoading(true);
        axiosInstance.get(url, { 
            signal: controller.signal,
            params: sendParams })
            .then(response => {
                setCurrentPage(1); // Reset ke halaman pertama setelah cari
                console.log(response.data.data);
                setData(response.data.data);
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
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


    return (
        <Container fluid className="py-4 px-4">
            <Card>
                <Card.Header className="bg-burgundy-gradient bg-pattern-container">
                    <Card.Title className="text-white">Daftar Pengiriman Produksi</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form className="mb-3" onSubmit={handleSubmit}>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="noKirim">
                                    <Form.Label className="fw-bold">No Kirim</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan no kirim" name="no_kirim" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="tglKirim">
                                    <Form.Label className="fw-bold">Tgl kirim</Form.Label>
                                    <DateRangePicker value={selectedRange} onChange={handleChangeRange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="noWo">
                                    <Form.Label className="fw-bold">No WO</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan no wo" name="no_wo" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="buyer">
                                    <Form.Label className="fw-bold">Buyer</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan buyer" name="buyer" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="noLot">
                                    <Form.Label className="fw-bold">No Lot</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan no lot" name="no_lot" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="motif">
                                    <Form.Label className="fw-bold">Motif</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan motif" name="motif" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="design">
                                    <Form.Label className="fw-bold">Design</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan design" name="design" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="kombinasi">
                                    <Form.Label className="fw-bold">Kombinasi</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan kombinasi" name="kombinasi" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="stamping">
                                    <Form.Label className="fw-bold">Stamping</Form.Label>
                                    <Form.Control type="text" placeholder="masukkan stamping" name="stamping" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="pieceLength">
                                    <Form.Label className="fw-bold">Piece Length</Form.Label>
                                    <Form.Control type="number" placeholder="masukkan panjang piece" name="piece_length" onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="jenisOrder">
                                    <Form.Label className="fw-bold">Jenis Order</Form.Label>
                                    <CustomSelect
                                    value={
                                        sendParams.jenis_order
                                        ? {
                                            value: sendParams.jenis_order,
                                            label: sendParams.jenis_data !== null && sendParams.jenis_data !== undefined ? (parseInt(sendParams.jenis_data) === 1 ? jenisOrder[sendParams.jenis_order] : jenisMakloon[sendParams.jenis_order]) : ''
                                            }
                                        : null
                                    }
                                    options={sendParams.jenis_data !== null && sendParams.jenis_data !== undefined ? (parseInt(sendParams.jenis_data) === 1 ? jenisOrderOptions : jenisMakloonOptions) : []}
                                    onChange={({ value }) =>
                                        setSendParams({ ...sendParams, jenis_order: value })
                                    }
                                    name="jenis_order"
                                    className={"border-thin"}
                                    />

                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3" controlId="jenisData">
                                    <Form.Label className="fw-bold">Jenis Data</Form.Label>
                                    <CustomRadioButton
                                        label="Data"
                                        name="jenis_data"
                                        value={1}
                                        onChange={handleChange}
                                    />
                                    <CustomRadioButton
                                        label="Makloon Data"
                                        name="jenis_data"
                                        value={2}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Col md={4}>
                                    <Button variant="burgundy" type="submit" className="w-100 mt-4">
                                        <FaSearch /> Cari
                                    </Button>
                                </Col>
                            </Col>
                        </Row>
                    </Form>

                    <Container fluid style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }} className="p-4">
                        <div className="d-flex justify-content-end mb-3">
                            <Button variant="burgundy" className="me-2" onClick={handlePrint}>
                                <MdPrint /> Print
                            </Button>
                        </div>
                        {/* Pagination */}
                        <div className="mt-3 overflow-auto">
                            {renderPagination()}
                        </div>
                        <div ref={printArea} className="print-area">
                            <h4>PT. GAJAH ANGKASA PERKASA</h4>
                            <p className="print-title">DAFTAR PENGIRIMAN PRODUKSI</p>
                            <p>Tanggal Dari : {selectedRange?.from?.toLocaleDateString('id-ID') || ''} s/d {selectedRange?.to?.toLocaleDateString('id-ID') || ''}</p>
                            
                            <Table>
                                <thead>
                                    <tr className="border-bold-y">
                                        <th>No Kirim</th>
                                        <th>Tanggal Kirim</th>
                                        <th>No. WO</th>
                                        <th>No. Kartu</th>
                                        <th>Buyer</th>
                                        <th>Tgl Inspek</th>
                                        <th>Motif</th>
                                        <th>Design</th>
                                        <th>Kombinasi</th>
                                        <th>No. batch</th>
                                        <th>Stamping</th>
                                        <th>Piece length</th>
                                        <th>Jenis Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td className="no-border">{item.no_kirim}</td>
                                                <td className="no-border">{item.tgl_kirim}</td>
                                                <td className="no-border">{item.no_wo}</td>
                                                <td className="no-border">{item.no_kartu}</td>
                                                <td className="no-border">{item.buyer}</td>
                                                <td className="no-border">{item.tgl_inspeksi}</td>
                                                <td className="no-border">{item.motif}</td>
                                                <td className="no-border">{item.design}</td>
                                                <td className="no-border">{item.kombinasi}</td>
                                                <td className="no-border">{item.no_lot}</td>
                                                <td className="no-border">{item.stamping}</td>
                                                <td className="no-border">{item.piece_length}</td>
                                                <td className="no-border">{jenisOrder[item.jenis_order] || item.jenis_order}</td>
                                            </tr>
                                            {orderedGradeCodes.map((gradeCode) => {
                                                const gradeLabel = grades[gradeCode];
                                                const gradeDetails = item?.details.filter(detail => detail.grade === gradeCode);
                                                const pcs = gradeDetails.length;
                                                const rolls = gradeDetails.filter(detail => detail.is_head === 1).length;
                                                const qty = gradeDetails.reduce((acc, curr) => acc + parseInt(curr.qty), 0);

                                                return (
                                                    <tr key={gradeCode}>
                                                        <td className="no-border no-padding"></td>
                                                        <td className="no-border no-padding">
                                                            {gradeLabel === 'PK' ? 'Piece Kecil' : gradeLabel === 'Sample' ? 'Contoh' : `Grade ${gradeLabel}`}
                                                        </td>
                                                        <td className="no-border no-padding">:</td>
                                                        <td className="no-border no-padding">{pcs} Pcs</td>
                                                        <td className="no-border no-padding">{rolls} Roll</td>
                                                        <td className="no-border no-padding">{qty} {item?.satuan}</td>
                                                        <td className="no-border no-padding" colSpan={6}></td>
                                                    </tr>
                                                );
                                            })}
                                            <tr>
                                                <td></td>
                                                <td className="px-0 border-top">Total</td>
                                                <td className="px-0 border-top">:</td>
                                                <td className="px-0 border-top">{item?.details.length} Pcs</td>
                                                <td className="px-0 border-top">{item?.details.filter(detail => detail.is_head === 1).length} Roll</td>
                                                <td className="px-0 border-top">{item?.details.reduce((acc, curr) => acc + parseInt(curr.qty), 0)} {item?.satuan}</td>
                                                <td colSpan={7}></td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
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

export default DaftarPengirimanProduksi;
