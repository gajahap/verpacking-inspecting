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
import { FaPlus, FaTimes, FaCheck, FaTrash, FaSave, FaEdit } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect";
import MessageModal from "../../Components/MessageModal";
import ConfirmModal from "../../Components/ConfirmModal";
import CustomAlert from "../../Components/CustomAlert";
import { useNavigate } from "react-router-dom";
import { showConfirm } from "../../Components/ConfirmToast";
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

  const [inputVisibility, setInputVisibility] = useState({});
  const [inspectResult, setInspectResult] = useState({});
  const [visibleCard, setVisibleCard] = useState({ id: null, index: null });
  const [kodeDefectOption, setKodeDefectOption] = useState([]);
  const [isChooseOne, setIsChooseOne] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [gsm, setGsm] = useState(0);
  const [showEditNoWoModal, setShowEditNoWoModal] = useState(false);
  const [noWoToSearch, setNoWoToSearch] = useState('');
  const [woOptions, setWoOptions] = useState([]);
  const [newSelectedWo, setNewSelectedWo] = useState(null);
  const [isCanCallPrevInput, setIsCanCallPrevInput] = useState(false);
  const [alertMessage, setAlertMessage] = useState([
    {
      show: false,
      success: false,
      message: "",
    },
  ]);
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setModalMessage("");
  };

  const handleAddInspectResult = (e, itemId, stockId, inches) => {
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
              grade: 1,
              no_urut: 0,
              join_piece: '',
              lot_no: '',
              defect: [],
              stock_id: stockId,
              inches: lebarKain[inches],
              qty_bit: '',
              gsm_item: gsm,
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
      qty: parseInt(formData.get("qty").trim(), 10) || '',
      grade: parseInt(formData.get("grade").trim(), 10) || '',
      join_piece: formData.get("join_piece").trim().toUpperCase() || '',
      lot_no: formData.get("lot_no").trim() || '',
      gsm_item: formData.get("gsm_item").trim() || gsm
    };
    
    if (formData.get("gsm_item").trim() !== gsm) {
      setGsm(formData.get("gsm_item").trim());
    }

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

    // Cek apakah dimasing masing inspectResult ada defect yang masih kosong
    const inspectResultsWithEmptyDefect = inspectResult[itemId].filter(
      (item) =>
        item.defect?.some((defect) => defect.kode_defect === '' || defect.meter_defect === '' || defect.point === '')
    );
    // console.log("inspectResultsWithEmptyDefect", inspectResultsWithEmptyDefect);
    
    if (inspectResultsWithEmptyDefect.length > 0) {
      alert(
        "Ada inspect result yang masih memiliki defect yang kosong. Silakan periksa kembali!"
      );
      return;
    }
    // Reset state untuk menutup form atau memperbarui UI
    setVisibleCard({ id: null, index: null });
    handleUpdateNoUrut();
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
    // console.log("INI INSPEK: ", inspectResult);
  }, [inspectResult]);

  const handleUpdateNoUrut = () => {
    setInspectResult((prevState) => {
      const allResults = [];
  
      // Step 1: Gabungkan semua data jadi satu array
      Object.entries(prevState).forEach(([itemId, results]) => {
        results.forEach((result) => {
          allResults.push({
            ...result,
            itemId,
          });
        });
      });
  
      // Step 2: Urutkan berdasarkan time_add
      allResults.sort((a, b) => a.time_add - b.time_add);
  
      // Step 3: Hitung dan tambahkan no_urut hanya untuk yang grade !== 5
      let globalIndex = 1;
      allResults.forEach((result) => {
        if (result.grade !== 5) {
          result.no_urut = globalIndex++;
        } else {
          // Hapus no_urut jika ada, supaya tidak salah
          delete result.no_urut;
        }
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
    if (e) e.preventDefault();
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
          // cek apakah ada data input sebelumnya yang no kartunya sama di local storage
          const dataKartuProsesItem = localStorage.getItem("formData");
          const dataKartuProsesItemJson = JSON.parse(dataKartuProsesItem);

          if (dataKartuProsesItemJson && dataKartuProsesItemJson.no_kartu === response.data.data[0]?.no) {
            setIsCanCallPrevInput(true);
          }else {
            setIsCanCallPrevInput(false);
          }
          
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

    // Simpan data ke localstorage (sebelum validasi dan request)
    localStorage.setItem("inspectResult", JSON.stringify(inspectResult));
    localStorage.setItem("formData", JSON.stringify(formData));
    
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
            jenis_inspek: formData.jenis_inspek,
            no_memo: formData.no_memo,
            note: formData.note
        };

        const url = props.jenisProses === "dyeing"
            ? "inspecting/store-inspecting"
            : "inspecting/store-printing-inspecting";

        const response = await axiosInstance.post(url, payload);

        const resData = response.data;

        if (response.status === 200 && resData?.data?.id) {
            // setModalMessage({ message: "Data berhasil disimpan.", status: 200 });

            // Reset form dan state
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
                // Pastikan semua field yang ingin di-reset ada di sini
                jenis_inspek: "", // Jika ini perlu di-reset
                inspection_table: "", // Jika ini perlu di-reset
            });
            setData([]);
            setKartuProsesItem([]);

            // Hapus localstorage jika sudah berhasil
            localStorage.removeItem("inspectResult");
            localStorage.removeItem("formData");

            // Redirect
            await showConfirm("Data berhasil disimpan. mohon jangan klik tombol simpan berulang-ulang, karena jika berhasil anda akan langsung diarahkan ke halaman detail.", { useCancelButton: false, confirmText : 'OK' });
            const target = props.jenisProses === "dyeing"
                ? `/inspecting-dyeing/${resData.data.id}`
                : `/inspecting-printing/${resData.data.id}`;
            navigate(target);
        } else {
            // Walaupun status 200, jika tidak ada ID, anggap sebagai kegagalan logis
            setModalMessage({
                message: resData?.message || "Data gagal disimpan, server tidak memberikan ID yang valid.",
                status: response.status,
            });
        }

    } catch (error) {
        console.error("Store Error:", error);

        // --- Logika Penanganan Exception yang Diperbaiki ---
        let errorMessage = "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
        let errorStatus = 500;
        
        if (error.response) {
            // 1. Kesalahan Respons Server (e.g., 400 Bad Request, 404 Not Found, 500 Internal Server Error)
            // Axios menerima respons dari server, tetapi respons tersebut adalah kode error (>= 400).
            errorMessage = error.response.data?.message || `Kesalahan dari server: Status ${error.response.status}.`;
            errorStatus = error.response.status;
        } else if (error.request) {
            // 2. Tidak Ada Respons (Masalah Jaringan/Timeout)
            // Permintaan dikirim, tetapi server tidak merespons (e.g., koneksi terputus, timeout).
            errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda atau coba lagi.";
            errorStatus = 503; // Service Unavailable
        } else {
            // 3. Kesalahan Lain
            // Kesalahan saat mengatur permintaan (e.g., error di kode frontend yang tidak terkait network).
            errorMessage = error.message || "Kesalahan klien/aplikasi. Periksa konfigurasi.";
            errorStatus = 500;
        }

        setModalMessage({
            message: errorMessage,
            status: errorStatus,
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
          meter_defect: '',
          kode_defect: '',
          point: ''
        });
      }

      // Kembalikan state yang telah diperbarui
      return updatedState;
    });
  };


  const gradingValidation = (newResults, prevState, itemId, index) => {
    const currentPrev = prevState[itemId][index];
  
    const newPrevStateWithFilteredItems = {};
  
    // Cari semua item yang join_piece sama
    for (const key in prevState) {
      const filtered = prevState[key].filter(item =>
        item.join_piece === currentPrev.join_piece &&
        currentPrev.join_piece !== null && 
        currentPrev.join_piece !== '' &&
        item.no_urut !== currentPrev.no_urut
      );
  
      if (filtered.length > 0) {
        newPrevStateWithFilteredItems[key] = filtered;
      }
    }
  
    // Gabungkan defect milik item lain + item yang sedang diedit
    const allOtherDefects = Object.values(newPrevStateWithFilteredItems)
      .flat()
      .map(item => item.defect ?? []);
  
    const combinedItems = [...allOtherDefects, newResults];
  
    const totalPoin = combinedItems
      .flat()
      .reduce((total, d) => total + (d.point ? parseInt(d.point, 10) : 0), 0);
  
    const totalQty =
      parseInt(currentPrev.qty, 10) +
      Object.values(newPrevStateWithFilteredItems)
        .flat()
        .reduce((total, item) => total + parseInt(item.qty, 10), 0);
  
    const a = totalPoin * 3600;
    const b = totalQty * lebarKain[data[0].sc_greige.lebar_kain];
    const nilaiPoin = parseFloat((a / b).toFixed(1));
  
    let grade = 3;
    if (nilaiPoin <= 24) grade = 1;
    else if (nilaiPoin <= 30) grade = 2;
  
    return { nilaiPoin, grade, newPrevStateWithFilteredItems };
  };

  const handleRemoveDefect = (itemId, index, defectIndex) => {
    setInspectResult(prevState => {
      const currentItem = prevState[itemId][index];
  
      // Hapus defect secara immutable
      const updatedDefects = currentItem.defect.filter((_, i) => i !== defectIndex);
  
      // Hitung grade terbaru
      const gradeResult = gradingValidation(updatedDefects, prevState, itemId, index);
      // console.log("grading", gradeResult);
  
      // Update item utama
      const updatedItem = {
        ...currentItem,
        defect: updatedDefects.length > 0 ? updatedDefects : null,
        grade: gradeResult.grade,
      };
  
      // SALIN prevState secara aman
      const newState = structuredClone(prevState);
  
      // Update item utama
      newState[itemId][index] = updatedItem;
  
      // Update item lain yang join_piece sama
      if (gradeResult.newPrevStateWithFilteredItems) {
        Object.entries(gradeResult.newPrevStateWithFilteredItems).forEach(
          ([key, arr]) => {
            arr.forEach(item => {
              const idx = newState[key].findIndex(x => x.no_urut === item.no_urut);
              if (idx !== -1) {
                newState[key][idx] = {
                  ...newState[key][idx],
                  grade: gradeResult.grade
                };
              }
            });
          }
        );
      }
  
      return newState;
    });
  };
  

  const handleChangeDefect = (e, itemId, index, defectIndex, namaAttrDefect) => {
    const { name, value = undefined } = namaAttrDefect
      ? { name: namaAttrDefect, value: e.value }
      : e.target;
  
    setInspectResult(prevState => {
      const currentItem = prevState[itemId][index];
  
      // Update defect array secara immutable
      const updatedDefects = currentItem.defect.map((d, i) =>
        i === defectIndex ? { ...d, [name]: value } : d
      );
  
      // Hitung grade terbaru
      const gradeResult = gradingValidation(updatedDefects, prevState, itemId, index);
      console.log("grading", gradeResult);
      
  
      // Update item utama
      const updatedItem = {
        ...currentItem,
        defect: updatedDefects,
        grade: gradeResult.grade
      };
  
      // SALIN prevState secara aman
      const newState = structuredClone(prevState);
  
      // Update item utama ke newState
      newState[itemId][index] = updatedItem;
  
      // Update item-item lain yang join_piece sama
      if (gradeResult.newPrevStateWithFilteredItems) {
        Object.entries(gradeResult.newPrevStateWithFilteredItems).forEach(
          ([key, arr]) => {
            arr.forEach(item => {
              const idx = newState[key].findIndex(x => x.no_urut === item.no_urut);
              if (idx !== -1) {
                newState[key][idx] = {
                  ...newState[key][idx],
                  grade: gradeResult.grade
                };
              }
            });
          }
        );
      }
  
      return newState;
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

    const handleCariNoWo = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.get('wo/search-wo', {
                params: {
                    no: noWoToSearch,
                },
            });
            // console.log('Data Wo',response.data);
            setWoOptions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGantiWo = async (wo) => {
        try {
            const response = await axiosInstance.put(`wo/ganti-wo/${data[0].id}`, {
              kartu_proses_id: newSelectedWo.kartu_proses_id,
              mo_id: newSelectedWo.mo_id,
              sc_greige_id: newSelectedWo.sc_greige_id,
              sc_id: newSelectedWo.sc_id,
              wo_color_id: newSelectedWo.wo_color_id,
              wo_id: newSelectedWo.wo_id
            });
            // console.log(response);
            setAlertMessage({
              show: true,
              success: true,
              message: response.data.message,
            });
            setNewSelectedWo(null);
        } catch (error) {
            console.error(error);
        }finally {
          // console.log('payload', newSelectedWo);
          handleSubmit();
        }
    };

    //fungsi untuk handle call back prev input
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

    // useEffect(() => {
    //   // console.log('inspectResult', inspectResult);
      
    // }, [inspectResult]);
    useEffect(() => {
      if (alertMessage.show) {
        const timer = setTimeout(() => {
          setAlertMessage((prev) => ({ ...prev, show: false })); // Hide the alert
          setShowEditNoWoModal(false)
        }, 3000);
  
        // Cleanup the timer when the component unmounts or alertMessage changes
        return () => clearTimeout(timer);
      }
    }, [alertMessage]);


    const handleChangeGrade = (e, itemId,index) => {
      e.preventDefault();
      const { value } = e.target;
  
      const intValue = parseInt(value, 10);
  
      setInspectResult((prevState) => {
        const updatedItem = {
          ...prevState[itemId][index], // Access child at index
          grade: intValue, // Update bits to the specified value
        };
        return {
          ...prevState,
          [itemId]: prevState[itemId].map((item, i) => i === index ? updatedItem : item),
        };
      });
    };


    const handleChangeValueInspectResult = (e, itemId, index) => {
      const { name, value } = e.target;
    
      setInspectResult(prevState => {
        // CLONE prevState (safe)
        const newState = (typeof structuredClone === "function")
          ? structuredClone(prevState)
          : JSON.parse(JSON.stringify(prevState));
    
        const currentItem = newState[itemId][index];
    
        // SIMPAN join_piece lama & baru
        const isJoinPieceChange = name === "join_piece";
        const oldJoinPiece = prevState[itemId][index].join_piece;
        const newJoinPiece = isJoinPieceChange ? value.toUpperCase() : oldJoinPiece;
    
        // === STEP 1: UPDATE ITEM UTAMA ===
        currentItem[name] = isJoinPieceChange ? newJoinPiece : value;
    
        // Pastikan defect array tetap dipakai yg terbaru
        const updatedDefects = currentItem.defect || [];
    
        // === STEP 2: Jika join_piece berubah → REGRADE KELOMPOK LAMA ===
        if (isJoinPieceChange && oldJoinPiece !== null) {
          // Cari kelompok lama yang join_piecenya sama
          const oldGroup = [];
          for (const key in prevState) {
            prevState[key].forEach(item => {
              if (item.join_piece === oldJoinPiece) {
                oldGroup.push({ key, no_urut: item.no_urut });
              }
            });
          }
    
          // Regrade setiap item dalam kelompok lama
          oldGroup.forEach(({ key, no_urut }) => {
            const idx = newState[key].findIndex(x => x.no_urut === no_urut);
            if (idx !== -1) {
              const item = newState[key][idx];
              const g = gradingValidation(item.defect || [], newState, key, idx);
              newState[key][idx].grade = g.grade;
            }
          });
        }
    
        // === STEP 3: Hitung grade item utama & kelompok baru ===
        const gradeResult = gradingValidation(updatedDefects, newState, itemId, index);
        currentItem.grade = gradeResult.grade;

        console.log('grading',gradeResult);
        
    
        // === STEP 4: Update item yang join_piece sama (kelompok baru) ===
        if (gradeResult.newPrevStateWithFilteredItems) {
          Object.entries(gradeResult.newPrevStateWithFilteredItems).forEach(
            ([key, arr]) => {
              arr.forEach(item => {
                const idx = newState[key].findIndex(x => x.no_urut === item.no_urut);
                if (idx !== -1) {
                  newState[key][idx] = {
                    ...newState[key][idx],
                    grade: gradeResult.grade
                  };
                }
              });
            }
          );
        }
    
        return newState;
      });
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
                <div className="my-2 d-flex  gap-2">
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
                    <td>{formData.no_wo || "-"} {formData?.no_wo && <FaEdit size={20} style={{marginLeft: "10px"}} onClick={() => setShowEditNoWoModal(true)} />}</td>
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
                <Row>
                  <Col lg={3} md={4} sm={6} className="mb-3">
                    <Form.Group controlId="no_lot" className="small-text">
                      <Form.Label>
                        <strong>No. Batch</strong>
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
                        placeholder="No. Batch"
                        className="small-text"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={3} md={4} sm={6} className="mb-3">
                    <Form.Group controlId="unit" className="small-text">
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
                  </Col>
                  <Col lg={3} md={4} sm={6} className="mb-3">
                    <Form.Group controlId="inspection_table" className="small-text">
                      <Form.Label>
                        <strong>No. Mesin</strong>
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
                        placeholder="No Mesin"
                        className="small-text"
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
                        className="small-text"
                        required
                      >
                        <option value="">Pilih Jenis Inspeksi</option>
                        <option value="1">Fresh Order</option>
                        <option value="2">Re-Packing</option>
                        <option value="3">Hasil Perbaikan</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col lg={4} md={4} sm={4} className="mb-3">
                    <Form.Group controlId="note" className="small-text">
                      <Form.Label>
                        <strong>Keterangan</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="note"
                        value={formData.note || ""} // Fallback to an empty string
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                        className="small-text"
                      />
                    </Form.Group>
                  </Col>
                  {formData.jenis_inspek === "2" && (
                    <Col lg={3} md={4} sm={6} className="mb-3">
                      <Form.Group controlId="no_memo" className="small-text">
                        <Form.Label>
                          <strong>No. Memo</strong>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="no_memo"
                          value={formData.no_memo || ""} // Fallback to an empty string
                          onChange={(e) =>
                            setFormData({ ...formData, no_memo: e.target.value.toUpperCase() })
                          }
                          placeholder="No Memo"
                          className="small-text"
                          required
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>
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
                                    {result.qty} {result.no_urut ? `(${result.no_urut})` : ''} {result.join_piece ? `(${result.join_piece})` : ''}
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
                                                {result.qty} {result.no_urut ? `(${result.no_urut})` : ''} {result.join_piece ? ` (${result.join_piece})` : ''} , (lebar kain: {lebarKain[data[0].sc_greige.lebar_kain]})
                                              </Card.Title>
                                              <Stack
                                                direction="horizontal"
                                                gap={1}
                                              >
                                                <Button
                                                  size="sm"
                                                  variant="danger"
                                                  className="text-white"
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
                                                {/* <Button
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
                                                </Button> */}
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
                                                  value={result?.qty}
                                                  className="border-bold"
                                                  name="qty"
                                                  onChange={(e) =>
                                                    handleChangeValueInspectResult(
                                                      e,
                                                      item.id,
                                                      index
                                                    )
                                                  }
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
                                                    value={result.grade}
                                                    onChange={(e) =>
                                                      handleChangeGrade(
                                                        e,
                                                        item.id,
                                                        index
                                                      )
                                                    }
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
                                                    value={result?.join_piece ? result.join_piece.toUpperCase() : ""}
                                                    className="border-bold"
                                                    onChange={(e) => {
                                                      const { name, value } = e.target;

                                                      handleChangeValueInspectResult(
                                                        {
                                                          target: {
                                                            name,
                                                            value: value.toUpperCase(), // langsung di-clean saat input
                                                          },
                                                        },
                                                        item.id,
                                                        index
                                                      );
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
                                                    value={result?.lot_no}
                                                    className="border-bold"
                                                    onChange={(e) => handleChangeValueInspectResult(e,item.id,index)}
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
                                                          type="number"
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
                                  item.stock_id,
                                  data[0].sc_greige.lebar_kain
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
        title="Warning"
        message={modalMessage.message}
      />
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleFormConfirm}
        title="Konfirmasi"
      />
      <Modal
        show={showEditNoWoModal}
        onHide={() => setShowEditNoWoModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-burgundy-gradient text-white">
          <Modal.Title>Edit No. WO</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCariNoWo}>
            <Form.Group>
              <p><i>WO saat ini:</i><br /></p>
              <h4>{formData.no_wo}</h4>
              <Stack direction="horizontal" gap={2}>
                <Form.Control
                  type="text"
                  value={noWoToSearch}
                  onChange={(e) =>
                    setNoWoToSearch(e.target.value)
                  }
                  
                />
                <Button
                  variant="burgundy"
                  style={{ width: '35%' }}
                  type="submit"
                >
                  Cari WO
                </Button>
              </Stack>
            </Form.Group>
          </Form>
          <Card style={{height: '300px', overflowY: 'scroll'}} className="my-2">
            <Card.Body>
              <Table>
                <thead>
                  <tr>
                    <th>No. WO</th>
                    <th>Color</th>
                    <th>Pilih</th>
                  </tr>
                </thead>
                <tbody>
                  {woOptions.map((item, index) => (
                    <React.Fragment key={index}>
                      {item.mo_colors.map((colorItem, colorIndex) => (
                        <tr key={`${index}-${colorIndex}-${colorItem.color}-${item.no}`}>
                          <td>{colorIndex === 0 ? item.no : ''}</td>
                          <td>{colorItem.color}</td>
                          <td>
                            <Button
                              className="border"
                              variant={item?.id === newSelectedWo?.wo_id && colorItem?.wo_color_id === newSelectedWo?.wo_color_id ? 'burgundy' : 'white'} 
                              onClick={() => setNewSelectedWo({
                                kartu_proses_id: data[0].id,
                                wo_id: item.id,
                                mo_id: item.mo_id,
                                sc_greige_id: item.sc_greige_id,
                                sc_id: item.sc_id,
                                wo_color_id: colorItem.wo_color_id
                              })}
                              >
                                <FaCheck className="text-white"/>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
              </tbody>
              </Table>
            </Card.Body>
          </Card>
          {alertMessage.show && (
              <CustomAlert
                variants={[alertMessage.success ? "success" : "danger"]}
                text={alertMessage.message}
              />
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => setShowEditNoWoModal(false)}
          >
            Batal
          </Button>
          <Button
            variant="success"
            onClick={() => {
              handleGantiWo();
            }}
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InspectingCreate;
