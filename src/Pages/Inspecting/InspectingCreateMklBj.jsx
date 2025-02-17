import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import Bottom from '../Layouts/Bottom/Bottom';
import { Card, Button, Container, Stack, Form, Table, Badge, Row, Col,Modal } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';
import { FaPlus, FaTimes, FaCheck, FaTrash, FaSave, FaEye } from 'react-icons/fa';
import CustomSelect from '../../Components/CustomSelect';
import MessageModal from '../../Components/MessageModal';
import ConfirmModal from '../../Components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
const InspectingCreate = (props) => {
    document.title = `Inspecting ${props.jenisProses.charAt(0).toUpperCase() + props.jenisProses.slice(1)} Create `;
    const [noWo, setNoWo] = useState('');
    const [data, setData] = useState([]);
    const [isSearch, setIsSearch] = useState(false);
    const [isArrow, setIsArrow] = useState(false);
    const [formData, setFormData] = useState({
        wo_id: '',
        no_wo: '',
        inspection_table:''
    });
    const [woColorOptions, setWoColorOptions] = useState([]);
    const units = {
        1: 'Yard',
        2: 'Meter',
        3: 'Pcs',
        4: 'Kilogram'
    };


    const jenisMakloon = {
        1: 'Makloon Proses',
        2: 'Makloon Finish',
        3: 'Barang Jadi',
        4: 'Fresh',
    }
    const [inspectResult, setInspectResult] = useState([]);
    const [visibleCard, setVisibleCard] = useState({ id: null, index: null });
    const [kodeDefectOption, setKodeDefectOption] = useState([]);
    const [isChooseOne, setIsChooseOne] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const navigate = useNavigate();


    const handleCloseModal = () => {
        setModalMessage('');
      };
      
    const handleAddInspectResult = () => {
        setInspectResult((prevInspectResult) => [...prevInspectResult, {
            qty: 0,
            grade: 7,
            join_piece: '',
            lot_no: '',
            gsm_item:'',
            defect: [],
        }]);
    };


    const getKodeDefectOption = async () => {
        try {
            const response = await axiosInstance.get('master-defect/get-master-defect');
            const options = response.data.data.map(defect => ({
                value: defect.id,
                label: `${defect.no_urut} - ${defect.nama_defect}`
            }));
            setKodeDefectOption(options);
        } catch (error) {
            console.error(error);
        }
    };

    
    
    const handleUpdateInspectResult = (e, index) => {
        e.preventDefault();
        const {name,value} = e.target;
        
        setInspectResult((prevInspectResult) => {
            const newInspectResult = [...prevInspectResult];
            newInspectResult[index][name] = value;
            return newInspectResult;
        });
        
    };
    
    
    const handleDeleteInspectResult = (index) => {
        setInspectResult((prevInspectResult) => {
            const newInspectResult = [...prevInspectResult];
            newInspectResult.splice(index, 1);
            return newInspectResult;
        });
    };


    

    useEffect(() => {
        getKodeDefectOption();
        setFormData({
            ...formData,
            inspect_result: inspectResult
        })
        console.log(inspectResult);
    }, [inspectResult]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.get('wo/search-wo', {
                params: {
                    no: noWo,
                },
            });
            
            setIsSearch(true);
            setData(
                response.data
                    ? response.data.sort((a, b) => (a.no > b.no ? 1 : -1))
                    : []
            );
            console.log('Data Wo',response.data);
            
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (data.length === 1) {
            setFormData({
                wo_id: data[0].id,
                no_wo: data[0].no,
            });
            setWoColorOptions(data[0].mo_colors.map(item => ({
                value: item.wo_color_id,
                label: item.color
            })));
        }else{
            setFormData({
                wo_id: '',
                no_wo: ''
            });
        }
        console.log("INI DATA",data);
    }, [data]);

    useEffect(() => {
        // console.clear();
        console.log('FORM DATA',formData);
    },[formData]);

    const handleChoosOne = (item) => {
        setNoWo(item.no);
        setIsArrow(true);
        setIsChooseOne(true);
        window.scrollTo({
            top: 0,
        });
    };

    const handleChange = (e) => {
        setIsChooseOne(false);
        setNoWo(e.target.value);
        setIsArrow(false);
    };

    const handleStore = async () => {
        try {
            if (!formData.no_lot || !formData.unit || !formData.color || !formData.jenis_makloon) {
                setModalMessage({ message: 'Warna, Nomor lot, Satuan, atau jenis makloon tidak boleh kosong.', status: 422 });
                return;
            } else if (Object.keys(inspectResult).length === 0) {
                setModalMessage({ message: 'Hasil inspect tidak boleh kosong.', status: 422 });
                return;
            } else if (Object.values(inspectResult).some(val => val.qty === 0 || val.qty === '')) {
                setModalMessage({ message: 'Jumlah hasil inspect tidak boleh kosong.', status: 422 });
                return;
            }

            const response = await axiosInstance.post('inspecting/store-mkl-bj-inspecting',formData);

            if (response.data?.success) {
                setModalMessage({ message: 'Data berhasil disimpan.', status: 200 });
                console.log(response.data);
                
                navigate(`/inspecting-mkl-bj/${response.data.data.id}`);
            }
        } catch (error) {
            setModalMessage({ message: 'Data gagal disimpan.', status: 422 });
            console.error(error);
            console.log('Request Payload:', {
                id_wo: data[0]?.id,
                no_lot: formData.no_lot,
                unit: formData.unit,
                inspect_result: inspectResult
            });
        }
    };

    const handleAddDefect = (index) => {

        setInspectResult((prevState) => {
            const newInspectResult = [...prevState];
            newInspectResult[index].defect = newInspectResult[index].defect || []; // Ambil data yang sudah ada untuk item
            newInspectResult[index].defect.push({
                meter_defect: '',
                kode_defect: '',
                point: ''
            }); // Tambahkan item baru
            return newInspectResult;
        });

    };


      const handleRemoveDefect = (index, defectIndex) => {
        setInspectResult((prevState) => {
            const newInspectResult = [...prevState];
            newInspectResult[index].defect = newInspectResult[index].defect || []; // Ambil data yang sudah ada untuk item
            newInspectResult[index].defect.splice(defectIndex, 1); // Hapus item
            return newInspectResult;
        });
    };
    
    const handleChangeDefect = (e,index, defectIndex, namaAttrDefect) => {
        const { name, value = undefined } = namaAttrDefect ? { name: namaAttrDefect, value: e.value } : e.target;
        console.log(name, value);
        
        //panggil inspectResult yang berindex array index
        const item = inspectResult[index];

        //update defect yang berindex array defectIndex
        item.defect[defectIndex] = {
            ...item.defect[defectIndex],
            [name]: value
        };

        //update inspectResult yang berindex array index
        setInspectResult((prevState) => {
            const newInspectResult = [...prevState];
            newInspectResult[index] = item;
            return newInspectResult;
        });
        
        
    };
    const handleFormConfirm = (confirmed) => {
        setShowConfirmModal(false);
        if (confirmed) {
            handleStore();
        }
    };
    
        

    return (
        <>
            <Container fluid className="p-4" style={{ marginBottom: '8rem'}}>
                <Card className="mb-3 bg-burgundy-gradient bg-pattern-card py-3 px-4 text-white shadow">
                    <h3 className="mb-0">{props.jenisProses.toUpperCase()}</h3>
                </Card>
                <Card className="p-2 shadow-sm">
                    <Form className="w-100" onSubmit={handleSubmit}>
                        <Stack direction="horizontal" gap={2}>
                            <Form.Control
                                type="search"
                                value={noWo}
                                onChange={handleChange}
                                placeholder={`Cari Kartu Proses`}
                                className={isChooseOne ? "bg-soft-green" : "bg-transparent"}
                            />
                            <Button type="submit" variant="burgundy">
                                {isArrow ? <FaArrowRight /> : <FaSearch />}
                            </Button>
                        </Stack>
                        {isSearch && (
                            <>
                                <div className="my-2">
                                    <Badge bg={data.length > 1 || data.length === 0 ? "danger" : "success"}>
                                        {data.length > 1 ? `${data.length} Kartu Ditemukan` : data.length === 1 ? <> 1 Wo telah di pilih   <FaCheck /></> : "Tidak ada kartu yang ditemukan"}
                                    </Badge>
                                </div>
                                {data.length > 1 && data.map((item, index) => (
                                    <div key={index} className="my-2">
                                        <Button onClick={() => handleChoosOne(item)} variant="burgundy">
                                            {item.no || '-'}
                                        </Button>
                                    </div>
                                ))}
                            </>
                        )}
                        
                    </Form>
                </Card>
                <Card className="my-3 shadow-sm p-3">
                    <Row className="text-center">
                        <Col lg={6} md={6} sm={6}>
                            <Table bordered responsive className="small-text m-0">
                                <tbody>
                                    <tr>
                                        <td><strong>No. WO</strong></td>
                                        <td>{formData.no_wo || '-'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                        <Col lg={6} md={6} sm={6}>
                            <Table bordered responsive className="small-text m-0">
                                <tbody>
                                    <tr>
                                        <td><strong>JML WARNA</strong></td>
                                        <td>{woColorOptions?.length || '-'}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Card>


                {data.length ===  1 && (
                    <>
                        <Card className="p-4 my-3 shadow-sm">
                            <Form>
                                <Stack direction="horizontal" gap={3} className="justify-content-center">
                                    <Form.Control type="hidden" name="inspecting_id" value={data[0].id}></Form.Control>
                                    {/* <Form.Group controlId="unit" className="w-50 small-text">
                                        <Form.Label><strong>Warna</strong></Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={formData.unit || ''}  // Fallback to an empty string
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="colors"
                                            className='small-text'
                                            required
                                        >
                                            <option value="">Pilih Satuan</option>
                                            {Object.entries(woColorOptions).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group> */}
                                    <Form.Group controlId="unit" className="w-50 small-text">
                                        <Form.Label><strong>Warna</strong></Form.Label>
                                        <CustomSelect options={woColorOptions} onChange={(selectedOption) => setFormData({ ...formData, color: selectedOption.value })} />
                                    </Form.Group>
                                    <Form.Group controlId="no_lot" className="w-50 small-text">
                                        <Form.Label><strong>No Lot</strong></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="no_lot"
                                            value={formData.no_lot || ''}  // Fallback to an empty string
                                            onChange={(e) => setFormData({ ...formData, no_lot: e.target.value.toUpperCase() })}
                                            placeholder="No Lot"
                                            className='small-text border-bold'
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="unit" className="w-50 small-text">
                                        <Form.Label><strong>Satuan</strong></Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={formData.unit || ''}  // Fallback to an empty string
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="Satuan"
                                            className='small-text border-bold'
                                            required
                                        >
                                            <option value="">Pilih Satuan</option>
                                            {Object.entries(units).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="unit" className="w-50 small-text">
                                        <Form.Label><strong>Jenis Makloon</strong></Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={formData.jenis_makloon || ''}  // Fallback to an empty string
                                            onChange={(e) => setFormData({ ...formData, jenis_makloon: e.target.value })}
                                            placeholder="Jenis Makloon"
                                            className='small-text border-bold'
                                            required
                                        >
                                            <option value="">Pilih Jenis Makloon</option>
                                            {Object.entries(jenisMakloon).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="inspection_table" className="w-50 small-text">
                                        <Form.Label><strong>No. Meja</strong></Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="inspection_table"
                                            value={formData.inspection_table || ''}  // Fallback to an empty string
                                            onChange={(e) => setFormData({ ...formData, inspection_table: e.target.value.toUpperCase() })}
                                            placeholder="No Meja"
                                            className='small-text border-bold'
                                            required
                                        />
                                    </Form.Group>
                                </Stack>
                            </Form>
                        </Card>
                        <Card className='p-3 shadow-sm rounded-0'>
                            <div className='mb-3'>
                                <Button variant="success" className='text-white' size='sm' onClick={handleAddInspectResult}>Tambah Item</Button>
                            </div>
                            <Table bordered responsive className="small-text m-0">
                                <thead>
                                    <tr>
                                        <th className="text-center">No</th>
                                        <th className='text-center'>Action</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-center">Grade</th>
                                        <th className="text-center">Join</th>
                                        <th className="text-center">Lot</th>
                                        <th>Defect</th>
                                        <th>GSM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inspectResult && inspectResult.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className='text-center'><Button variant="danger" size="sm"><FaTrash onClick={() => handleDeleteInspectResult(index)} /></Button></td>
                                            <td className="text-center">
                                                <Form.Control
                                                    type="number"
                                                    name="qty" // Fallback to an empty string
                                                    value={item.qty || ''}
                                                    onChange={(e) => handleUpdateInspectResult(e, index)}
                                                    placeholder="Qty"
                                                    className='small-text border-bold'
                                                    required
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Form.Control
                                                    as="select"
                                                    name="grade" // Fallback to an empty string
                                                    onChange={(e) => handleUpdateInspectResult(e, index)}
                                                    placeholder="Grade"
                                                    value={item.grade || ''}
                                                    className='small-text border-bold'
                                                    required
                                                >
                                                    <option value={7}>A+</option>
                                                    <option value={8}>A*</option>
                                                    <option value={2}>B</option>
                                                    <option value={3}>C</option>
                                                    <option value={4}>PK</option>
                                                    <option value={5}>Sample</option>
                                                    <option value={1}>A</option>
                                                </Form.Control>
                                            </td>
                                            <td className="text-center">
                                                <Form.Control type="text" value={item.join_piece} name="join_piece" className="small-text border-bold" onChange={(e) => handleUpdateInspectResult(e, index)} onInput={(e) => e.target.value = e.target.value.toUpperCase()}/>
                                            </td>
                                            <td className="text-center">
                                                <Form.Control type="text" value={item.lot_no} name="lot_no" className="small-text border-bold"  onChange={(e) => handleUpdateInspectResult(e, index)}/>
                                            </td>
                                            <td>
                                                <Button size='sm' variant='warning' className='text-white' onClick={setVisibleCard.bind(this, { index: index })}><FaEye /></Button>
                                                {visibleCard.index === index && (
                                                    <Modal
                                                        show={visibleCard.id === item.id && visibleCard.index === index}
                                                        size="lg"
                                                        aria-labelledby="contained-modal-title-vcenter"
                                                        className='bg-transparent'
                                                        centered
                                                    >
                                                        <Card
                                                            className="rounded"
                                                            // style={{
                                                            //     width: '350px',
                                                            //     top: '100%',
                                                            //     left: 0,
                                                            //     zIndex: 999,
                                                            // }}
                                                        >
                                                            <Card.Header>
                                                                <Stack direction="horizontal" gap={1} className="justify-content-between">
                                                                    <Card.Title className="me-auto">{item.qty}</Card.Title>
                                                                    <Stack direction="horizontal" gap={1}>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="danger"
                                                                            onClick={() => setVisibleCard({ id: null, index: null })}
                                                                        >
                                                                            <FaTimes />
                                                                        </Button>
                                                                    </Stack>
                                                                </Stack>

                                                            </Card.Header>
                                                            <Card.Body style={{ maxHeight: "700px", overflowY: "auto" }}>
                                                                <Form onSubmit={() => setVisibleCard({ id: null, index: null })}>
                                                                    <strong>Defect</strong>
                                                                    <Row className="mb-3">
                                                                        {item?.defect?.map((defect, defectIndex) => (
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
                                                                                        type="text"
                                                                                        name="meter_defect"
                                                                                        value={defect?.meter_defect}
                                                                                        className="border-bold"
                                                                                        onChange={(e) => handleChangeDefect(e, index, defectIndex)}
                                                                                    />
                                                                                </Form.Group>
                                                                                <Form.Group as={Col} xs={4}>
                                                                                    <CustomSelect
                                                                                        options={kodeDefectOption}
                                                                                        value={kodeDefectOption.find(
                                                                                            (option) => option.value === defect?.kode_defect
                                                                                        )}
                                                                                        onChange={(e) =>
                                                                                            handleChangeDefect(e, index, defectIndex, "kode_defect")
                                                                                        }
                                                                                        placeholder="Pilih"
                                                                                    />
                                                                                </Form.Group>

                                                                                <Form.Group as={Col} xs={4}>
                                                                                    <Stack gap={2} direction="horizontal">
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            name="point"
                                                                                            value={defect?.point}
                                                                                            className="border-bold no-spinner"
                                                                                            onChange={(e) => handleChangeDefect(e, index, defectIndex)}
                                                                                        />
                                                                                        <Button
                                                                                            variant="danger"
                                                                                            onClick={() => handleRemoveDefect(index, defectIndex)}
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </Button>
                                                                                    </Stack>
                                                                                </Form.Group>
                                                                            </React.Fragment>
                                                                        ))}
                                                                        <Col className="pt-2">
                                                                            <Button className="w-100" variant='secondary' size="sm" onClick={() => handleAddDefect(index)}>
                                                                                <FaPlus /> Tambah Defect
                                                                            </Button>
                                                                        </Col>

                                                                    </Row>

                                                                    <Button size="sm" type="submit" variant="success"><FaSave/> Simpan</Button>
                                                                </Form>
                                                            </Card.Body>
                                                        </Card>
                                                    </Modal>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <Form.Control type="number" step="0.01" value={item.gsm_item} name="gsm_item" className="small-text border-bold"  onChange={(e) => handleUpdateInspectResult(e, index)}/>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
                        </Card>
                        <Container fluid className="mt-4">
                                <Button variant="burgundy" className='w-100' onClick={() => setShowConfirmModal(true)}>Kirim</Button>
                        </Container>
                    </>
                )}
            </Container>
            <Bottom />
            <MessageModal
                show={modalMessage}
                onHide={handleCloseModal}
                status={modalMessage.status}
                title='Warning'
                message={modalMessage.message}
            />
            <ConfirmModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={handleFormConfirm}
                title="Konfirmasi"
            />
        </>
    );
};

export default InspectingCreate;
