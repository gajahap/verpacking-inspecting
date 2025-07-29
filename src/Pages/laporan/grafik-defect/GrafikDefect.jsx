import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button,Stack ,Spinner,Table } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { Bar } from 'react-chartjs-2';
import Bottom from '../../Layouts/Bottom/Bottom';
import { is } from 'react-day-picker/locale';

const GrafikDefect = () => {

    const [data, setData] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [labels, setLabels] = useState([]);

     const fetchDataIndex = async () => {
       setIsLoading(true);
       try {
         const response = await axiosInstance.get(`defect-item/get-defect-item`, { params: { tahun: year } });
         setData(response.data.data);
         console.log(response.data.data);
       } catch (error) {
         console.log(error.response);
       } finally {
         setIsLoading(false);
       }
     };

    useEffect(() => {
        if (data) {
            const namaBulan = Object.keys(data);
            setLabels(namaBulan);
        }
    }, [data]);

    useEffect(() => {
        console.log(labels);
    }, [labels]);
     
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
                            <h1 className='text-white'>Data Defect</h1>
                            <Form className="mt-4 d-flex justify-content-between gap-2 w-50">
                                <Form.Group controlId="tahun" className='flex-grow-1'>
                                    <Form.Control type="number" value={year} onChange={e => setYear(e.target.value)} maxLength={4} />
                                </Form.Group>
                                <Button variant="burgundy" onClick={fetchDataIndex}>Cari</Button>
                            </Form>
                        </div>
                        <Card className='p-4'>
                            {data.length === 0 ? isLoading ? <div className='text-center'><Spinner variant="burgundy" size="sm" animation="border" /> Loading Data..</div> : <div className='text-center'>Data Tidak Ditemukan, silakan pilih Tahun</div>  : (
                                <Bar
                                style={{ maxHeight: "700px" }}
                                data={{
                                  labels: labels, // Nama bulan
                                  datasets: (() => {
                                    const allDefectsMap = new Map(); // Map dari nama_defect → no_urut
                                  
                                    Object.entries(data).forEach(([bulan, defectsPerMonth]) => {
                                      Object.entries(defectsPerMonth).forEach(([noUrut, def]) => {
                                        allDefectsMap.set(def.nama_defect, noUrut); // simpan nama → no_urut
                                      });
                                    });
                                  
                                    const allDefectNames = Array.from(allDefectsMap.keys());
                                  
                                    return allDefectNames.map((defectName, index) => {
                                      const noUrut = allDefectsMap.get(defectName);
                                      return {
                                        label: `${defectName} (${noUrut})`,
                                        data: labels.map(bulan => {
                                          const bulanDefects = data[bulan] || {};
                                          const found = Object.entries(bulanDefects).find(
                                            ([_, def]) => def.nama_defect === defectName
                                          );
                                          return found ? found[1].total_meterage : 0;
                                        }),
                                        backgroundColor: `rgba(${50 + index * 30 % 255}, ${100 + index * 50 % 255}, ${150 + index * 40 % 255}, 0.5)`,
                                        borderColor: `rgba(${50 + index * 30 % 255}, ${100 + index * 50 % 255}, ${150 + index * 40 % 255}, 1)`,
                                        borderWidth: 1
                                      };
                                    });
                                  })()
                                  
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      labels: {
                                        color: 'black'
                                      }
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: {
                                        color: 'rgba(255,255,255,0.2)'
                                      },
                                    },
                                    x: {
                                      grid: {
                                        color: 'rgba(255,255,255,0.2)'
                                      },
                                    }
                                  }
                                }}
                              />
                              
                            )}

                        </Card>
                        <Card>
                            <Card.Body>
                                <h4>Defect Table</h4>
                                <Table className='text-center mt-3' responsive bordered hover striped>
                                    <thead>
                                        <tr>
                                        <th>Kode Defect</th>
                                        <th>Nama Defect</th>
                                        {labels.map((bulan, index) => (
                                            <th key={index}>{bulan}</th>
                                        ))}
                                        <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                        // Step 1: Buat mapping defect (no_urut + nama_defect)
                                        const defectMap = new Map();

                                        Object.values(data).forEach(defectsPerMonth => {
                                            Object.entries(defectsPerMonth).forEach(([no_urut, def]) => {
                                            defectMap.set(def.nama_defect, parseInt(no_urut));
                                            });
                                        });

                                        // Step 2: Loop tiap defect, dan tampilkan jumlah tiap bulan
                                        return Array.from(defectMap.entries())
                                            .sort(([, a], [, b]) => a - b)
                                            .map(([nama_defect, no_urut], index) => (
                                                <tr key={index}>
                                                    <td>{no_urut}</td>
                                                    <td>{nama_defect}</td>
                                                    {labels.map((bulan, i) => {
                                                        const defectsPerMonth = data[bulan] || {};
                                                        const found = Object.entries(defectsPerMonth).find(
                                                            ([_, def]) => def.nama_defect === nama_defect
                                                        );
                                                        return (
                                                            <td key={i}>{found ? found[1].total_meterage : 0}</td>
                                                        );
                                                    })}
                                                    <td>
                                                        {labels.reduce((total, bulan) => {
                                                            const defectsPerMonth = data[bulan] || {};
                                                            const found = Object.entries(defectsPerMonth).find(
                                                                ([_, def]) => def.nama_defect === nama_defect
                                                            );
                                                            return total + (found ? found[1].total_meterage : 0);
                                                        }, 0)}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
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

export default GrafikDefect;
