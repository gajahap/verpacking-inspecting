import React from 'react';
import Bottom from './Layouts/Bottom/Bottom';
import { Container, Card } from 'react-bootstrap';

const UserConfiguration = () => {


  return (
    <>
      <div style={{ position: "relative", height: "30rem" }}>
        <div
          style={{
            height: "100%",
            justifyContent: "center",
            paddingBottom: "100px",
          }}
          className="bg-burgundy-gradient bg-pattern-container text-white p-4 curved-container"
        />
      </div>

      <div
        className="text-white p-4"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{maxWidth: '600px', paddingBottom: '200px'}}>
            <Card className="p-4 w-100">
                <h2 className="mb-3 text-young-burgundy fw-bold">Tentang Program Ini.</h2>

                <p style={{ textAlign: 'justify' }}>
                    Program ini adalah aplikasi berbasis web yang dirancang untuk <span className="font-semibold">mengolah data inspeksi</span> dalam proses verpacking.
                    Pembangunan program dimulai pada Desember 2024 dan selesai pada Maret 2025, <span className="font-semibold">diinisiasi oleh Tim Software Departemen IT PT. Gajah Angkasa Perkasa</span>. 
                    Sampai saat ini, program ini terus dikembangkan untuk mencapai tujuan dibuatnya program ini, yaitu membantu menyelesaikan permasalahan pada proses inspeksi verpacking, serta melakukan digitalisasi proses input data inspeksi verpacking.
                </p>

                <p style={{ textAlign: 'justify' }}>
                    Dengan memanfaatkan teknologi <i>REST API</i>, program ini memungkinkan sistem terintegrasi dengan sistem lainnya dengan transfer data yang cepat walaupun dengan ukuran data yang besar.
                </p>

                <p style={{ textAlign: 'justify' }}>
                    Program ini telah melewati tahap uji coba dengan bantuan <span className="font-semibold">Tim Penguji Departemen QA</span> pada Bulan Juni hingga Juli 2025.
                </p>

                <p className="text-end mt-5">
                    Maret 2025 <br /> <span className="font-semibold">Tim Software Departemen IT</span>
                </p>
            </Card>
        </Container>
      </div>
     <Bottom />
      
    </>
  );
};

export default UserConfiguration;
