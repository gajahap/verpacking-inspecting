import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Card, Stack, Toast } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';
import { RxIdCard } from "react-icons/rx";
import { IoLogOutSharp } from "react-icons/io5";
import axiosInstance from '../../../axiosConfig';
import ConfirmModal from '../../../Components/ConfirmModal';
import { Link } from 'react-router-dom';
import { FaGear } from "react-icons/fa6";
import { ImSearch } from "react-icons/im";
import { RiFilePaper2Fill } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { AiFillInfoCircle } from 'react-icons/ai';


import './Bottom.css';

const Bottom = () => {
  const [showToast, setShowToast] = useState(false);
  const toastRef = useRef(null);
  const [toastType, setToastType] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State untuk ConfirmModal

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleShowAndCloseToast = () => {
    if (showToast) {
      handleCloseToast();
    } else {
      setShowToast(true);
    }
  };

  // Memoize handleClickOutside
  const handleClickOutside = useCallback(
    (event) => {
      if (toastRef.current && !toastRef.current.contains(event.target)) {
        handleCloseToast();
      }
    },
    [toastRef, handleCloseToast]
  );

  useEffect(() => {
    if (showToast) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToast, handleClickOutside]);

  const handleLogoutConfirm = (confirmed) => {
    setShowConfirmModal(false);
    if (confirmed) {
      axiosInstance.post('auth/logout')
        .then(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  return (
    <>  
        <Card className="main-menu bg-burgundy-gradient position-fixed bottom-0 start-50 translate-middle-x" style={{ zIndex: 999,marginBottom: '75px' }}>
          <Row className="justify-content-md-center p-3">
            <Col md="auto">
              <Stack direction="horizontal" gap={3} className="justify-content-center">
                <a href="/" className="text-decoration-none mx-2">
                  <Stack direction="vertical" className="justify-content-center align-items-center">
                    <FaHome size={25} />
                    <span className="text-center" style={{ fontSize: '9px' }}>Home</span>
                  </Stack>
                </a>
                <Link  className="text-decoration-none mx-2" onClick={() => { setToastType('inspect-menu'); handleShowAndCloseToast();}}>
                  <Stack direction="vertical" className="justify-content-center align-items-center text-center">
                    <ImSearch size={25} />
                    <span className="" style={{ fontSize: '9px' }}>Inspecting</span>
                  </Stack>
                </Link>
                <Link  className="text-decoration-none mx-2" onClick={() => { setToastType('setting-menu'); handleShowAndCloseToast();}}>
                  <Stack direction="vertical" className="justify-content-center align-items-center text-center">
                    <FaGear size={25} />
                    <span className="" style={{ fontSize: '9px' }}>Setting</span>
                  </Stack>
                </Link>
                <Link  className="text-decoration-none mx-2" onClick={() => { setToastType('report-menu'); handleShowAndCloseToast();}}>
                  <Stack direction="vertical" className="justify-content-center align-items-center text-center">
                    <RiFilePaper2Fill size={25} />
                    <span className="" style={{ fontSize: '9px' }}>Laporan</span>
                  </Stack>
                </Link>
                <a href="/about" className="text-decoration-none mx-2">
                  <Stack direction="vertical" className="justify-content-center align-items-center">
                    <AiFillInfoCircle size={25} />
                    <span className="text-center" style={{ fontSize: '9px' }}>About</span>
                  </Stack>
                </a>
              </Stack>
            </Col>
          </Row>
        </Card>
        <footer className="text-center fixed-bottom bg-light p-3">
          <span style={{ fontSize: '10px' }}> Copyright &copy; 2025 by Departemen IT Software PT. Gajah Angkasa Perkasa.</span>
        </footer>
      {showToast && (
        <div ref={toastRef}>
          <Toast
            onClose={handleCloseToast}
            show={showToast}
            className="text-center toast-top"
            style={{ zIndex: 9999 }}
          >
            <Toast.Body>
              <Stack direction="vertical" className="justify-content-center align-items-center">
                {toastType === 'inspect-menu' && (
                  <>
                    <a href="/inspecting-create-dyeing" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/inspecting-create-dyeing'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <RxIdCard size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Create Inspect Dyeing</span>
                      </Stack>
                    </a>
                    <a href="/inspecting-create-printing" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/inspecting-create-printing'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <RxIdCard size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Create Inspect Printing</span>
                      </Stack>
                    </a>
                    <a href="/inspecting-create-mkl-bj" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/inspecting-create-mkl-bj'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <RxIdCard size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Create Inspect MKL/BJ</span>
                      </Stack>
                    </a>
                  </>
                )}
                {toastType === 'setting-menu' && (
                  <>
                    <Link to="#" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); setShowConfirmModal(true); }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <IoLogOutSharp size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Logout</span>
                      </Stack>
                    </Link>
                    <Link to="/user-configuration" className="text-decoration-none p-2 w-100">
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <CgProfile size={25} />
                        <span className="" style={{ fontSize: '12px' }}>User Configuration</span>
                      </Stack>
                    </Link>
                  </>

                )}
                {toastType === 'report-menu' && (
                  <>
                    <a href="/daftar-pengiriman-produksi" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/daftar-pengiriman-produksi'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Daftar Pengiriman Produksi</span>
                      </Stack>
                    </a>
                    <a href="/rekap-pengiriman-produksi" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/rekap-pengiriman-produksi'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Rekapitulasi Pengiriman Produksi</span>
                      </Stack>
                    </a>
                    <a href="/analisa-pengiriman-produksi" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/analisa-pengiriman-produksi'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Analisa Pengiriman Produksi</span>
                      </Stack>
                    </a>
                    <a href="/rekap-pengiriman-harian" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/rekap-pengiriman-harian'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Rekapitulasi Pengiriman Harian</span>
                      </Stack>
                    </a>
                    <a href="/rekap-pengiriman-verpacking" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/rekap-pengiriman-verpacking'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Rekapitulasi Pengiriman Verpacking</span>
                      </Stack>
                    </a>
                    <a href="/grafik-defect" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/grafik-defect'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Grafik Defect</span>
                      </Stack>
                    </a>
                    <a href="/search-defect-per-motif" className="text-decoration-none p-2 w-100" onClick={(e) => { e.preventDefault(); window.location.href = '/search-defect-per-motif'; }}>
                      <Stack direction="horizontal" gap={3} className="justify-content-center align-items-center">
                        <TbReportSearch size={25} />
                        <span className="" style={{ fontSize: '12px' }}>Search Defect By Motif</span>
                      </Stack>
                    </a>
                  </>
                )}
              </Stack>
            </Toast.Body>
          </Toast>
        </div>
      )}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
      />
    </>
  );
};

export default Bottom;

