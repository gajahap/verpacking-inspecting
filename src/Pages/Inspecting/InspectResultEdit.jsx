import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import { Card, Button, Stack, Form, Row, Col, Modal } from "react-bootstrap";
import { FaPlus, FaTimes, FaTrash, FaSave } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect";
const InspectResultEdit = (props) => {
  const [kodeDefectOption, setKodeDefectOption] = useState([]);
  const result = props.result;

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
  });

  useEffect(() => {
    console.clear();
    console.log(props.result);
  }, [props]);

  const getKodeDefectOption = async () => {
    try {
      const response = await axiosInstance.get(
        "master-defect/get-master-defect"
      );
      const options = response.data.data.map((defect) => ({
        value: defect.id,
        label: `${defect.no_urut} - ${defect.nama_defect}`,
      }));
      setKodeDefectOption(options);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getKodeDefectOption();
    console.log(formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url =
        props.jenisProses === "mkl-bj"
          ? "inspecting/update-inspecting-mklbj/item"
          : "inspecting/get-inspecting/update";
      const response = await axiosInstance.put(`${url}/${result.id}`, formData);
      console.log("payload request:", formData);
      console.log(response.data);
      props.onSuccessEdit();
    } catch (error) {
      console.error(error);
      console.log("payload request:", formData);
    }
  };

  // handle untuk mengubah value pada formData
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
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
    console.log(formData);
  };

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
                    defaultValue={formData?.grade}
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
                  <Button
                    className="w-100"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddDefect}
                  >
                    <FaPlus /> Tambah Defect
                  </Button>
                </Col>
              </Row>

              <Button size="sm" type="submit" variant="success">
                <FaSave /> Simpan
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Modal>
    </>
  );
};

export default InspectResultEdit;
