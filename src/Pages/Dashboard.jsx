import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Stack,Badge, Button ,Spinner } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import Bottom from './Layouts/Bottom/Bottom';
import LoadingSpinner from '../Components/LoadingSpinner';
import { GiMagnifyingGlass } from "react-icons/gi";
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ErrorPage from '../ErrorPage';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  document.title = 'Vinspect GAP';
  const [data, setData] = useState({});
  const [inspectRecent, setInspectRecent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [chartlabels, setChartLabels] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isSearchForGrafik, setIsSearchForGrafik] = useState(false);

  const fetchDataIndex = async () => {
    try {
      const response = await axiosInstance.get('dashboard/index');
      setData(response.data);
      console.log(response.data);
      setInspectRecent(response.data.recent_kartu_proses_dyeing);
      // setChartData(Object.values(response.data.inspectings_per_year));
      // setChartLabels(Object.keys(response.data.inspectings_per_year));
    } catch (error) {
      setIsError(error.response?.status || 'Error');
      console.log(error.response);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataGrafik = async () => {
    try {
      setIsSearchForGrafik(true);
      const response = await axiosInstance.get('dashboard/grafik');
      setData(response.data);
      console.log(response.data);
      setChartData(Object.values(response.data.inspectings_per_year));
      setChartLabels(Object.keys(response.data.inspectings_per_year));
    } catch (error) {
      setIsError(error.response?.status || 'Error');
      console.log(error.response);
    } finally {
      setIsSearchForGrafik(false);
    }
  };

  useEffect(() => {
    fetchDataIndex();
  }, []);

  useEffect(() => {
    console.log(inspectRecent);
  }, [inspectRecent]);

  const dataChart = {
    labels: chartlabels.map((key) => new Date(Date.parse(key)).toLocaleString('default', { month: 'short' })),
    datasets: [
      {
        label: 'Data Inspect',
        data: chartData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 215, 0, 0.5)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorPage status={isError}/>
      ) : (
        <>
          <div style={{ position: "relative", height: "30rem" }}>
            <div
              style={{
                height: "100%",
                justifyContent: "center",
                paddingBottom: "100px",
              }}
              className="bg-burgundy-gradient bg-pattern-container text-white p-4 curved-container"
            >
            </div>

            {/* Konten Overlay */}

            <div className="text-white p-4" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
              <Container className="py-5">
                <Stack direction="vertical">
                  <div className="">
                    <h1>
                      {new Date().getHours() < 12
                        ? "Selamat Pagi!"
                        : new Date().getHours() < 15
                          ? "Selamat Siang!"
                          : new Date().getHours() < 18
                            ? "Selamat Sore!"
                            : "Selamat Malam!"
                      }
                    </h1>
                    <p>
                      Anda Login Sebagai : {" "}
                      <Badge bg="danger" className="text-white p-2">
                        {data.users?.username
                          ? data.users.username.charAt(0).toUpperCase() +
                            data.users.username.slice(1)
                          : ""}
                      </Badge>
                    </p>
                  </div>
                  <div className="py-3">
                    <h6>Inspect Terakhir:</h6>
                    <Stack direction="horizontal" gap={3} style={{ overflow: "auto", paddingBlock: "5px" }}>
                      {inspectRecent.map((inspect, index) => (
                        <Link
                          key={index}
                          to={
                            inspect.jenis_process === 1
                              ? `/inspecting-dyeing/${inspect.id}`
                              : `/inspecting-printing/${inspect.id}`
                          }
                          className="text-decoration-none"
                        >
                          <Badge bg="white" className="text-burgundy p-2">
                            {inspect.jenis_process === 1
                              ? inspect.kartu_process_dyeing?.no
                              : inspect.kartu_process_printing?.no}
                          </Badge>
                        </Link>
                      ))}
                    </Stack>
                  </div>
                </Stack>
                <Card className="p-4" style={{ marginBottom: "8rem" , minHeight: "50vh"}}>
                  <Row className="g-3">
                    <Col sm={4} md={4}>
                      <Link to="/inspecting-create-dyeing" className="text-decoration-none">
                        <Card className="shadow-sm bg-burgundy hover-burgundy text-white border-none p-2 h-100">
                          <Card.Body className="d-flex flex-column">
                            <GiMagnifyingGlass size={50} />
                            <Card.Title>Inspect Dyeing</Card.Title>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                    <Col sm={4} md={4}>
                      <Link to="/inspecting-create-printing" className="text-decoration-none">
                        <Card className="shadow-sm bg-young-burgundy text-white border-none p-2 h-100">
                          <Card.Body className="d-flex flex-column">
                            <GiMagnifyingGlass size={50} />
                            <Card.Title>Inspect Printing</Card.Title>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                    <Col sm={4} md={4}>
                      <Link to="/inspecting-create-mkl-bj" className="text-decoration-none">
                        <Card className="shadow-sm bg-warning text-burgundy border-none p-2 h-100">
                          <Card.Body className="d-flex flex-column">
                            <GiMagnifyingGlass size={50} />
                            <Card.Title>Inspect MKL/BJ</Card.Title>
                          </Card.Body>
                        </Card>
                      </Link>
                    </Col>
                  </Row>
                  <hr />
                  <h5>
                    Statistik Hasil Inspect Saya 
                    </h5>
                  <div><Button variant='burgundy' size='sm' onClick={() => fetchDataGrafik()} disabled={isSearchForGrafik} >{isSearchForGrafik ? <Spinner animation="border" size="sm" /> : "Tampilkan Grafik" }</Button></div>
                  <Bar data={dataChart} options={options} /> 
                </Card>
              </Container>
            </div>
          </div>
          <Bottom />
        </>
      )}
    </>
  );
};

export default Dashboard;



