import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosConfig";
import Bottom from "../Layouts/Bottom/Bottom";
import {
  Card,
  Button,
  Container,
  Stack,
  Form,
  Table,
  Badge,
  Row,
  Col,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaPlus, FaTimes, FaCheck, FaTrash, FaSave } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect";
import MessageModal from "../../Components/MessageModal";
import ConfirmModal from "../../Components/ConfirmModal";
import { useNavigate } from "react-router-dom";
const InspectingCreate = (props) => {
  document.title = `Inspecting ${
    props.jenisProses.charAt(0).toUpperCase() + props.jenisProses.slice(1)
  } Create `;
  const [nomorKartu, setNomorKartu] = useState("");
  const [data, setData] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isArrow, setIsArrow] = useState(false);
  const [formData, setFormData] = useState({
    no_lot: "",
    unit: "",
    inspection_table: "",
  });
  const [kartuProsesItem, setKartuProsesItem] = useState([]);
  const units = {
    1: "Yard",
    2: "Meter",
    3: "Pcs",
    4: "Kilogram",
  };
  const [inputVisibility, setInputVisibility] = useState({});
  const [inspectResult, setInspectResult] = useState({});
  const [visibleCard, setVisibleCard] = useState({ id: null, index: null });
  const [kodeDefectOption, setKodeDefectOption] = useState([]);
  const [isChooseOne, setIsChooseOne] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);

  const navigate = useNavigate();

  const handleCloseModal = () => {
    setModalMessage("");
  };

  const handleAddInspectResult = (e, itemId, stockId) => {
    e.preventDefault();

    const input = e.target.querySelector("input"); // Ambil input dari form
    const value = input.value.trim(); // Ambil nilai input dan hapus spasi berlebih

    if (value) {
      // Tambahkan nilai baru ke hasil inspeksi untuk item tertentu
      setInspectResult((prevState) => {
        const currentResults = prevState[itemId] || []; // Ambil data yang sudah ada untuk item
        return {
          ...prevState,
          [itemId]: [
            ...currentResults,
            {
              qty: parseInt(value, 10),
              grade: 7,
              no_urut: 0,
              join_piece: null,
              lot_no: null,
              defect: null,
              stock_id: stockId,
              qty_bit: null,
              gsm_item: null,
              time_add: Date.now() / 1000,
            },
          ], // Tambahkan nilai baru ke dalam array
        };
      });

      // Kosongkan input setelah submit
      input.value = "";
      handleUpdateNoUrut();
    }

    // Sembunyikan input setelah submit
    setInputVisibility((prevState) => ({
      ...prevState,
      [itemId]: false,
    }));
  };

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

  const handleUpdateInspectResult = (e, itemId, index) => {
    e.preventDefault();

    // Ambil semua input dari form
    const formData = new FormData(e.target);

    // Ambil nilai input dan hapus spasi berlebih
    const updatedData = {
      qty: parseInt(formData.get("qty").trim(), 10) || null,
      grade: parseInt(formData.get("grade").trim(), 10) || null,
      join_piece: formData.get("join_piece").trim().toUpperCase() || null,
      lot_no: formData.get("no_lot").trim() || null,
      gsm_item: formData.get("gsm_item").trim() || null,
    };

    // Validasi atau pastikan ada nilai qty (atau bisa tambah logika validasi lainnya)
    if (updatedData.qty) {
      // Update nilai yang sudah ada untuk item tertentu
      setInspectResult((prevState) => {
        const currentResults = prevState[itemId] || []; // Ambil data yang sudah ada untuk item
        const newResults = currentResults.map((item, i) => {
          if (i === index) {
            return { ...item, ...updatedData }; // Ganti nilai yang lama dengan nilai yang baru
          }
          return item; // Jika bukan item yang dipilih, maka biarkan saja
        });

        return {
          ...prevState,
          [itemId]: newResults,
        };
      });
    }

    // Reset state untuk menutup form atau memperbarui UI
    setVisibleCard({ id: null, index: null });
  };

  const handleDeleteInspectResult = (itemId, index) => {
    if (index === 0) {
      setInspectResult((prevState) => {
        const currentResults = prevState[itemId] || [];
        const qtyBits = currentResults[0]?.qty_bit;

        if (currentResults[1]) {
          currentResults[1].qty_bit = qtyBits;
        }

        return {
          ...prevState,
          [itemId]: currentResults,
        };
      });
    }

    setInspectResult((prevState) => {
      const currentResults = prevState[itemId] || []; // Ambil data yang sudah ada untuk item

      const newResults = currentResults.filter((_, i) => i !== index); // Hapus item yang dipilih

      if (newResults.length === 0) {
        const newInspectResult = { ...prevState }; // Salin objek saat ini
        delete newInspectResult[itemId]; // Hapus properti dengan nama itemId jika kosong
        return newInspectResult;
      } else {
        return {
          ...prevState,
          [itemId]: newResults, // Update array dengan item yang dipilih
        };
      }
    });

    setVisibleCard({ id: null, index: null });
    handleUpdateNoUrut();
  };

  useEffect(() => {
    getKodeDefectOption();
    console.log("INI INSPEK: ", inspectResult);
  }, [inspectResult]);

  const handleUpdateNoUrut = () => {
    setInspectResult((prevState) => {
      // Step 1: Gabungkan semua data jadi satu array
      const allResults = [];

      Object.entries(prevState).forEach(([itemId, results]) => {
        results.forEach((result, index) => {
          allResults.push({
            ...result,
            itemId,
            index, // simpan index awal untuk nanti kalau perlu
          });
        });
      });

      // Step 2: Urutkan berdasarkan time_add
      allResults.sort((a, b) => a.time_add - b.time_add);

      // Step 3: Tambahkan no_urut global
      allResults.forEach((result, index) => {
        result.no_urut = index + 1;
      });

      // Step 4: Kembalikan ke bentuk awal (per itemId)
      const updatedResults = {};

      allResults.forEach((result) => {
        const { itemId, ...rest } = result;
        if (!updatedResults[itemId]) {
          updatedResults[itemId] = [];
        }
        updatedResults[itemId].push(rest);
      });

      return updatedResults;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        props.jenisProses === "dyeing"
          ? "dashboard/get-kartu-dyeing"
          : "dashboard/get-kartu-printing";
      const paramName = props.jenisProses === "dyeing" ? "no" : "no";
      const response = await axiosInstance.get(endpoint, {
        params: {
          [paramName]: nomorKartu,
        },
      });
      setIsSearch(true);
      setData(
        response.data.data
          ? response.data.data.sort((a, b) => (a.no > b.no ? 1 : -1))
          : []
      ); // Ensure data is an array
      if (response.data.data.length === 1) {
        if (props.jenisProses === "dyeing") {
          setKartuProsesItem(
            (response.data.data[0]?.kartu_proses_dyeing_item || []).sort(
              (a, b) => a.tube - b.tube
            )
          );
        } else {
          setKartuProsesItem(
            (response.data.data[0]?.kartu_proses_printing_item || []).sort(
              (a, b) => a.tube - b.tube
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    if (data.length === 1) {
      setFormData({
        no_kartu: data[0]?.no || "",
        no_wo: data[0]?.wo?.no || "",
        warna: data[0]?.wo_color?.mo_color?.color || "",
        article: data[0]?.mo?.article || "",
      });
    } else {
      setFormData({
        no_kartu: "",
        no_wo: "",
        warna: "",
        article: "",
      });
    }
  }, [data]);

  const handleChoosOne = (item) => {
    setNomorKartu(item.no);
    setIsArrow(true);
    setIsChooseOne(true);
    window.scrollTo({
      top: 0,
    });
  };

  const handleChange = (e) => {
    setIsChooseOne(false);
    setNomorKartu(e.target.value);
    setIsArrow(false);
  };

  const handleStore = async () => {
    setIsSubmiting(true);
  
    try {
      // Validasi awal
      if (!formData.no_lot || !formData.unit || !formData.jenis_inspek) {
        return setModalMessage({
          message: "Nomor lot, satuan, dan jenis inspek tidak boleh kosong.",
          status: 422,
        });
      }
  
      if (Object.keys(inspectResult).length === 0) {
        return setModalMessage({
          message: "Hasil inspect tidak boleh kosong.",
          status: 422,
        });
      }
  
      const payload = {
        id: data[0]?.id,
        id_kartu: data[0]?.id,
        no_lot: formData.no_lot,
        unit: formData.unit,
        inspection_table: formData.inspection_table,
        inspect_result: inspectResult,
        jenis_inspek: formData.jenis_inspek
      };
  
      const url = props.jenisProses === "dyeing"
        ? "inspecting/store-inspecting"
        : "inspecting/store-printing-inspecting";
  
      const response = await axiosInstance.post(url, payload);
  
      // Log response untuk debug
      console.log("Server response:", response);
  
      const resData = response.data;
  
      if (response.status === 200 && resData?.data?.id) {
        setModalMessage({ message: "Data berhasil disimpan.", status: 200 });
  
        // Reset form
        setNomorKartu("");
        setInspectResult({});
        setIsChooseOne(false);
        setIsArrow(false);
        setVisibleCard({ id: null, index: null });
        setFormData({
          no_kartu: "",
          no_wo: "",
          warna: "",
          article: "",
          no_lot: "",
          unit: "",
        });
        setData([]);
        setKartuProsesItem([]);
  
        // Redirect
        const target = props.jenisProses === "dyeing"
          ? `/inspecting-dyeing/${resData.data.id}`
          : `/inspecting-printing/${resData.data.id}`;
        navigate(target);
      } else {
        setModalMessage({
          message: resData?.message || "Terjadi kesalahan saat menyimpan data.",
          status: response.status,
        });
      }
  
    } catch (error) {
      console.error("Store Error:", error);
  
      setModalMessage({
        message:
          error.response?.data?.message ||
          "Gagal menyimpan data. Silakan coba lagi.",
        status: error.response?.status || 500,
      });
  
      // Optional: kirim log payload ke log server jika perlu audit/debug
      console.log("Payload terkirim:", {
        id: data[0]?.id,
        no_lot: formData.no_lot,
        unit: formData.unit,
        inspection_table: formData.inspection_table,
        inspect_result: inspectResult,
      });
    } finally {
      setIsSubmiting(false);
    }
  };
  

  const handleToggleInput = (id) => {
    setInputVisibility((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle visibility
    }));
  };

  const handleAddDefect = (itemId, index) => {
    setInspectResult((prevState) => {
      // Salin state sebelumnya
      const updatedState = { ...prevState };

      // Pastikan itemId ada
      if (updatedState[itemId]) {
        // Pastikan 'defect' adalah array, jika null maka inisialisasi sebagai array kosong
        if (!updatedState[itemId][index].defect) {
          updatedState[itemId][index].defect = [];
        }

        // Tambahkan row baru ke dalam defect
        updatedState[itemId][index].defect.push({
          meter_defect: "",
          kode_defect: "",
          point: "",
        });
      }

      // Kembalikan state yang telah diperbarui
      return updatedState;
    });
  };

  const handleRemoveDefect = (itemId, index, defectIndex) => {
    setInspectResult((prevState) => {
      const currentResults = prevState[itemId][index].defect || []; // Ambil data yang sudah ada untuk item\

      const newResults = currentResults.filter((_, i) => i !== defectIndex); // Hapus item yang dipilih

      const updatedItem = {
        ...prevState[itemId][index],
        defect: newResults.length > 0 ? newResults : null,
      };
      return {
        ...prevState,
        [itemId]: [
          ...prevState[itemId].slice(0, index),
          updatedItem,
          ...prevState[itemId].slice(index + 1),
        ],
      };
    });
  };

  const handleChangeDefect = (
    e,
    itemId,
    index,
    defectIndex,
    namaAttrDefect
  ) => {
    const { name, value = undefined } = namaAttrDefect
      ? { name: namaAttrDefect, value: e.value }
      : e.target;

    setInspectResult((prevState) => {
      const currentResults = prevState[itemId][index].defect || []; // Ambil data yang sudah ada untuk item
      const newResults = currentResults.map((result, i) => {
        if (i === defectIndex) {
          return {
            ...result,
            [name]: value,
          };
        }
        return result;
      });
      const updatedItem = { ...prevState[itemId][index], defect: newResults };
      return {
        ...prevState,
        [itemId]: [
          ...prevState[itemId].slice(0, index),
          updatedItem,
          ...prevState[itemId].slice(index + 1),
        ],
      };
    });
  };

  const handleChangeBits = (e, itemId) => {
    e.preventDefault();
    const { value } = e.target;

    const intValue = parseInt(value, 10);

    setInspectResult((prevState) => {
      const updatedItem = {
        ...prevState[itemId][0], // Access child at index 0
        qty_bit: intValue, // Update bits to the specified value
      };
      return {
        ...prevState,
        [itemId]: [
          updatedItem,
          ...prevState[itemId].slice(1), // Keep the rest of the array unchanged
        ],
      };
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
      <Container fluid className="p-4" style={{ marginBottom: "8rem" }}>
        <Card className="mb-3 bg-burgundy-gradient bg-pattern-card py-3 px-4 text-white shadow">
          <h3 className="mb-0">{props.jenisProses.toUpperCase()}</h3>
        </Card>
        <Card className="p-2 shadow-sm">
          <Form className="w-100" onSubmit={handleSubmit}>
            <Stack direction="horizontal" gap={2}>
              <Form.Control
                type="search"
                value={nomorKartu}
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
                  <Badge
                    bg={
                      data.length > 1 || data.length === 0
                        ? "danger"
                        : "success"
                    }
                  >
                    {data.length > 1 ? (
                      `${data.length} Kartu Ditemukan`
                    ) : data.length === 1 ? (
                      <>
                        {" "}
                        1 kartu telah di pilih <FaCheck />
                      </>
                    ) : (
                      "Tidak ada kartu yang ditemukan"
                    )}
                  </Badge>
                </div>
                {data.length > 1 &&
                  data.map((item, index) => (
                    <div key={index} className="my-2">
                      <Button
                        onClick={() => handleChoosOne(item)}
                        variant="burgundy"
                      >
                        {item.no || "-"}
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
                    <td>
                      <strong>No. Kartu</strong>
                    </td>
                    <td>{formData.no_kartu || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>No. WO</strong>
                    </td>
                    <td>{formData.no_wo || "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col lg={6} md={6} sm={6}>
              <Table bordered responsive className="small-text m-0">
                <tbody>
                  <tr>
                    <td>
                      <strong>Warna</strong>
                    </td>
                    <td>{formData.warna || "-"}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Artikel</strong>
                    </td>
                    <td>{formData.article || "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card>

        {data.length === 1 && (
          <>
            <Card className="p-4 my-3 shadow-sm">
              <Form>
                <Stack
                  direction="horizontal"
                  gap={3}
                  className="justify-content-center"
                >
                  <Form.Control
                    type="hidden"
                    name="inspecting_id"
                    value={data[0].id}
                  ></Form.Control>
                  <Form.Group controlId="no_lot" className="w-50 small-text">
                    <Form.Label>
                      <strong>No. Lot</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="no_lot"
                      value={formData.no_lot || ""} // Fallback to an empty string
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          no_lot: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="No Lot"
                      className="small-text"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="unit" className="w-50 small-text">
                    <Form.Label>
                      <strong>Satuan</strong>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.unit || ""} // Fallback to an empty string
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      placeholder="Satuan"
                      className="small-text"
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
                  <Form.Group
                    controlId="inspection_table"
                    className="w-50 small-text"
                  >
                    <Form.Label>
                      <strong>No. Meja</strong>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="inspection_table"
                      value={formData.inspection_table || ""} // Fallback to an empty string
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inspection_table: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="No Meja"
                      className="small-text"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="jenis_inspek" className="w-50 small-text">
                    <Form.Label>
                      <strong>Jenis Inspeksi</strong>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.jenis_inspek || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, jenis_inspek: e.target.value })
                      }
                      className="small-text"
                      required
                    >
                      <option value="">Pilih Jenis Inspeksi</option>
                      <option value="1">Fresh Order</option>
                      <option value="2">Re-Inspect</option>
                    </Form.Control>
                  </Form.Group>

                </Stack>
              </Form>
            </Card>
            <Card className="p-3 shadow-sm rounded-0">
              <Table bordered responsive className="small-text">
                <thead>
                  <tr>
                    <th
                      className="text-center"
                      style={{ width: "40px" }}
                      rowSpan={2}
                    >
                      Tube
                    </th>
                    <th
                      className="text-center"
                      style={{ width: "40px" }}
                      rowSpan={2}
                    >
                      No
                    </th>
                    <th
                      style={{ width: "50px" }}
                      colSpan={3}
                      className="text-center"
                    >
                      Asal Greige
                    </th>
                    <th
                      className="text-center"
                      rowSpan={2}
                      style={{ minWidth: "400px" }}
                    >
                      HASIL INSPECT
                    </th>
                    <th rowSpan={2} style={{ width: "40px" }}>
                      BITS
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      PK
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      A
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      A*
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      A+
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      B
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      C
                    </th>
                    <th rowSpan={2} style={{ minWidth: "40px" }}>
                      TOTAL
                    </th>
                  </tr>
                  <tr>
                    <th style={{ width: "50px" }}>Tgl</th>
                    <th style={{ width: "50px" }}>Mc</th>
                    <th style={{ width: "50px" }}>M/YD</th>
                  </tr>
                </thead>
                <tbody>
                  {kartuProsesItem?.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        {item.tube === 1
                          ? "A"
                          : item.tube === 2
                          ? "B"
                          : item.tube}
                      </td>
                      <td>{index + 1}</td>
                      <td style={{ width: "50px" }}>{item.date}</td>
                      <td style={{ width: "50px" }}>{item.mesin}</td>
                      <td style={{ width: "50px" }}>{item.panjang_m}</td>
                      <td>
                        <Stack direction="horizontal" gap={1}>
                          {(inspectResult[item.id] || []).map(
                            (result, index) => (
                              <React.Fragment key={`${item.id}-${index}`}>
                                <div className="position-relative">
                                  <Button
                                    variant="burgundy"
                                    className="mx-1"
                                    onClick={() =>
                                      setVisibleCard(
                                        visibleCard.id === item.id &&
                                          visibleCard.index === index
                                          ? { id: null, index: null } // Jika tombol yang sama diklik, sembunyikan kartu
                                          : { id: item.id, index } // Tampilkan kartu untuk item.id dan index tertentu
                                      )
                                    }
                                  >
                                    {result.qty} ({result.no_urut})
                                  </Button>
                                  {visibleCard.id === item.id &&
                                    visibleCard.index === index && (
                                      <Modal
                                        show={
                                          visibleCard.id === item.id &&
                                          visibleCard.index === index
                                        }
                                        size="lg"
                                        aria-labelledby="contained-modal-title-vcenter"
                                        className="bg-transparent"
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
                                            <Stack
                                              direction="horizontal"
                                              gap={1}
                                              className="justify-content-between"
                                            >
                                              <Card.Title className="me-auto">
                                                {result.qty}
                                              </Card.Title>
                                              <Stack
                                                direction="horizontal"
                                                gap={1}
                                              >
                                                <Button
                                                  size="sm"
                                                  variant="warning"
                                                  className="text-danger"
                                                  onClick={() =>
                                                    handleDeleteInspectResult(
                                                      item.id,
                                                      index
                                                    )
                                                  }
                                                >
                                                  <FaTrash />{" "}
                                                  <strong>Hapus</strong>
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="danger"
                                                  onClick={() =>
                                                    setVisibleCard({
                                                      id: null,
                                                      index: null,
                                                    })
                                                  }
                                                >
                                                  <FaTimes />
                                                </Button>
                                              </Stack>
                                            </Stack>
                                          </Card.Header>
                                          <Card.Body
                                            style={{
                                              maxHeight: "700px",
                                              overflowY: "auto",
                                            }}
                                          >
                                            <Form
                                              onSubmit={(e) =>
                                                handleUpdateInspectResult(
                                                  e,
                                                  item.id,
                                                  index
                                                )
                                              }
                                            >
                                              <Form.Group className="mb-3">
                                                <Form.Control
                                                  type="number"
                                                  defaultValue={result.qty}
                                                  className="border-bold"
                                                  name="qty"
                                                />
                                              </Form.Group>
                                              <Form.Group className="mb-3">
                                                <Form.Label>
                                                  <strong>GSM</strong>
                                                </Form.Label>
                                                <Form.Control
                                                  type="number"
                                                  defaultValue={result.gsm_item}
                                                  className="border-bold"
                                                  name="gsm_item"
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
                                                    required
                                                    defaultValue={result.grade}
                                                  >
                                                    <option value={7}>
                                                      A+
                                                    </option>
                                                    <option value={8}>
                                                      A*
                                                    </option>
                                                    <option value={2}>B</option>
                                                    <option value={3}>C</option>
                                                    <option value={4}>
                                                      PK
                                                    </option>
                                                    <option value={5}>
                                                      Sample
                                                    </option>
                                                    <option value={1}>A</option>
                                                  </Form.Select>
                                                </Form.Group>
                                                <Form.Group as={Col} xs={4}>
                                                  <Form.Label>
                                                    <strong>Join</strong>
                                                  </Form.Label>
                                                  <Form.Control
                                                    type="text"
                                                    name="join_piece"
                                                    defaultValue={
                                                      result.join_piece
                                                    }
                                                    className="border-bold"
                                                    onChange={(e) =>
                                                      (e.target.value =
                                                        e.target.value.toUpperCase())
                                                    }
                                                  />
                                                </Form.Group>
                                                <Form.Group as={Col} xs={4}>
                                                  <Form.Label>
                                                    <strong>Lot</strong>
                                                  </Form.Label>
                                                  <Form.Control
                                                    type="text"
                                                    name="no_lot"
                                                    defaultValue={result.lot_no}
                                                    className="border-bold"
                                                  />
                                                </Form.Group>
                                              </Row>
                                              <strong>Defect</strong>
                                              <Row className="mb-3">
                                                {result?.defect?.map(
                                                  (defect, defectIndex) => (
                                                    <React.Fragment
                                                      key={defectIndex}
                                                    >
                                                      {defectIndex === 0 && (
                                                        <>
                                                          <Form.Group
                                                            as={Col}
                                                            xs={4}
                                                          >
                                                            <Form.Label>
                                                              Meter
                                                            </Form.Label>
                                                          </Form.Group>
                                                          <Form.Group
                                                            as={Col}
                                                            xs={4}
                                                          >
                                                            <Form.Label>
                                                              Kode
                                                            </Form.Label>
                                                          </Form.Group>
                                                          <Form.Group
                                                            as={Col}
                                                            xs={4}
                                                          >
                                                            <Form.Label>
                                                              Point
                                                            </Form.Label>
                                                          </Form.Group>
                                                        </>
                                                      )}
                                                      <Form.Group
                                                        as={Col}
                                                        xs={4}
                                                        className="mb-3"
                                                      >
                                                        <Form.Control
                                                          type="text"
                                                          name="meter_defect"
                                                          value={
                                                            defect?.meter_defect
                                                          }
                                                          className="border-bold"
                                                          onChange={(e) =>
                                                            handleChangeDefect(
                                                              e,
                                                              item.id,
                                                              index,
                                                              defectIndex
                                                            )
                                                          }
                                                        />
                                                      </Form.Group>
                                                      <Form.Group
                                                        as={Col}
                                                        xs={4}
                                                      >
                                                        <CustomSelect
                                                          options={
                                                            kodeDefectOption
                                                          }
                                                          value={kodeDefectOption.find(
                                                            (option) =>
                                                              option.value ===
                                                              defect?.kode_defect
                                                          )}
                                                          onChange={(e) =>
                                                            handleChangeDefect(
                                                              e,
                                                              item.id,
                                                              index,
                                                              defectIndex,
                                                              "kode_defect"
                                                            )
                                                          }
                                                          placeholder="Pilih"
                                                        />
                                                      </Form.Group>

                                                      <Form.Group
                                                        as={Col}
                                                        xs={4}
                                                      >
                                                        <Stack
                                                          gap={2}
                                                          direction="horizontal"
                                                        >
                                                          <Form.Control
                                                            type="number"
                                                            name="point"
                                                            value={
                                                              defect?.point
                                                            }
                                                            className="border-bold no-spinner"
                                                            onChange={(e) =>
                                                              handleChangeDefect(
                                                                e,
                                                                item.id,
                                                                index,
                                                                defectIndex
                                                              )
                                                            }
                                                          />
                                                          <Button
                                                            variant="danger"
                                                            onClick={() =>
                                                              handleRemoveDefect(
                                                                item.id,
                                                                index,
                                                                defectIndex
                                                              )
                                                            }
                                                          >
                                                            <FaTrash />
                                                          </Button>
                                                        </Stack>
                                                      </Form.Group>
                                                    </React.Fragment>
                                                  )
                                                )}
                                                <Col className="pt-2">
                                                  <Button
                                                    className="w-100"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleAddDefect(
                                                        item.id,
                                                        index
                                                      )
                                                    }
                                                  >
                                                    <FaPlus /> Tambah Defect
                                                  </Button>
                                                </Col>
                                              </Row>

                                              <Button
                                                size="sm"
                                                type="submit"
                                                variant="success"
                                              >
                                                <FaSave /> Simpan
                                              </Button>
                                            </Form>
                                          </Card.Body>
                                        </Card>
                                      </Modal>
                                    )}
                                </div>
                              </React.Fragment>
                            )
                          )}

                          {inputVisibility[item.id] && (
                            <Form
                              className="d-flex flex-row"
                              onSubmit={(e) =>
                                handleAddInspectResult(
                                  e,
                                  item.id,
                                  item.stock_id
                                )
                              }
                            >
                              <Form.Control
                                type="number"
                                placeholder="..."
                                className="mx-1 no-spinner"
                                style={{ width: "60px" }}
                              />
                              <Button
                                type="submit"
                                variant="success"
                                className="mx-1"
                              >
                                <FaCheck />
                              </Button>
                            </Form>
                          )}
                          <Button
                            variant={
                              inputVisibility[item.id] ? "danger" : "warning"
                            }
                            className="text-white mx-1"
                            onClick={() => handleToggleInput(item.id)}
                          >
                            {inputVisibility[item.id] ? (
                              <FaTimes />
                            ) : (
                              <FaPlus />
                            )}
                          </Button>
                        </Stack>
                      </td>
                      <td style={{ minWidth: "70px" }}>
                        {inspectResult[item.id] && (
                          <Form.Group
                            controlId="qty_bit"
                            className="small-text"
                          >
                            <Form.Control
                              type="number"
                              name="qty_bit" // Fallback to an empty string
                              defaultValue={
                                inspectResult[item.id][0]?.qty_bit || 0
                              }
                              onChange={(e) => handleChangeBits(e, item.id)}
                              className="small-text border-bold"
                              required
                            />
                          </Form.Group>
                        )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 4 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 1 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 8 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 7 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 2 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              result.grade === 3 ? total + result.qty : total,
                            0
                          )}
                      </td>
                      <td>
                        {inspectResult[item.id] &&
                          inspectResult[item.id].reduce(
                            (total, result) =>
                              total +
                              (result.qty_bit ? result.qty_bit : 0) +
                              result.qty,
                            0
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-center fw-bold">
                      Total
                    </td>
                    <td></td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                total2 + (result.qty_bit ? result.qty_bit : 0),
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 4
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 1
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 8
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 7
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 2
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                result.grade === 3
                                  ? total2 + result.qty
                                  : total2,
                              0
                            ),
                          0
                        )}
                    </td>
                    <td className="fw-bold">
                      {inspectResult &&
                        Object.values(inspectResult).reduce(
                          (total, item) =>
                            total +
                            item.reduce(
                              (total2, result) =>
                                total2 +
                                (result.qty_bit ? result.qty_bit : 0) +
                                result.qty,
                              0
                            ),
                          0
                        )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={11}></td>
                    <td>
                      <strong>Susut</strong>
                    </td>
                    <td className="fw-bold">
                      {formData.unit && formData.unit === "1"
                        ? (
                            ((kartuProsesItem.reduce(
                              (total, item) => total + item.panjang_m,
                              0
                            ) -
                              (inspectResult
                                ? Object.values(inspectResult).reduce(
                                    (total, item) =>
                                      total +
                                      item.reduce(
                                        (total2, result) =>
                                          total2 +
                                          (result.qty_bit
                                            ? result.qty_bit
                                            : 0) +
                                          result.qty,
                                        0
                                      ),
                                    0
                                  )
                                : 0)) /
                              kartuProsesItem.reduce(
                                (total, item) => total + item.panjang_m,
                                0
                              )) *
                            100
                          ).toFixed(2) + "%"
                        : null}

                      {formData.unit && formData.unit === "2"
                        ? (
                            ((kartuProsesItem.reduce(
                              (total, item) => total + item.panjang_m,
                              0
                            ) /
                              0.9144 -
                              (inspectResult
                                ? Object.values(inspectResult).reduce(
                                    (total, item) =>
                                      total +
                                      item.reduce(
                                        (total2, result) =>
                                          total2 +
                                          (result.qty_bit
                                            ? result.qty_bit
                                            : 0) +
                                          result.qty,
                                        0
                                      ),
                                    0
                                  )
                                : 0)) /
                              (kartuProsesItem.reduce(
                                (total, item) => total + item.panjang_m,
                                0
                              ) /
                                0.9144)) *
                            100
                          ).toFixed(2) + "%"
                        : null}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Card>
            <Container fluid className="mt-4">
              <Button
                variant="burgundy"
                className="w-100"
                onClick={() => setShowConfirmModal(true)}
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
        title="Warning"
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
