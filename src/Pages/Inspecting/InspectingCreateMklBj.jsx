import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import Bottom from '../Layouts/Bottom/Bottom';
import { Card, Button, Container, Stack, Form, Table, Badge, Row, Col,Modal,Spinner } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';
import { FaPlus, FaTimes, FaCheck, FaTrash, FaSave, FaEye } from 'react-icons/fa';
import CustomSelect from '../../Components/CustomSelect';
import MessageModal from '../../Components/MessageModal';
import ConfirmModal from '../../Components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { showConfirm } from "../../Components/ConfirmToast";
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

    const [inspectResult, setInspectResult] = useState([]);
    const [visibleCard, setVisibleCard] = useState({ id: null, index: null });
    const [kodeDefectOption, setKodeDefectOption] = useState([]);
    const [isChooseOne, setIsChooseOne] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmiting, setIsSubmiting] = useState(false);
    const [isCanCallPrevInput, setIsCanCallPrevInput] = useState(false);
    const [gsm, setGsm] = useState(0);

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
            gsm_item:gsm,
            defect: [],
            time_add: Date.now() / 1000,
            qty_bit:''
        }]);

        handleUpdateNoUrut();
    };

    const handleUpdateNoUrut = () => {
        setInspectResult((prevInspectResult) => {
            const sortedInspectResult = [...prevInspectResult].sort((a,b) => a.time_add - b.time_add);
            return sortedInspectResult.map((result, index) => ({
                ...result,
                no_urut: index + 1
            }));
        });
    };


    const getKodeDefectOption = async (e) => {
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

    useEffect(() => {
        getKodeDefectOption();
    }, []);


    
    const handleUpdateInspectResult = (e, index) => {
        const { name, value } = e.target;
        console.log(name, value);
        
        if(name === 'grade' && value === '5' || value === 5 || value === '4' || value === 4){
            setInspectResult(prevState => {
                const newState = [...prevState];
                newState[index].grade = value;
                newState[index].defect = [];
                return newState;
            })
            return;
        }

        setInspectResult(prevState => {
          // Clone array
          const newState = (typeof structuredClone === "function")
            ? structuredClone(prevState)
            : JSON.parse(JSON.stringify(prevState));
      
          const currentItem = newState[index];
      
          // ===== CHECK JOIN PIECE CHANGE =====
          const isJoinPieceChange = name === "join_piece";
          const oldJoinPiece = prevState[index].join_piece;
          const newJoinPiece = isJoinPieceChange ? value.toUpperCase() : oldJoinPiece;
      
          // === STEP 1: Update item utama ===
          currentItem[name] = isJoinPieceChange ? newJoinPiece : value;
      
          // === STEP 2: Jika join_piece berubah → regrade group lama ===
          if (isJoinPieceChange && oldJoinPiece !== "") {
            const oldGroup = prevState.filter(item => item.join_piece === oldJoinPiece);
      
            oldGroup.forEach(oldItem => {
              const idx = newState.findIndex(x => x.no_urut === oldItem.no_urut);
              if (idx !== -1) {
                const updatedDefect = newState[idx].defect || [];
                const g = gradingValidation(updatedDefect, newState, idx);
                newState[idx].grade = g.grade;
              }
            });
          }
      
          // === STEP 3: Grade item utama + group baru ===
          const gradeResult = gradingValidation(currentItem.defect || [], newState, index);
          currentItem.grade = gradeResult.grade;
      
          // === STEP 4: Update group join_piece baru ===
          if (gradeResult.groupItems && gradeResult.groupItems.length > 0) {
            gradeResult.groupItems.forEach(item => {
              const idx = newState.findIndex(x => x.no_urut === item.no_urut);
              if (idx !== -1) {
                newState[idx].grade = gradeResult.grade;
              }
            });
          }
      
          return newState;
        });
    };
    
    
    const handleDeleteInspectResult = (index) => {
        setInspectResult((prevInspectResult) => {
            const newInspectResult = [...prevInspectResult];
            newInspectResult.splice(index, 1);
            return newInspectResult;
        });
        handleUpdateNoUrut();
    };
    

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
            // console.log(response.data);
            
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
            
            // jika ada data wo degan wo_id yang sama di local storage maka setisCanCall true
            if (localStorage.getItem('formData')) {
                const formData = JSON.parse(localStorage.getItem('formData'));
                if (formData.wo_id === data[0].id) {
                    setIsCanCallPrevInput(true);
                }else{
                    setIsCanCallPrevInput(false);
                }
            }

            setIsChooseOne(true);
        }else{
            setIsCanCallPrevInput(false);
            setFormData({
                wo_id: '',
                no_wo: ''
            });
        }
    }, [data]);

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
        setIsSubmiting(true);
    
        // Simpan ke local storage sebagai backup draft
        localStorage.setItem('inspectResult', JSON.stringify(inspectResult));
        localStorage.setItem('formData', JSON.stringify(formData));
    
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
            
            // --- PANGGILAN API ---
            const response = await axiosInstance.post('inspecting/store-mkl-bj-inspecting',{...formData, inspect_result: inspectResult});
    
            if (response.data?.success) {
                // Log respons sukses (opsional, tapi informatif)
    
                // Hapus localstorage jika berhasil
                localStorage.removeItem('inspectResult');
                localStorage.removeItem('formData');
                
                await showConfirm("Data berhasil disimpan. mohon jangan klik tombol simpan berulang-ulang, karena jika berhasil anda akan langsung diarahkan ke halaman detail.", { useCancelButton: false, confirmText : 'OK' });
                navigate(`/inspecting-mkl-bj/${response.data.data.id}`);
            }
        } catch (error) {
            
            // Cetak objek error secara lengkap agar developer mudah debugging
            console.error("Store Error Detail:", error); 
    
            // --- Logika Penanganan Exception yang Disempurnakan ---
            let errorMessage = "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
            let errorStatus = 500;
            
            if (error.response) {
                // 1. Kesalahan Respons Server
                errorMessage = error.response.data?.message || `Kesalahan dari server: Status ${error.response.status}.`;
                errorStatus = error.response.status;
            } else if (error.request) {
                // 2. Tidak Ada Respons (Masalah Jaringan/Timeout)
                // Menambahkan kode error spesifik jika tersedia (misalnya code ETIMEDOUT)
                const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
                errorMessage = isTimeout 
                    ? "Permintaan ke server melebihi batas waktu (timeout). Silakan coba lagi."
                    : "Gagal terhubung ke server. Periksa koneksi internet Anda atau coba lagi.";
                errorStatus = isTimeout ? 408 : 503; 
            } else {
                // 3. Kesalahan Lain (Klien/Aplikasi)
                errorMessage = error.message || "Kesalahan klien/aplikasi. Periksa konfigurasi.";
                errorStatus = 500;
            }
    
            setModalMessage({
                message: errorMessage,
                status: errorStatus,
            });
        } finally {
            // Memastikan loading state selalu dimatikan, terlepas dari hasil try/catch
            setIsSubmiting(false); 
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

    const gradingValidation = (newDefects, state, index) => {
        const currentItem = state[index];
      
        // === Cari group berdasarkan join_piece ===
        const groupItems = state.filter(
          (item, i) =>
            item.join_piece !== "" &&
            item.join_piece !== null &&
            item.join_piece === currentItem.join_piece &&
            i !== index
        );
      
        // === Combine defect current item + group items ===
        const allDefects = [
          ...groupItems.map(item => item.defect || []),
          newDefects
        ].flat();
      
        // === Hitung total point ===
        const totalPoint = allDefects.reduce(
          (sum, d) => sum + (d.point ? parseInt(d.point, 10) : 0),
          0
        );
      
        // === Hitung nilai poin ===
        const totalQty =
          currentItem.qty * 1 +
          groupItems.reduce((sum, item) => sum + (item.qty * 1), 0);
      
        const a = totalPoint * 3600;
        const b = totalQty * lebarKain[data[0].sc_greige?.lebar_kain]; // misal pakai default lebar kain
      
        const nilaiPoin = parseFloat((a / b).toFixed(1));
        
      
        // Grade
        let grade =
          nilaiPoin <= 24 ? 1 :
          nilaiPoin <= 30 ? 2 :
          3;
      
        return { nilaiPoin, grade, groupItems };
      };
      


      const handleRemoveDefect = (index, defectIndex) => {
        setInspectResult(prevState => {
          const currentItem = prevState[index];
      
          // Hapus defect secara immutable
          const updatedDefects = (currentItem.defect || []).filter((_, i) => i !== defectIndex);
      
          // Hitung grade baru
          const gradeResult = gradingValidation(
            updatedDefects,
            prevState,
            index
          );
        //   console.log("gradeResult", gradeResult);
      
          // Update item utama
          const updatedItem = {
            ...currentItem,
            defect: updatedDefects.length > 0 ? updatedDefects : [],
            grade: gradeResult.grade
          };
      
          // Clone state
          const newState = structuredClone(prevState);
      
          // Update item utama
          newState[index] = updatedItem;
      
          // UPDATE SEMUA item yang join_piece sama (NON-NESTED)
          if (gradeResult.groupItems?.length > 0) {
            gradeResult.groupItems.forEach(item => {
              const idx = newState.findIndex(x => x.no_urut === item.no_urut);
              if (idx !== -1) {
                newState[idx] = {
                  ...newState[idx],
                  grade: gradeResult.grade
                };
              }
            });
          }
      
          return newState;
        });
      };
      
    const handleChangeDefect = (e, index, defectIndex, namaAttrDefect) => {
        const { name, value = undefined } = namaAttrDefect
          ? { name: namaAttrDefect, value: e.value }
          : e.target;
      
        setInspectResult(prevState => {
      
          // Clone prevState agar aman
          const newState = (typeof structuredClone === "function")
            ? structuredClone(prevState)
            : JSON.parse(JSON.stringify(prevState));
      
          const currentItem = newState[index];
      
          // === STEP 1: update defect di item utama ===
          const updatedDefects = currentItem.defect.map((d, i) =>
            i === defectIndex ? { ...d, [name]: value } : d
          );
      
          currentItem.defect = updatedDefects;
      
          // === STEP 2: hitung grade baru item utama + group join_piece ===
          const gradeResult = gradingValidation(
            updatedDefects,
            newState,
            index
          );

          console.log('gr',gradeResult);
          
      
          currentItem.grade = gradeResult.grade;
      
          // === STEP 3: update semua item yang join_piece sama ===
          if (gradeResult.groupItems && gradeResult.groupItems.length > 0) {
            gradeResult.groupItems.forEach(item => {
              const idx = newState.findIndex(x => x.no_urut === item.no_urut);
              if (idx !== -1) {
                newState[idx].grade = gradeResult.grade;
              }
            });
          }
      
          return newState;
        });
      };
      
    const handleFormConfirm = (confirmed) => {
        setShowConfirmModal(false);
        if (confirmed) {
            handleStore();
        }
    };

    const onChangeGsm = (e) => {
    const newGsm = e.target.value.trim();
    setGsm(newGsm);

    setInspectResult((prevInspectResult) => {
        return prevInspectResult.map((result) => ({
            ...result,
            gsm_item: newGsm,
        }));
    });

    };

    
    const handleCallPrevInput = (e) => {
        e.preventDefault();
        //ambil dari local storage
        const dataHeader = localStorage.getItem('formData');
        const dataInspect = localStorage.getItem('inspectResult');
        if (dataHeader) {
          setFormData(JSON.parse(dataHeader));
        }
        if (dataInspect) {
          setInspectResult(JSON.parse(dataInspect));
        }
        alert("berhasil mengambil data sebelumnya");
      };
    
    // const getMemo = async (e) => {
    //     try {
    //         const response = await axiosInstance.get('master-defect/get-master-defect');
    //         const options = response.data.data.map((defect) => ({
    //             value: defect.id,
    //             label: `${defect.no_urut.toString().padStart(2, '0')} - ${defect.nama_defect}`,
    //           }));
    //         setKodeDefectOption(options);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };
    // useEffect(() => {
    //     console.log('ini inspect result',inspectResult);
        
    // }, [inspectResult]);

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
                                <div className="my-2 d-flex gap-2">
                                    <Badge bg={data.length > 1 || data.length === 0 ? "danger" : "success"}>
                                        {data.length > 1 ? `${data.length} Kartu Ditemukan` : data.length === 1 ? <> 1 Wo telah di pilih   <FaCheck /></> : "Tidak ada kartu yang ditemukan"}
                                    </Badge>
                                    {isCanCallPrevInput && (
                                        <Button
                                        variant="burgundy"
                                        size="sm"
                                        onClick={handleCallPrevInput}
                                    >
                                        Ambil data input sebelumnya
                                    </Button>  
                                    )}
                                    
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
                                <Row>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="unit" className="small-text">
                                            <Form.Label><strong>Warna</strong></Form.Label>
                                            <CustomSelect options={woColorOptions} value={woColorOptions.find((option) => option.value === formData.color)} onChange={(selectedOption) => setFormData({ ...formData, color: selectedOption.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="no_lot" className="small-text">
                                            <Form.Label><strong>No Batch</strong></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="no_lot"
                                                value={formData.no_lot || ''}  // Fallback to an empty string
                                                onChange={(e) => setFormData({ ...formData, no_lot: e.target.value.toUpperCase() })}
                                                placeholder="No. batch"
                                                className='small-text border-bold'
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="unit" className="small-text">
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
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="unit" className="small-text">
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
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="inspection_table" className="small-text">
                                            <Form.Label><strong>No. Mesin</strong></Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="inspection_table"
                                                value={formData.inspection_table || ''}  // Fallback to an empty string
                                                onChange={(e) => setFormData({ ...formData, inspection_table: e.target.value.toUpperCase() })}
                                                placeholder="No Mesin"
                                                className='small-text border-bold'
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="jenis_inspek" className="small-text">
                                            <Form.Label>
                                            <strong>Jenis Inspeksi</strong>
                                            </Form.Label>
                                            <Form.Control
                                            as="select"
                                            value={formData.jenis_inspek || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, jenis_inspek: e.target.value })
                                            }
                                            className='small-text border-bold'
                                            required
                                            >
                                            <option value="">Pilih Jenis Inspeksi</option>
                                            <option value="1">Fresh Order</option>
                                            <option value="2">Re-Packing</option>
                                            <option value="3">Hasil Perbaikan</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>

                                    {formData.jenis_inspek === "2" && (
                                        <Col lg={3} md={4} sm={6} className="mb-3">
                                            <Form.Group controlId="inspection_table" className="small-text">
                                                <Form.Label><strong>No. Memo</strong></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="no_memo"
                                                    value={formData.no_memo || ''}  // Fallback to an empty string
                                                    onChange={(e) => setFormData({ ...formData, no_memo: e.target.value.toUpperCase() })}
                                                    placeholder="No Memo"
                                                    className='small-text border-bold'
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="inspection_table" className="small-text">
                                            <Form.Label><strong>Gramasi</strong></Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="gsm_item"
                                                value={gsm}  // Fallback to an empty string
                                                onChange={onChangeGsm}
                                                placeholder="Gramasi"
                                                className='small-text border-bold'
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="note" className="small-text">
                                            <Form.Label><strong>Keterangan</strong></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="note"
                                                value={formData.note || ''}  // Fallback to an empty string
                                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                                placeholder="Keterangan"
                                                className='small-text border-bold'
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={3} md={4} sm={6} className="mb-3">
                                        <Form.Group controlId="note" className="small-text">
                                            <Form.Label><strong>Lebar Kain</strong></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="note"
                                                value={lebarKain[data[0]?.sc_greige?.lebar_kain || null] || 58}  // Fallback to an empty string
                                                className='small-text border-bold'
                                                readOnly
                                                disabled
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                        <Card className='p-3 shadow-sm rounded-0'>
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
                                        <th>Gramasi</th>
                                        <th>BITS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inspectResult && inspectResult.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className='text-center'><Button variant="danger" size="sm" onClick={() => handleDeleteInspectResult(index)} ><FaTrash /></Button></td>
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
                                            {/* <td className="text-center">
                                                <Form.Control type="number" step="0.01" value={item.gsm_item} name="gsm_item" className="small-text border-bold"  onChange={(e) => handleUpdateInspectResult(e, index)}/>
                                            </td> */}
                                            <td className='text-center'>
                                                <Form.Control type="number" value={item.gsm_item} name="gsm_item" className="small-text border-bold"  disabled/>
                                            </td>
                                            <td className='text-center'>
                                                <Form.Control type="number" step="1" value={item.qty_bit ? item.qty_bit : ''} name="qty_bit" className="small-text border-bold"  onChange={(e) => handleUpdateInspectResult(e, index)}/>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
                            <div className='mt-3'>
                                <Button variant="success" className='text-white' size='sm' onClick={handleAddInspectResult}>Tambah Item</Button>
                            </div>
                        </Card>
                        <Container fluid className="mt-4">
                                <Button 
                                    variant="burgundy" 
                                    className='w-100' 
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={isSubmiting}
                                    >
                                        {isSubmiting ? (
                                        <Spinner animation="border" size="sm" />
                                        ) : (
                                        "Simpan"
                                        )}
                                </Button>
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
