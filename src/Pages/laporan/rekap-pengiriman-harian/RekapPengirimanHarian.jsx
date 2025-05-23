import React, { useState, useRef } from "react";
import { Container, Card, Table, Form, Button, Stack } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import DateRangePicker from '../../../Components/DateRangePicker/DateRangePicker';
import { MdPrint } from "react-icons/md";
import Bottom from '../../Layouts/Bottom/Bottom';
import axiosInstance from "../../../axiosConfig";
import LoadingSpinnerModal from "../../../Components/LoadingSpinnerModal";

const RekapPengirimanHarian = () => {
    const [selectedRange, setSelectedRange] = useState();
    const [params, setParams] = useState({});
    const [data,setData] = useState([]);
    const printArea = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [controller, setController] = useState(new AbortController());
    

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const parm = {
            start_date: '2024-06-01',
            end_date: '2024-06-09'
        }
        console.log(params);
        axiosInstance
            .get("verpacking/rekap-pengiriman-harian", { params: params, signal: controller.signal })
            .then((response) => {
                console.log(response.data.data);
                setData(response.data.data);
            })
            .catch((error) => {
                console.error(error);
            }).finally(() => {
                setIsLoading(false);
            });
    };

    const handlePrint = () => {
        const printContent = printArea.current.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
    };  

    const handleChangeRange = (range) => {
        setSelectedRange(range);
        if (range && range.from && range.to) {
            setParams((prevParams) => ({ ...prevParams, start_date: range.from, end_date: range.to}));
        } else {
            setParams((prevParams) => ({ ...prevParams, start_date: undefined, end_date: undefined }));
        }
    };
    
    const cancelRequest = () => {
        controller.abort(); // membatalkan request
        setController(new AbortController()); // reset controller untuk request berikutnya
    };

    return (
        <Container fluid className="py-4 px-4">
            <Card>
                <Card.Header className="bg-burgundy-gradient bg-pattern-container">
                    <Card.Title className="text-white">Rekap Pengiriman Harian</Card.Title>
                </Card.Header>

                <Card.Body>
                        <Form className="mb-3 w-50" onSubmit={handleSubmit}>
                            <Form.Group controlId="tglKirim">
                                    <Stack direction="horizontal" gap={2}>
                                    <Form.Label className="fw-bold">Tgl kirim: </Form.Label>

                                    <DateRangePicker
                                        value={selectedRange}
                                        onChange={handleChangeRange}
                                    />
                                    <Button variant="burgundy" type="submit">
                                        <FaSearch /> Cari
                                    </Button>
                                    </Stack>

                            </Form.Group>
                        </Form>
                    <Container fluid style={{border: '1px solid rgba(0, 0, 0, 0.1)'}} className="p-4" >
                        <div className="d-flex justify-content-end mb-3">
                            <Button variant="burgundy" className="me-2" onClick={handlePrint}>
                                <MdPrint /> Print
                            </Button>
                        </div>
                        <div ref={printArea}>
                            <h4 className="text-center">PT. GAJAH ANGKASA PERKASA</h4>
                            <p className=" text-center m-0" style={{fontSize: '20px'}}>REKAPITULASI PENGIRIMAN HARIAN VERPACKING</p>
                            <p className="text-center m-0">Tanggal Dari : {selectedRange ? selectedRange.from.toLocaleDateString('id-ID') : ''} s/d {selectedRange ? selectedRange.to.toLocaleDateString('id-ID') : ''}</p>
                            <p className="text-center">(DALAM SATUAN YARD)</p>

                            <Table bordered>
                                <thead>
                                    <tr className="text-center align-middle">
                                        <th rowSpan={2}>Tanggal</th>
                                        <th colSpan={2}>Dyeing</th>
                                        <th colSpan={2}>Printing</th>
                                        <th colSpan={2}>Beli Jadi</th>
                                        <th colSpan={2}>Makloon</th>
                                        <th colSpan={2}>Total</th>
                                    </tr>
                                    <tr className="text-center align-middle">
                                        <th>Fresh Order</th>
                                        <th>Re-packing</th>
                                        <th>Fresh Order</th>
                                        <th>Re-packing</th>
                                        <th>Fresh Order</th>
                                        <th>Re-packing</th>
                                        <th>Fresh Order</th>
                                        <th>Re-packing</th>
                                        <th>Fresh Order</th>
                                        <th>Re-packing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data).map((tanggal, index) => (
                                        <tr key={`${tanggal[0]}_${index}`}>
                                            <td className="text-center">{tanggal[0]}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Dyeing']?.['Fresh Order']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Dyeing']?.['Re-Packing']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Printing']?.['Fresh Order']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Printing']?.['Re-Packing']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Barang Jadi']?.['Fresh Order']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tanggal[1]['Barang Jadi']?.['Re-Packing']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((tanggal[1]['Makloon Proses']?.['Fresh Order'] || []).concat(tanggal[1]['Makloon Finish']?.['Fresh Order'] || []).reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((tanggal[1]['Makloon Proses']?.['Re-Packing'] || []).concat(tanggal[1]['Makloon Finish']?.['Re-Packing'] || []).reduce((total, item) => total + (item.total_qty || 0), 0) || 0)}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Object.values(tanggal[1]).reduce((total, jenis) => total + (jenis?.['Fresh Order']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0), 0))}</td>
                                            <td>{Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Object.values(tanggal[1]).reduce((total, jenis) => total + (jenis?.['Re-Packing']?.reduce((total, item) => total + (item.total_qty || 0), 0) || 0), 0))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Container>
    
                </Card.Body>
                <Card.Footer>
                    <span className="text-muted" style={{ fontSize: "10px", fontStyle: "italic" }}>300 Data Ditemukan</span>
                </Card.Footer>
            </Card>      
            <Bottom />
            <LoadingSpinnerModal show={isLoading}><Button variant="burgundy" onClick={cancelRequest}>Batal</Button></LoadingSpinnerModal>
        </Container>

    );
};

export default RekapPengirimanHarian;
