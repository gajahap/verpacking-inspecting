import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../axiosConfig";
import Bottom from "../Layouts/Bottom/Bottom";
import {
  Card,
  Container,
  Table,
  Row,
  Col,
  Form,
  Stack,
  Button,
  Modal,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingSpinner";
import { FaEdit } from "react-icons/fa";
import InspectResultEdit from "./InspectResultEdit";
import CustomSelect from "../../Components/CustomSelect";
import CustomAsyncSelect from "../../Components/CustomAsyncSelect";
import CustomAlert from "../../Components/CustomAlert";
import MessageModal from "../../Components/MessageModal";
import ConfirmModal from "../../Components/ConfirmModal";
import ErrorPage from "../../ErrorPage";
import InspectResultAdd from "./InspectResultAdd";
import { FiPrinter } from "react-icons/fi";
import { Link } from "react-router-dom";

const InspectingView = (props) => {
  const { idInspecting } = useParams();
  document.title = `Inspecting ${
    props.jenisProses.charAt(0).toUpperCase() + props.jenisProses.slice(1)
  } View : ${idInspecting}`;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectItem, setInspectItem] = useState([]);
  const [visibleCard, setVisibleCard] = useState({ id: null });
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inspectItemWillDeleted, setInspectItemWillDeleted] = useState(null);
  const [isError, setIsError] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [form, setForm] = useState({});

  const [showModal, setShowModal] = useState(false);

  const [woColorsOptions, setWoColorsOptions] = useState([]);

  const closeModal = () => setVisibleCard({ id: null });

  const units = {
    1: "Yard",
    2: "Meter",
    3: "Pcs",
    4: "Kilogram",
  };

  const jenisInspek = {
    1: "Fresh Order",
    2: "Re-Packing",
    3: "Hasil Perbaikan",
  };

  const jenisMakloon = {
    1: "Makloon Proses",
    2: "Makloon Finish",
    3: "Barang Jadi",
    4: "Fresh",
  };

  const statusKartuDyPr = {
    1: "DRAFT",
    2: "POSTED",
    3: "DELIVERED",
    4: "APPROVED",
    5: "INSPECTED",
    6: "GANTI_GREIGE",
    7: "GANTI_GREIGE_LINKED",
    8: "BATAL",
  };

  const statusKartuMkl = {
    1: "DRAFT",
    2: "POSTED",
    3: "DELIVERED",
    4: "BATAL",
  };

  const unitOptions = Object.keys(units).map((key) => ({
    value: key,
    label: units[key],
  }));

  const jenisInspekOptions = Object.keys(jenisInspek).map((key) => ({
    value: key,
    label: jenisInspek[key],
  }));

  const grades = {
    7: "A+",
    8: "A*",
    2: "B",
    3: "C",
    4: "PK",
    5: "Sample",
    1: "A",
  };

  const [alertMessage, setAlertMessage] = useState([
    {
      show: false,
      success: false,
      message: "",
    },
  ]);

  useEffect(() => {
    if (alertMessage.show) {
      const timer = setTimeout(() => {
        setAlertMessage((prev) => ({ ...prev, show: false })); // Hide the alert
      }, 3000);

      // Cleanup the timer when the component unmounts or alertMessage changes
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const fetchData = useCallback(async () => {
    try {
      if (props.jenisProses !== "mkl-bj") {
        const response = await axiosInstance.get(
          `inspecting/get-inspecting/${idInspecting}`
        );
        setData(response.data.data);
        setInspectItem(
          response.data.data.inspecting_item.sort((a, b) => a.no_urut - b.no_urut)
        );
        setForm((prevForm) => ({
          ...prevForm,
          inspecting_id: response.data.data.id,
          no_wo: response.data.data.wo.no,
          wo_id: response.data.data.wo.id,
          no_lot: response.data.data.no_lot,
          unit: response.data.data.unit,
          warna: response.data.data.kombinasi,
          mo_id: response.data.data.mo.id,
          sc_id: response.data.data.sc.id,
          sc_greige_id: response.data.data.sc_greige.id,
          kartu_proses_dyeing_id:
            response.data.data.kartu_process_dyeing_id || null,
          kartu_proses_printing_id:
            response.data.data.kartu_process_printing_id || null,
          wo_color_id:
            response.data.data.kartu_process_dyeing?.wo_color_id ||
            response.data.data.kartu_process_printing?.wo_color_id ||
            null,
          inspection_table: response.data.data.inspection_table,
          jenis_inspek: response.data.data.jenis_inspek,
          no_memo: response.data.data.no_memo
        }));
        setWoColorsOptions([
          { value: null, label: response.data.data.kombinasi },
        ]);
        console.log(response.data.data);
      } else {
        const response = await axiosInstance.get(
          `inspecting/get-inspecting-mkl-bj/${idInspecting}`
        );
        setData(response.data.data);
        setInspectItem(
          response.data.data.inspecting_mklbj_item.sort((a, b) => a.no_urut - b.no_urut)
        );
        setForm((prevForm) => ({
          ...prevForm,
          inspecting_id: response.data.data.id,
          no_wo: response.data.data.wo.no,
          wo_id: response.data.data.wo.id,
          no_lot: response.data.data.no_lot,
          unit: response.data.data.satuan,
          color: response.data.data.wo_color.mo_color.color,
          jenis_makloon: response.data.data.jenis,
          mo_color_id: response.data.data.wo_color_id,
          inspection_table: response.data.data.inspection_table,
          no_memo: response.data.data.no_memo
        }));
        setWoColorsOptions([
          {
            value: response.data.data.wo_color_id,
            label: response.data.data.wo_color.mo_color.color,
          },
        ]);
        console.log(response.data.data);
      }
    } catch (error) {
      setIsError(error.response?.status);
      // console.error(error);
    } finally {
      setLoading(false);
    }
  }, [idInspecting, props.jenisProses]); // Dependencies here

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("Update form: ", form);
  }, [form]);

  const onSuccessEdit = () => {
    setVisibleCard({ id: null });
    fetchData();
  };

  const onSuccessAdd = () => {
    setShowModalAdd(false);
    fetchData();
  };

  const handleCloseModal = () => {
    setModalMessage("");
  };

  const handleSubmitEditHeader = (e) => {
    e.preventDefault();
    const url =
      props.jenisProses === "mkl-bj"
        ? "inspecting/update-inspecting-mklbj"
        : "inspecting/update-inspecting";
    axiosInstance
      .put(`${url}/${idInspecting}`, form)
      .then((response) => {
        setAlertMessage({
          show: true,
          success: true,
          message: response.data.message,
        });
        console.log(response.data);
        fetchData();
      })
      .catch((error) => {
        setAlertMessage({
          show: true,
          success: false,
          message: "Tak dapat merubah data saat ini, coba beberapa saat lagi.",
        });
        console.log(error);
        console.log("payload request:", form);
      });
  };

  const fetchWoOptions = async (inputValue) => {
    try {
      const response = await axiosInstance.get("wo/search-wo", {
        params: {
          no: inputValue,
        },
      });
      console.clear();

      console.log(response.data);

      const woOptions = response.data.map((item) => ({
        value: item.id,
        label: item.no,
        warna: item.mo_colors,
        mo_id: item.mo_id,
        sc_id: item.sc_id,
        sc_greige_id: item.sc_greige_id,
      }));

      return woOptions;
    } catch (error) {
      console.error("Error fetching WO options:", error);
      return [];
    }
  };

  const handleWoChange = (selectedOption) => {
    if (selectedOption) {
      const { value, label, warna, mo_id, sc_id, sc_greige_id } =
        selectedOption;
      setForm((prevForm) => ({
        ...prevForm,
        wo_id: value,
        no_wo: label,
        mo_id: mo_id,
        sc_id: sc_id,
        sc_greige_id: sc_greige_id,
      }));
      console.log("warna yang di ambil :", warna);
      //map to woColorsOptions
      const woColorsOptions = warna.map((item) => ({
        value: item.wo_color_id,
        label: item.color,
      }));

      console.log();

      setWoColorsOptions(woColorsOptions);
    } else {
      // Handle clearing of the input field
      setForm((prevForm) => ({
        ...prevForm,
        wo_id: "",
        no_wo: "",
      }));
    }
  };

  const onDeleteInsepctItem = async (id) => {
    try {
      // const response = await axiosInstance.delete(`inspecting/delete-inspecting-item/${id}`);
      setInspectItemWillDeleted(id);
      setShowConfirmModal(true);
    } catch (error) {
      console.error("Error deleting inspect data item:", error);
    }
  };

  const handleFormConfirm = async (confirmed) => {
    setShowConfirmModal(false);
    if (confirmed) {
      try {
        await axiosInstance.delete(
          `inspecting/delete-inspecting-item/${inspectItemWillDeleted}`
        );
        closeModal();
        setModalMessage({ message: "Data berhasil dihapus.", status: 200 });
        await fetchData();
      } catch (error) {
        console.error("Error deleting inspect data item:", error);
      }
      setInspectItemWillDeleted(null);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorPage status={isError} />
      ) : (
        <>
          <Container fluid className="p-4">
            <Card className="mb-3 bg-burgundy-gradient bg-pattern-card py-3 px-4 text-white shadow">
              <h3 className="mb-0">
                {" "}
                {props.jenisProses.toUpperCase()} :{" "}
                {props.jenisProses === "dyeing"
                  ? data?.kartu_process_dyeing?.no || "-"
                  : data?.kartu_process_printing?.no || "-"}
              </h3>
            </Card>
            <Card className="p-2 shadow-sm">
              <Stack direction="horizontal" gap={2} className="p-2 ms-auto">
                {props.jenisProses !== "mkl-bj" && (
                  <Link
                    to={`/print/inspecting-kartu/${props.jenisProses}/${idInspecting}`}
                  >
                    <Button className="bg-success text-white" size="sm">
                      <FiPrinter />
                      Print Kartu Proses
                    </Button>
                  </Link>
                )}
                <Link
                  to={`/print/inspecting/${props.jenisProses}/${idInspecting}`}
                >
                  <Button className="bg-burgundy text-white" size="sm">
                    <FiPrinter />
                    Print Inspecting Kain
                  </Button>
                </Link>
                <Link to={`/print/fir/${props.jenisProses}/${idInspecting}`}>
                  <Button className="bg-info text-white" size="sm">
                    <FiPrinter />
                    Print Fabric Inspection Report{" "}
                  </Button>
                </Link>
                <Button
                  className="bg-burgundy-gradient text-white"
                  size="sm"
                  onClick={() => setShowModal(true)}
                >
                  <FaEdit /> Edit
                </Button>
              </Stack>
              <Row className="text-center">
                <Col lg={6} md={6} sm={6}>
                  <Table bordered responsive striped className="small-text m-0">
                    <tbody>
                      {props.jenisProses !== "mkl-bj" && (
                        <tr>
                          <td>
                            <strong>No. Kartu</strong>
                          </td>
                          <td>
                            {data?.kartu_process_dyeing?.no ||
                              data?.kartu_process_printing?.no ||
                              "-"}
                          </td>
                        </tr>
                      )}

                      <tr>
                        <td>
                          <strong>No. WO</strong>
                        </td>
                        <td>{data?.wo?.no || "-"}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>No. Batch</strong>
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={3}>
                            <div className="text-center w-100">
                              {data.no_lot || "-"}
                            </div>
                          </Stack>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Satuan</strong>
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={3}>
                            <div className="text-center w-100">
                              {units[data.unit || data.satuan] || "-"}
                            </div>
                          </Stack>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>No. Mesin</strong>
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={3}>
                            <div className="text-center w-100">
                              {data?.inspection_table || "-"}
                            </div>
                          </Stack>
                        </td>
                      </tr>
                      {props.jenisProses === "mkl-bj" && (
                        <tr>
                          <td>
                            <strong>Jenis Proses</strong>
                          </td>
                          <td>{jenisMakloon[data.jenis] || "-"}</td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <strong>Jenis Inspek</strong>
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={3}>
                            <div className="text-center w-100">
                              {data?.jenis_inspek === 1 ? "Fresh Order" : data?.jenis_inspek === 2 ? "Re-Packing" : "-"}
                            </div>
                          </Stack>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col lg={6} md={6} sm={6}>
                  <Table bordered responsive striped className="small-text m-0">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Warna</strong>
                        </td>
                        <td>
                          {data?.kombinasi || data?.wo_color?.mo_color?.color}
                        </td>
                      </tr>
                      {props.jenisProses !== "mkl-bj" && (
                        <tr>
                          <td>
                            <strong>Artikel</strong>
                          </td>
                          <td>{data?.mo?.article || "-"}</td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <strong>Tanggal Inspect</strong>
                        </td>
                        <td>
                          {new Date(
                            data.date || data.tgl_inspeksi
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }) || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Operator</strong>
                        </td>
                        <td>{data.created_by?.full_name || "-"}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Status</strong>
                        </td>
                        <td>
                          {props.jenisProses === "mkl-bj"
                            ? statusKartuMkl[data?.status] || "-"
                            : statusKartuDyPr[data?.status] || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>No Memo</strong>
                        </td>
                        <td>
                          {data?.no_memo}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card>

            <Card className="p-3 my-3 rounded-0 shadow-sm">
              <Table
                bordered
                responsive
                striped
                className="small-text text-center m-0"
              >
                <thead>
                  <tr>
                    <th className="bg-secondary text-white">#</th>
                    <th className="bg-secondary text-white">Qty</th>
                    <th className="bg-secondary text-white">Grade</th>
                    <th className="bg-secondary text-white">Defects</th>
                    <th className="bg-secondary text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectItem
                    ?.sort((a, b) => a.grade === 5 ? 1 : b.grade === 5 ? -1 : 0)
                    .map((result, index) => (
                      <React.Fragment key={index}>
                        <tr key={index}>
                          <td style={{ width: "10%" }}>
                            {index + 1}
                            {result.join_piece}
                          </td>
                          <td>{result.qty}</td>
                          <td>{grades[result.grade]}</td>
                          <td>
                            {result.defect_item.length > 0 ? (
                              result.defect_item.map((defect, defectIndex) => (
                                <span
                                  key={defectIndex}
                                  className={`d-block p-1 ${
                                    defectIndex === result.defect_item.length - 1
                                      ? ""
                                      : "border-bottom-bold"
                                  }`}
                                >
                                  {defect.meterage} /{" "}
                                  {defect.mst_kode_defect?.no_urut} /{" "}
                                  {defect.point}
                                </span>
                              ))
                            ) : (
                              <span className="text-danger">
                                <i>No Defect</i>
                              </span>
                            )}
                          </td>
                          <td>  
                            {data.status < (props.jenisProses === "mkl-bj" ? 3 : 4) && (
                              <Button
                                variant="warning"
                                className="text-white"
                                size="sm"
                                onClick={() =>
                                  setVisibleCard(
                                    visibleCard.id === result.id
                                      ? { id: null } // Jika tombol yang sama diklik, sembunyikan kartu
                                      : { id: result.id } // Tampilkan kartu untuk item.id dan index tertentu
                                  )
                                }
                              >
                                <FaEdit /> Edit
                              </Button>
                            )}
                          </td>
                        </tr>
                        {visibleCard.id === result.id && (
                          <InspectResultEdit
                            result={result}
                            jenisProses={props.jenisProses}
                            closeModal={closeModal}
                            onSuccessEdit={onSuccessEdit}
                            inspectingItemID
                            onDelete={onDeleteInsepctItem}
                          />
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>TOTAL</strong>
                    </td>
                    <td>
                      <strong>
                        {inspectItem?.reduce(
                          (total, result) =>
                            total + parseInt(result.qty || 0, 10),
                          0
                        )}
                      </strong>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
              <Stack className="my-2 d-flex justify-content-end">
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ width: "fit-content" }}
                  onClick={() => setShowModalAdd(true)}
                >
                  Tambah
                </Button>
              </Stack>
            </Card>
          </Container>
          <Bottom />
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Form onSubmit={handleSubmitEditHeader}>
              <Modal.Header className="bg-burgundy-gradient text-white d-flex justify-content-center">
                <Modal.Title>{data?.kartu_process_dyeing?.no}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {alertMessage.show && (
                  <CustomAlert
                    variants={[alertMessage.success ? "success" : "danger"]}
                    text={alertMessage.message}
                  />
                )}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>No. Wo</strong>
                  </Form.Label>
                  <CustomAsyncSelect
                    value={{
                      value: form.wo_id,
                      label: form.no_wo,
                    }}
                    loadOptions={fetchWoOptions}
                    onChange={handleWoChange}
                    placeholder="Pilih"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>No. Batch</strong>
                  </Form.Label>
                  <Form.Control
                    className="border-bold"
                    type="text"
                    placeholder="No Batch"
                    value={form.no_lot}
                    onChange={(e) =>
                      setForm({ ...form, no_lot: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>Satuan</strong>
                  </Form.Label>
                  <CustomSelect
                    options={unitOptions}
                    value={{
                      value: form.unit,
                      label: units[form.unit],
                    }}
                    onChange={({ value }) => setForm({ ...form, unit: value })}
                    placeholder="Pilih"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>No. Meja</strong>
                  </Form.Label>
                  <Form.Control
                    className="border-bold"
                    type="number"
                    placeholder="No Batch"
                    value={form.inspection_table}
                    onChange={(e) =>
                      setForm({ ...form, inspection_table: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>No. Memo</strong>
                  </Form.Label>
                  <Form.Control
                    className="border-bold"
                    type="text"
                    placeholder="No Memo"
                    value={form.no_memo}
                    onChange={(e) =>
                      setForm({ ...form, no_memo: e.target.value })
                    }
                  />
                </Form.Group>

                {props.jenisProses !== "mkl-bj" ? (
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="small-text">
                      <strong>Warna</strong>
                    </Form.Label>
                    <CustomSelect
                      options={woColorsOptions}
                      value={{
                        value: form.warna,
                        label: form.warna,
                      }}
                      onChange={({ value, label }) =>
                        setForm({ ...form, warna: label, mo_color_id: value })
                      }
                      placeholder="Pilih"
                    />
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="small-text">
                      <strong>Warna</strong>
                    </Form.Label>
                    <CustomSelect
                      options={woColorsOptions}
                      value={{
                        value: form.color,
                        label: form.color,
                      }}
                      onChange={({ value, label }) =>
                        setForm({ ...form, color: label, mo_color_id: value })
                      }
                      placeholder="Pilih"
                    />
                  </Form.Group>
                )}

                {props.jenisProses === "mkl-bj" && (
                  <Form.Group controlId="unit">
                    <Form.Label>
                      <strong>Jenis Makloon</strong>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={form.jenis_makloon || ""} // Fallback to an empty string
                      onChange={(e) =>
                        setForm({ ...form, jenis_makloon: e.target.value })
                      }
                      placeholder="Jenis Makloon"
                      className="border-bold"
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
                )}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small-text">
                    <strong>Jenis Inspeksi</strong>
                  </Form.Label>
                  <CustomSelect
                    options={jenisInspekOptions}
                    value={{
                      value: form.jenis_inspek,
                      label: jenisInspek[form.jenis_inspek],
                    }}
                    onChange={({ value }) => setForm({ ...form, jenis_inspek: value })}
                    placeholder="Pilih"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button type="submit" variant="success">
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
          <MessageModal
            show={modalMessage}
            onHide={handleCloseModal}
            status={modalMessage.status}
            title="Warning"
            message={modalMessage.message}
          />
          <ConfirmModal
            show={showConfirmModal}
            onHide={() => setShowConfirmModal(false)}
            onConfirm={handleFormConfirm}
            title="Konfirmasi"
          />
          {showModalAdd && (
            <InspectResultAdd
              closeModal={() => setShowModalAdd(false)}
              inspectingData={data}
              jenisProses={props.jenisProses}
              onSuccessAdd={onSuccessAdd}
            />
          )}
        </>
      )}
    </>
  );
};

export default InspectingView;
