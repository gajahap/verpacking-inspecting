import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import { Card, Button, Stack, Form, Row, Col, Modal,Spinner } from 'react-bootstrap';
import { FaPlus, FaTimes, FaTrash, FaSave } from 'react-icons/fa';
import CustomSelect from '../../Components/CustomSelect';

const InspectResultAdd = (props) => {
    const [kodeDefectOption, setKodeDefectOption] = useState([]);
    const [kartuProsesItemOption, setKartuProsesItemOption] = useState([]);
    const [isSubmiting, setIsSubmiting] = useState(false);
    const [joinPieceItem, setJoinPieceItem] = useState([]); 

    const lebarKain = {
        1: 44,
        2: 58,
        3: 64,
        4: 66,
        5: 68,
        6: 72,
        7: 69,
        8: 70,
        9: 71,
        10: 74,
        11: 76,
        12: 78,
        13: 80,
        14: 82,
        15: 84,
        16: 86,
        17: 88,
        18: 90
      }
    
    
    const [formData, setFormData] = useState({
        inspecting_id: props.inspectingData.id || '',
        qty: '',
        grade: 7,
        join_piece: '',
        lot_no: '',
        defect: [],
        stock_id: '',
        gsm_item: ''
    });

    useEffect(() => {
        console.log(props);
        
    }, [props]);

    useEffect(() => {
        const getKodeDefectOption = async () => {
            try {
                const response = await axiosInstance.get('master-defect/get-master-defect');
                const options = response.data.data.map((defect) => ({
                    value: defect.id,
                    label: `${defect.no_urut.toString().padStart(2, '0')} - ${defect.nama_defect}`,
                  }));
                setKodeDefectOption(options);
            } catch (error) {
                console.error(error);
            }
        };        
        
        const getKartuProsesItem = async () => {
            try {
                const endpoint = props.jenisProses === 'dyeing' ? 'kartu-proses-dyeing/get-kartu-proses-dyeing/{id}' : 'kartu-proses-printing/get-kartu-proses-printing/{id}';
                const response = await axiosInstance.get(endpoint.replace('{id}', props.inspectingData?.kartu_process_dyeing_id || props.inspectingData?.kartu_process_printing_id));
                
                const data  = response.data.data[`kartu_proses_${props.jenisProses}_item`];
                const options = data.map(item => ({
                    value: item.stock_id,
                    label: `(${item.panjang_m})  ${item.mesin !== null ?' | ' + item.mesin : ''}  |  ${item.date}`,
                    name : 'stock_id'
                }));
                setKartuProsesItemOption(options);
            } catch (error) {
                console.error(error);
            }
        };

        getKodeDefectOption();
        if(props.jenisProses !== 'mkl-bj'){
            getKartuProsesItem();
        }
    }, [props]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmiting) return; // cegah double submit
        setIsSubmiting(true);
      
        try {
          // tentukan url
          const url =
            props.jenisProses === "mkl-bj"
              ? "inspecting/add-inspect-mklbj-result"
              : "inspecting/add-inspect-result";
      
          // 1. submit item baru
          const response = await axiosInstance.post(url, formData);
      
          // 2. update item lain yang punya join piece yang sama
          if (joinPieceItem.length > 0) {
            const url2 =
              props.jenisProses === "mkl-bj"
                ? "inspecting/update-inspecting-mklbj/item"
                : "inspecting/get-inspecting/update";
      
            await Promise.all(
              joinPieceItem.map((item) =>
                axiosInstance.put(`${url2}/${item.id}`, {
                  inspecting_id: item.inspecting_id,
                  inspecting_item_id: item.id,
                  qty: item.qty,
                  grade: formData.grade,
                  join_piece: item.join_piece,
                  is_head: item.is_head,
                  lot_no: item.lot_no,
                  defect: item.defect_item || [], // aman
                  stock_id: item.stock_id,
                  gsm_item: item.gsm_item,
                  qty_bit: item.qty_bit,
                })
              )
            );
          }
      
          // 3. sukses total, PANGGIL SEKALI SAJA
          if (props.onSuccessAdd) {
            props.onSuccessAdd(response.data);
          }
      
        } catch (error) {
          console.error("Submit error:", error);
        } finally {
          setIsSubmiting(false);
        }
      };
      

    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };
    const handleChangeFormSelect = (selected) => {
        const { name, value } = selected;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    const handleAddDefect = () => {
        setFormData(prevFormData => ({ 
            ...prevFormData, 
            defect: [...prevFormData.defect, {
                meterage: '',
                mst_kode_defect_id: '',
                point: ''
            }]
        }));
    };

    const handleDeleteDefect = (index) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            defect: prevFormData.defect.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        // grade 5 → skip perhitungan
        if (formData.grade === 5 || formData.grade === "5") return;
      
        // validasi join piece
        // const joinPiece = formData.join_piece;
        // if (!joinPiece) return;
      
        // cari item lain dengan join_piece sama, kecuali item yang sedang diedit
        const anotherItem = props.inspectItem.filter(
          item => 
            item.join_piece === formData.join_piece &&
            item.id !== formData.id &&
            item.join_piece !== null &&
            item.join_piece !== ''
        );
      
        setJoinPieceItem(anotherItem);
      
        // hitung defect point item saat ini
        const defectPoint = (formData.defect || [])
          .map(d => parseInt(d.point || 0, 10))
          .reduce((a, b) => a + b, 0);
      
        // hitung qty join piece lainnya
        const anotherQty = anotherItem
          .reduce((total, item) => total + (parseInt(item.qty) || 0), 0);
      
        // hitung semua defect point di join piece lainnya
        const anotherDefectPoint = anotherItem
          .flatMap(item => item.defect_item || [])
          .map(d => parseInt(d.point || 0, 10))
          .reduce((a, b) => a + b, 0);
      
        const totalQty = anotherQty + (parseInt(formData.qty) || 0);
        const totalPoint = anotherDefectPoint + defectPoint;
      
        if (totalQty === 0) return;
      
        const LK = lebarKain[props.lebarKain];
        const nilaiPoin = ((totalPoint * 3600) / (LK * totalQty)).toFixed(1);
      
        let newGrade = 3;
        if (nilaiPoin <= 24) newGrade = 1;
        else if (nilaiPoin <= 30) newGrade = 2;

        console.log('----------------------------------');
        console.log('this defectPoint', defectPoint);
        console.log('this anotherItem', anotherItem);
        console.log('this anotherItemTotalQty', anotherQty);
        console.log('this anotherItemDefectPoint', anotherDefectPoint);
        console.log('currentTotalQty', totalQty);
        console.log('currentTotalPoint', totalPoint);
        
        console.log('----------------------------------');
        console.log('nilai poin: ',nilaiPoin);
      
        // hanya update grade jika berubah
        if (newGrade !== formData.grade) {
          setFormData(prev => ({ ...prev, grade: newGrade }));
        }
      
      }, [formData.qty, formData.defect, formData.join_piece]);
      

    return (
        <>
            <Modal
                show={true}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                className='bg-transparent'
                centered
            >
                <Card className="rounded">
                    <Card.Header>
                        <Stack direction="horizontal" gap={1} className="justify-content-between">
                            <Card.Title className="me-auto">Add Inspect Result</Card.Title>
                            <Stack direction="horizontal" gap={1}>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={props.closeModal}
                                >
                                    <FaTimes />
                                </Button>
                            </Stack>
                        </Stack>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: "700px", overflowY: "auto" }}>
                        <Form onSubmit={handleSubmit}>
                            {props.jenisProses !== 'mkl-bj' && (
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Asal Greige</strong></Form.Label>
                                    <CustomSelect options={kartuProsesItemOption}  onChange={handleChangeFormSelect}/>
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label><strong>Qty</strong></Form.Label>
                                <Form.Control type="number" value={formData.qty} className='border-bold' name="qty" onChange={handleChangeForm} />
                            </Form.Group>   
                            <Form.Group className="mb-3">
                                <Form.Label><strong>GSM</strong></Form.Label>
                                <Form.Control type="number" step="0.01" value={formData?.gsm_item} className='border-bold' name="gsm_item"  onChange={handleChangeForm} required/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label><strong>Lebar Kain</strong></Form.Label>
                                <Form.Control type="number" step="0.01" value={lebarKain[props.lebarKain]} className='border-bold' name="gsm_item"  onChange={handleChangeForm} disabled readOnly/>
                            </Form.Group>
                            <hr />
                            <Row className="mb-3">
                                <Form.Group as={Col} xs={4}>
                                    <Form.Label><strong>Grade</strong></Form.Label>
                                    <Form.Select className="border-bold" name="grade" value={formData.grade} onChange={handleChangeForm} required>
                                        <option value="7">A+</option>
                                        <option value="8">A*</option>
                                        <option value="2">B</option>
                                        <option value="3">C</option>
                                        <option value="4">PK</option>
                                        <option value="5">Sample</option>
                                        <option value="1">A</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group as={Col} xs={4}>
                                    <Form.Label><strong>Join</strong></Form.Label>
                                    <Form.Control type="text" name="join_piece" value={formData.join_piece.toUpperCase()} className="border-bold" onChange={(e) => {
                                        const uppercasedValue = e.target.value.toUpperCase();
                                        handleChangeForm({ target: { name: "join_piece", value: uppercasedValue } });
                                    }} />
                                </Form.Group>
                                <Form.Group as={Col} xs={4}>
                                    <Form.Label><strong>Lot</strong></Form.Label>
                                    <Form.Control type="text" name="lot_no" value={formData.lot_no} className="border-bold" onChange={handleChangeForm} />
                                </Form.Group>
                            </Row>
                            <strong>Defect</strong>
                            <Row className="mb-3">
                                {formData.defect.map((defect, defectIndex) => (
                                    <React.Fragment key={defectIndex}>
                                        {defectIndex === 0 && (
                                            <>
                                                <Form.Group as={Col} xs={4}>
                                                    <Form.Label>Meter</Form.Label>
                                                </Form.Group>
                                                <Form.Group as={Col} xs={4}>
                                                    <Form.Label>Kode</Form.Label>
                                                </Form.Group>
                                                <Form.Group as={Col} xs={4}>
                                                    <Form.Label>Point</Form.Label>
                                                </Form.Group>
                                            </>
                                        )}
                                        <Form.Group as={Col} xs={4} className="mb-3">
                                            <Form.Control
                                                type="number"
                                                name="meter_defect"
                                                value={defect.meterage}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    defect: formData.defect.map((def, i) =>
                                                        i === defectIndex ? { ...def, meterage: parseInt(e.target.value, 10) || 0 } : def
                                                    )
                                                })}
                                                className="border-bold"
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} xs={4}>
                                            <CustomSelect
                                                options={kodeDefectOption}
                                                value={kodeDefectOption.find(
                                                    (option) => option.value === defect.mst_kode_defect_id
                                                )}
                                                onChange={(e) => {
                                                    const updatedDefects = [...formData.defect];
                                                    updatedDefects[defectIndex] = { ...updatedDefects[defectIndex], mst_kode_defect_id: e.value };
                                                    setFormData({ ...formData, defect: updatedDefects });
                                                }}
                                                placeholder="Pilih"
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col} xs={4}>
                                            <Stack gap={2} direction="horizontal">
                                                <Form.Control
                                                    type="number"
                                                    name="point"
                                                    value={defect.point}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        defect: formData.defect.map((def, i) =>
                                                            i === defectIndex ? { ...def, point: parseInt(e.target.value, 10) || 0 } : def
                                                        )
                                                    })}
                                                    className="border-bold no-spinner"
                                                />
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteDefect(defectIndex)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </Stack>
                                        </Form.Group>
                                    </React.Fragment>
                                ))}
                                <Col className="pt-2">
                                    <Button className="w-100" variant='secondary' size="sm" onClick={handleAddDefect}>
                                        <FaPlus /> Tambah Defect
                                    </Button>
                                </Col>
                            </Row>

                            <Button size="sm" type="submit" variant="success">{isSubmiting? <Spinner animation="border" size="sm" /> : (<><FaSave />Simpan</>)}</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Modal>
        </>
    );
};

export default InspectResultAdd;

