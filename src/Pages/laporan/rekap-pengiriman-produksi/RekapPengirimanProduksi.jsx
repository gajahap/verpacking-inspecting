import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Table, Form, Button, Stack } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import DateRangePicker from '../../../Components/DateRangePicker/DateRangePicker';
import { MdPrint } from "react-icons/md";
import Bottom from '../../Layouts/Bottom/Bottom';
import axiosInstance from "../../../axiosConfig";
import LoadingSpinnerModal from "../../../Components/LoadingSpinnerModal";
import { useReactToPrint } from "react-to-print";

const RekapPengirimanProduksi = () => {
    const [data, setData] = useState([]);
    const [selectedRange, setSelectedRange] = useState();
    const [sendParams, setSendParams] = useState({});
    const printArea = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [controller, setController] = useState(new AbortController());
    const jenis = ['Dyeing', 'Printing', 'Makloon','Barang Jadi'];

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = "verpacking/rekap-pengiriman-produksi";

        const parm = {
            start_date: '2025-05-01',
            end_date: '2025-05-01'
        }
        
        setIsLoading(true);
        axiosInstance.get(url, { 
            signal: controller.signal,
            params: sendParams })
            .then(response => {
                console.log(response.data.data);
                setData( { 
                    fresh_order: jenis.map(jenisItem => {
                        let filteredData;
                        if (jenisItem === 'Makloon') {
                            // Combine data for 'Makloon Proses' and 'Makloon Finish'
                            const makloonProses = response.data.data['Makloon Proses']?.['Fresh Order'] || [];
                            const makloonFinish = response.data.data['Makloon Finish']?.['Fresh Order'] || [];
                            filteredData = [...makloonProses, ...makloonFinish];
                        } else {
                            filteredData = response.data.data[jenisItem]?.['Fresh Order'] || [];
                        }
                        if(jenisItem === 'Barang Jadi'){
                            jenisItem = 'Beli Jadi';
                        }
                        const A = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A']) || 0), 0);
                        const APlus = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A+']) || 0), 0);
                        const AStar = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A*']) || 0), 0);
                        const B = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade B']) || 0), 0);
                        const C = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade C']) || 0), 0);
                        const PK = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Piece Kecil']) || 0), 0);
                        const Sample = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Sample']) || 0), 0);
                        const total = A + APlus + AStar + B + C + PK + Sample;
                        return { 
                            jenis: jenisItem, 
                            total_grade_a: A, 
                            total_grade_a_plus: APlus, 
                            total_grade_a_star: AStar, 
                            total_grade_b: B, 
                            total_grade_c: C, 
                            total_pk: PK, 
                            total_sample: Sample, 
                            grand_total: total 
                        };
                    }),
                    re_packing: jenis.map(jenisItem => {
                        let filteredData;
                        if (jenisItem === 'Makloon') {
                            // Combine data for 'Makloon Proses' and 'Makloon Finish'
                            const makloonProses = response.data.data['Makloon Proses']?.['Re-Packing'] || [];
                            const makloonFinish = response.data.data['Makloon Finish']?.['Re-Packing'] || [];
                            filteredData = [...makloonProses, ...makloonFinish];
                        } else {
                            filteredData = response.data.data[jenisItem]?.['Re-Packing'] || [];
                        }
                        if(jenisItem === 'Barang Jadi'){
                            jenisItem = 'Beli Jadi';
                        }
                        const A = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A']) || 0), 0);
                        const APlus = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A+']) || 0), 0);
                        const AStar = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade A*']) || 0), 0);
                        const B = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade B']) || 0), 0);
                        const C = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Grade C']) || 0), 0);
                        const PK = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Piece Kecil']) || 0), 0);
                        const Sample = filteredData.reduce((total, item) => total + (parseFloat(item.total_per_grade?.['Sample']) || 0), 0);
                        const total = A + APlus + AStar + B + C + PK + Sample;
                        return { 
                            jenis: jenisItem, 
                            total_grade_a: A, 
                            total_grade_a_plus: APlus, 
                            total_grade_a_star: AStar, 
                            total_grade_b: B, 
                            total_grade_c: C, 
                            total_pk: PK, 
                            total_sample: Sample, 
                            grand_total: total 
                        };
                    })
                });
            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
console.log(data);

    }, [data]);

    const cancelRequest = () => {
        controller.abort(); // membatalkan request
        setController(new AbortController()); // reset controller untuk request berikutnya
    };

    const handlePrint = () => {
        const printContent = printArea.current.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
    };  



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


    //////

    useEffect(() => {
        console.log(sendParams);
    }, [sendParams]);
    return (
        <Container fluid className="py-4 px-4">
            <Card>
                <Card.Header className="bg-burgundy-gradient bg-pattern-container">
                    <Card.Title className="text-white">Rekap Pengiriman Produksi</Card.Title>
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
                            <p className=" text-center m-0" style={{fontSize: '20px'}}>REKAPITULASI PENGIRIMAN HASIL PRODUKSI</p>
                            <p className="text-center m-0">Tanggal Dari : {selectedRange ? selectedRange.from.toLocaleDateString('id-ID') : ''} s/d {selectedRange ? selectedRange.to.toLocaleDateString('id-ID') : ''}</p>
                            <p className="text-center">(DALAM SATUAN YARD)</p>

                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Jenis (Fresh Order)</th>
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
                                        {data.fresh_order?.map((item, index) => (
                                            <>
                                                <tr key={index}>
                                                    <td>{item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a_plus)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a_star)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_b)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_c)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_pk)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_sample)}</td>
                                                    <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.grand_total)}</td>
                                                </tr>
                                            </>
                                        ))}
                                        {data.fresh_order &&(
                                            <tr>
                                                <td><b>Total</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_grade_a, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_grade_a_plus, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_grade_a_star, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_grade_b, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_grade_c, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_pk, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.total_sample, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.fresh_order?.reduce((total, current) => total + current.grand_total, 0))}</b></td>
                                            </tr>
                                        )}
                                </tbody>
                            </Table>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th>Jenis (Re-Packing)</th>
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
                                        {data.re_packing?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a_plus)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_a_star)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_b)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_grade_c)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_pk)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.total_sample)}</td>
                                                <td>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(item.grand_total)}</td>
                                            </tr>
                                        ))}
                                        {data.re_packing && (
                                            <tr>
                                                <td><b>Total</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_grade_a, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_grade_a_plus, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_grade_a_star, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_grade_b, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_grade_c, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_pk, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.total_sample, 0))}</b></td>
                                                <td><b>{new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(data.re_packing?.reduce((total, current) => total + current.grand_total, 0))}</b></td>
                                            </tr>
                                        )}
                                </tbody>
                            </Table>
                        </div>
                    </Container>
    
                </Card.Body>
                <Card.Footer>
                    <span className="text-muted" style={{ fontSize: "10px", fontStyle: "italic" }}>{data?.Dyeing?.length} Data Ditemukan</span>
                </Card.Footer>
            </Card>
        
        <Bottom />
        
        <LoadingSpinnerModal show={isLoading}><Button variant="burgundy" onClick={cancelRequest}>Batal</Button></LoadingSpinnerModal>
        
        </Container>

    );
};

export default RekapPengirimanProduksi;
