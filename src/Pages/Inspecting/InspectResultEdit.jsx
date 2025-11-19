import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import { Card, Button, Stack, Form, Row, Col, Modal, Spinner } from "react-bootstrap";
import { FaPlus, FaTimes, FaTrash, FaSave } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect";
const InspectResultEdit = (props) => {
  const [kodeDefectOption, setKodeDefectOption] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinPieceItem, setJoinPieceItem] = useState([]);
  const [joinPieceItemBefore,setJoinPieceItemBefore] = useState([]);
  const result = props.result;

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
    inspecting_id: result.inspecting_id,
    inspecting_item_id: result.id,
    qty: result.qty,
    grade: result.grade,
    join_piece: result.join_piece,
    is_head: result.is_head,
    lot_no: result.lot_no,
    defect: result.defect_item,
    stock_id: result.stock_id,
    gsm_item: result.gsm_item,
    qty_bit: result.qty_bit,
  });

  // useEffect(() => {
  //   console.log(props);
  // }, [props]);

  const getKodeDefectOption = async () => {
    try {
      const response = await axiosInstance.get(
        "master-defect/get-master-defect"
      );
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
  }, [props]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const url =
        props.jenisProses === "mkl-bj"
          ? "inspecting/update-inspecting-mklbj/item"
          : "inspecting/get-inspecting/update";
  
      // 1. Update item utama
      await axiosInstance.put(`${url}/${result.id}`, formData);
  
      // 2. Update joinPieceItem jika ada
      if (joinPieceItem.length > 0) {
        await Promise.all(
          joinPieceItem.map((item) =>
            axiosInstance.put(`${url}/${item.id}`, {
              inspecting_id: item.inspecting_id,
              inspecting_item_id: item.id,
              qty: item.qty,
              grade: formData.grade,
              join_piece: item.join_piece,
              is_head: item.is_head,
              lot_no: item.lot_no,
              defect: item.defect_item,
              stock_id: item.stock_id,
              gsm_item: item.gsm_item,
              qty_bit: item.qty_bit,
            })
          )
        );
      }
  
      // 3. Grading ulang item sebelumnya
      if (joinPieceItemBefore.length > 0) {
        const totalQty = joinPieceItemBefore.reduce(
          (sum, item) => sum + parseInt(item.qty),
          0
        );
        const totalAllDefectPoint = joinPieceItemBefore.reduce(
          (sum, item) =>
            sum +
            item.defect_item.reduce(
              (s, d) => s + (d.point ? parseInt(d.point, 10) : 0),
              0
            ),
          0
        );
  
        const LK = lebarKain[props.lebarKain];
        const nilaiPoin = (
          (totalAllDefectPoint * 3600) /
          (totalQty * LK)
        ).toFixed(1);
  
        let grade = 3;
        if (nilaiPoin <= 24) grade = 1;
        else if (nilaiPoin <= 30) grade = 2;

        console.log("zz",totalAllDefectPoint,totalQty);
        
  
        await Promise.all(
          joinPieceItemBefore.map((item) =>
            axiosInstance.put(`${url}/${item.id}`, {
              inspecting_id: item.inspecting_id,
              inspecting_item_id: item.id,
              qty: item.qty,
              grade,
              join_piece: item.join_piece,
              is_head: item.is_head,
              lot_no: item.lot_no,
              defect: item.defect_item,
              stock_id: item.stock_id,
              gsm_item: item.gsm_item,
              qty_bit: item.qty_bit,
            })
          )
        );
      }
  
      // 4. Hanya sekali!
      props.onSuccessEdit();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  // handle untuk mengubah value pada formData
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    //jika perubahan merupakan join piece maka setJoinPieceItemBefore
    if (name === "join_piece" && value !== result.join_piece) {
      const joinPieceItemBeforeChange  = props.inspectItem.filter(item => item.join_piece === result.join_piece && item.id !== result.id && item.join_piece !== null && item.join_piece !== '');
      setJoinPieceItemBefore(joinPieceItemBeforeChange);
    }else{
      setJoinPieceItemBefore([]);
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  //handle untuk menambah row baru untuk defect
  const handleAddDefect = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      defect: [
        ...prevFormData.defect,
        {
          meterage: "",
          mst_kode_defect_id: "",
          point: "",
        },
      ],
    }));
  };

  //handele untuk menghapus row defect
  const handleDeleteDefect = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      defect: prevFormData.defect.filter((_, i) => i !== index),
    }));
  };

  useEffect(() =>{
    if (formData.grade === "5" || formData.grade === 5) {
      // setFormData((prevFormData) => ({ ...prevFormData, defect: [] }));
      return;
    }

    // defect pada selected item 
    const defect  = formData.defect;
    //total point pada defect
    const totalPointAllDefect = defect.map((item) => parseInt(item.point)).reduce((a, b) => a + b, 0);
    // qty pada selected item
    const qty = parseInt(formData.qty);
    //lebar kain yang dimiliki item ini
    const LK = lebarKain[props.lebarKain];
    //cari item yang memiliki join piece sama
    const anotherItem = props.inspectItem.filter(item => item.join_piece === formData.join_piece && item.id !== result.id && item.join_piece !== null && item.join_piece !== '');
    // cari total point pada item lain yang memiliki join piece sama
    const anotherItemDefectPoint= anotherItem.map(item => item.defect_item).flat().map(item => parseInt(item.point)).reduce((a, b) => a + b, 0);
    //cari total qty pada item lain yang memiliki join piece sama
    const anotherItemQty = anotherItem.map(item => parseInt(item.qty)).reduce((a, b) => a + b, 0);

    //perhitungan poin = total point pada item ini + total point pada item lain yang memiliki join piece sama
    const totalPoin = totalPointAllDefect + anotherItemDefectPoint;

    //perhitungan qty = qty pada item ini + qty pada item lain yang memiliki join piece sama
    const totalQty = qty + anotherItemQty;

    //rumus = totalPoin x 3600 / totalQty x LK
    const r = ((totalPoin * 3600) / (totalQty * LK)).toFixed(1);

    let grade = 3;
    if (r <= 24) grade = 1;
    else if (r <= 30) grade = 2;

    console.log('nilai poin = ',r , 'grade = ',grade, 'another item = ',anotherItem);
    

    setFormData((prevFormData) => ({
      ...prevFormData,
      grade
    }))

    setJoinPieceItem(anotherItem);  
    // console.log('nilai poin = ',r , 'grade = ',grade, 'another item = ',anotherItem);  
    
    
  },[formData.qty, formData.defect, formData.join_piece]);
  
  // useEffect(() => {
  //   console.log('join piece item before = ',joinPieceItemBefore);
    
  // }, [joinPieceItemBefore]);

  return (
    <>
      <Modal
        show={true}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        className="bg-transparent"
        centered
      >
        <Card className="rounded">
          <Card.Header>
            <Stack
              direction="horizontal"
              gap={1}
              className="justify-content-between"
            >
              <Card.Title className="me-auto">{result.qty}</Card.Title>
              <Stack direction="horizontal" gap={1}>
                <Button
                  size="sm"
                  variant="warning"
                  className="text-danger"
                  onClick={() => props.onDelete(result.id)}
                >
                  <FaTrash /> <strong>Hapus</strong>
                </Button>
                <Button size="sm" variant="danger" onClick={props.closeModal}>
                  <FaTimes />
                </Button>
              </Stack>
            </Stack>
          </Card.Header>
          <Card.Body style={{ maxHeight: "700px", overflowY: "auto" }}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  defaultValue={formData?.qty}
                  className="border-bold"
                  name="qty"
                  onChange={handleChangeForm}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>GSM</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  defaultValue={formData?.gsm_item}
                  className="border-bold"
                  name="gsm_item"
                  onChange={handleChangeForm}
                  required
                />
              </Form.Group>
              <hr />
              <Row className="mb-3">
                <Form.Group as={Col} xs={4}>
                  <Form.Label>
                    <strong>Grade</strong>
                  </Form.Label>
                  <Form.Select
                    className="border-bold"
                    name="grade"
                    value={formData?.grade}
                    onChange={handleChangeForm}
                    required
                  >
                    <option value="7">A+</option>
                    <option value="8">A*</option>
                    <option value="2">B</option>
                    <option value="3">C</option>
                    <option value="4">PK</option>
                    <option value="5">Sample</option>
                    <option value="1">A</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} xs={3}>
                  <Form.Label>
                    <strong>Head</strong>
                  </Form.Label>
                  <Form.Select
                    className="border-bold"
                    name="is_head"
                    defaultValue={formData?.is_head}
                    onChange={handleChangeForm}
                    required
                  >
                    <option value={1}>Ya</option>
                    <option value={0}>Tidak</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} xs={4}>
                  <Form.Label>
                    <strong>Join</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="join_piece"
                    defaultValue={formData?.join_piece?.toUpperCase()}
                    className="border-bold"
                    onChange={(e) => {
                      const uppercasedValue = e.target.value.toUpperCase();
                      handleChangeForm({
                        target: { name: "join_piece", value: uppercasedValue },
                      });
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                  />
                </Form.Group>
                <Form.Group as={Col} xs={4}>
                  <Form.Label>
                    <strong>Lot</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lot_no"
                    defaultValue={formData?.lot_no}
                    className="border-bold"
                    onChange={handleChangeForm}
                  />
                </Form.Group>
                <Form.Group as={Col} xs={4}>
                  <Form.Label>
                    <strong>Bits</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="qty_bit"
                    defaultValue={formData?.qty_bit}
                    className="border-bold"
                    onChange={handleChangeForm}
                  />
                </Form.Group>
              </Row>
              <strong>Defect</strong>
              <Row className="mb-3">
                {formData.defect?.map((defect, defectIndex) => (
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defect: formData.defect.map((def, i) =>
                              i === defectIndex
                                ? {
                                    ...def,
                                    meterage: parseInt(e.target.value, 10) || 0,
                                  }
                                : def
                            ),
                          })
                        }
                        className="border-bold"
                      />
                    </Form.Group>
                    <Form.Group as={Col} xs={4}>
                      <CustomSelect
                        options={kodeDefectOption}
                        value={kodeDefectOption.find(
                          (option) =>
                            option.value === defect?.mst_kode_defect_id
                        )}
                        onChange={(e) => {
                          const updatedDefects = [...formData.defect];
                          updatedDefects[defectIndex] = {
                            ...updatedDefects[defectIndex],
                            mst_kode_defect_id: e.value,
                          };
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
                          value={defect?.point}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              defect: formData.defect.map((def, i) =>
                                i === defectIndex
                                  ? {
                                      ...def,
                                      point: parseInt(e.target.value, 10) || 0,
                                    }
                                  : def
                              ),
                            })
                          }
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
                {formData.grade !== 5 &&
                    <Button
                    className="w-100"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddDefect}
                  >
                    <FaPlus /> Tambah Defect
                  </Button>
                }

                </Col>
              </Row>

              <Button size="sm" type="submit" variant="success" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <FaSave />} Simpan
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Modal>
    </>
  );
};

export default InspectResultEdit;
