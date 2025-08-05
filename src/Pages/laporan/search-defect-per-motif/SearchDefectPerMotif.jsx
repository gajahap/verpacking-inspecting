import React, { useState } from 'react';
import { Container, Card, Form, Button,Stack ,Table } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import Bottom from '../../Layouts/Bottom/Bottom';

const SearchDefectPerMotif = () => {
    document.title = "Search Defect Per Motif";
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [params,setParams] = useState({});
     const fetchDataIndex = async () => {
       setIsLoading(true);
       try {
        console.log(params);
        if(!params.start_date || !params.end_date){
            alert('Tanggal harus diisi');
            return;
        }else if(new Date(params.end_date) < new Date(params.start_date)){
            alert('Tanggal akhir tidak boleh lebih kecil dari tanggal awal');
            return;
        } else if((new Date(params.end_date) - new Date(params.start_date)) / (1000 * 60 * 60 * 24) > 30){
            alert('Jarak tanggal awal ke akhir tidak boleh lebih dari 30 hari');
            return;
        } else{
            console.log('data yang dikirm',params);
            
            const response = await axiosInstance.get(`defect-item/get-defect-tgl-kirim`, params);
            setData(response.data.data);
            console.log(response.data.data);
        }
       } catch (error) {
         console.log(error.response);
       } finally {
         setIsLoading(false);
       }
     };


    const handleChangeParams = (e) => {
        const { name, value } = e.target;
        setParams((prevParams) => ({
          ...prevParams,
          [name]: value,
        }));
      };


        
    return (
        <>
        <div className="vh-100" style={{ position: "relative", height: "30rem"}}>
        <div
          style={{
            height: "70%",
            justifyContent: "center",
          }}
          className="bg-burgundy-gradient bg-pattern-container text-white p-4 curved-container"
        >
        </div>
            <div className="p-4" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <Container fluid className="py-5 container-padding-bottom">
                    <Stack direction="vertical" gap={3} style={{ marginBottom: "200px" }}>
                        <div className='py-4'>
                            <h1 className='text-white'>Rekap Defect By Motif dan Grade</h1>
                            <Form className="mt-4 d-flex justify-content-between gap-2 w-50 align-items-end">
                                <Form.Group controlId="tahun" className='flex-grow-1'>
                                    <Form.Label className="text-white">Tanggal Awal</Form.Label>
                                    <Form.Control type="date" name="start_date" onChange={handleChangeParams} maxLength={4} />
                                </Form.Group>
                                <Form.Group controlId="tahun" className='flex-grow-1'>
                                    <Form.Label className="text-white">Tanggal Akhir</Form.Label>
                                    <Form.Control type="date" name="end_date" onChange={handleChangeParams} maxLength={4} />
                                </Form.Group>
                                <Form.Group controlId="tahun" className='flex-grow-1'>
                                    <Form.Label className="text-white"></Form.Label>
                                    <Button variant="burgundy" className='mt-auto' onClick={fetchDataIndex}>Cari</Button>
                                </Form.Group>
                            </Form>
                        </div>
                        <Card>
                            <Card.Body>
                                <Table className='text-center mt-3' responsive bordered hover striped>
                                    <thead>
                                        <tr>
                                        <th>No</th>
                                        <th>Kode Defect</th>
                                        <th>Nama Defect</th>
                                        <th>Grade B</th>
                                        <th>Grade C</th>
                                        <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.no_urut}</td>
                                                <td>{item.nama_defect}</td>
                                                <td style={{whiteSpace: 'pre-wrap', textAlign: 'center'}} className='text-left'>
                                                    {item.grade_2.length > 0 ? item.grade_2.map((grade2, i) => (
                                                        <div key={i} style={{textAlign: 'left'}}>{`${grade2.nama_kain} = ${grade2.meterage}`}</div>
                                                    )) : '-'}
                                                </td>
                                                <td style={{whiteSpace: 'pre-wrap', textAlign: 'center'}} className='text-left'>
                                                    {item.grade_3.length > 0 ? item.grade_3.map((grade3, i) => (
                                                        <div key={i} style={{textAlign: 'left'}}>{`${grade3.nama_kain} = ${grade3.meterage}`}</div>
                                                    )) : '-'}
                                                </td>
                                                <td>{item.total_grade_2 + item.total_grade_3}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Stack>
                </Container>
            </div>
      </div>
      <Bottom />
      </>
    );
};

export default SearchDefectPerMotif;
