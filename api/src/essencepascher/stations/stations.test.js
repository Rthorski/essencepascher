const request = require("supertest");
const app = require("../../../app");
const pool = require("../../../db");
const queries = require("./queries");
const { getStationNames } = require("./controllers");

jest.mock("../../../db", () => ({
  query: jest.fn(),
}));

jest.mock("node-fetch", () => jest.fn());
const fetch = require("node-fetch");

describe("GET /api/v1/essencepascher/stations", () => {
  it("devrait retourner toutes les stations", async () => {
    const mockStations = [
      {
        id: 1,
        geolocalistion: [{ city: "Lyon", latitude: 45.75, longitude: 4.85 }],
      },
      {
        id: 2,
        geolocalistion: [{ city: "Paris", latitude: 48.85, longitude: 2.35 }],
      },
      {
        id: 3,
        geolocalistion: [{ city: "Marseille", latitude: 43.3, longitude: 5.4 }],
      },
    ];

    pool.query.mockResolvedValue({ rows: mockStations });

    const res = await request(app)
      .get("/api/v1/essencepascher/stations")
      .expect(200);

    expect(res.body).toEqual(mockStations);
    expect(res.status).toBe(200);
  });

  it("devrait retourner une erreur 500 si une erreur survient", async () => {
    const dbError = new Error("Erreur serveur");
    pool.query.mockRejectedValue(dbError);

    const res = await request(app)
      .get("/api/v1/essencepascher/stations")
      .expect(500);

    expect(res.text).toBe("Erreur serveur");
    expect(res.status).toBe(500);
  });
});

describe("GET /api/v1/essencepascher/stations/name/:id", () => {
  it("devrait retourner le nom de la station si elle existe", async () => {
    const stationId = 123;
    const mockStation = {
      id: stationId,
      name: "Station test",
      geolocalisation: [{ latitude: 45.75, longitude: 4.85 }],
    };

    pool.query.mockResolvedValueOnce({ rows: [mockStation] });

    const res = await request(app)
      .get(`/api/v1/essencepascher/stations/name/${stationId}`)
      .expect(200);

    expect(res.body).toEqual(mockStation);
    expect(pool.query).toHaveBeenCalledWith(queries.getStationNames, [
      stationId,
    ]);
  });

  it("devrait retourner une erreur 404 si la station n'existe pas", async () => {
    const stationId = 456;
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get(`/api/v1/essencepascher/stations/name/${stationId}`)
      .expect(404);

    expect(res.text).toBe("Station not found");
    expect(res.status).toBe(404);
  });

  it("devrait mettre à jour le nom de la station si name est null et qu'il y a des résultats de l'api Google Maps", async () => {
    const stationId = 789;
    const mockStationWithoutName = {
      id: stationId,
      name: null,
      geolocalisation: [{ latitude: 45.75, longitude: 4.85 }],
    };
    const mockApiResponse = {
      results: [{ name: "Station A" }, { name: "Station B" }],
    };

    pool.query
      .mockResolvedValueOnce({ rows: [mockStationWithoutName] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ name: "Station A & Station B" }] });

    const mockReq = { params: { id: stationId } };
    const mockRes = {
      status: jest.fn(() => mockRes),
      send: jest.fn(),
      json: jest.fn(),
    };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse),
    });

    await getStationNames(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith([
      { name: "Station A & Station B" },
    ]);
  });

  it("devrait gérer les erreurs de la base de données ou de l'API", async () => {
    const stationId = 789;
    const mockStationWithoutName = {
      id: stationId,
      name: null,
      geolocalisation: [{ latitude: 45.75, longitude: 4.85 }],
    };

    pool.query.mockRejectedValueOnce(new Error("Erreur de base de données"));

    const mockReq = { params: { id: stationId } };
    const mockRes = {
      status: jest.fn(() => mockRes),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getStationNames(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Erreur serveur");

    pool.query.mockReset();

    fetch.mockRejectedValueOnce(new Error("Erreur API Google Maps"));

    pool.query.mockResolvedValueOnce({ rows: [mockStationWithoutName] });

    await getStationNames(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Erreur serveur");
  });

  describe("POST /api/v1/essencepascher/stations/lastpriceFiltered", () => {
    it("devrait retourner les prix filtrés pour les stations spécifiées", async () => {
      const mockStationIds = [1, 3, 5];
      const mockPrices = [
        {
          station_id: 1,
          prix_gplc: 0.8,
          prix_e10: 1.6,
          prix_sp95: 1.7,
          prix_sp98: 1.8,
          prix_gazole: 1.5,
        },
        {
          station_id: 3,
          prix_gplc: 0.85,
          prix_e10: 1.65,
          prix_sp95: 1.75,
          prix_sp98: 1.85,
          prix_gazole: 1.55,
        },
        {
          station_id: 5,
          prix_gplc: 0.9,
          prix_e10: 1.7,
          prix_sp95: 1.8,
          prix_sp98: 1.9,
          prix_gazole: 1.6,
        },
      ];

      pool.query.mockResolvedValue({ rows: mockPrices });

      const res = await request(app)
        .post("/api/v1/essencepascher/stations/lastpriceFiltered")
        .send({ station_id: mockStationIds })
        .expect(200);

      expect(res.body).toEqual(mockPrices);
      expect(pool.query).toHaveBeenCalledWith(queries.getLastPriceFiltered, [
        mockStationIds,
      ]);
    });

    it("devrait retourner une erreur 400 si station_id est manquant", async () => {
      const res = await request(app)
        .post("/api/v1/essencepascher/stations/lastpriceFiltered")
        .send({})
        .expect(400);

      expect(res.text).toBe("Invalid station_ids");
    });

    it("devrait gérer les erreurs de la base de données", async () => {
      const dbError = new Error("Erreur de base de données");
      pool.query.mockRejectedValue(dbError);

      const res = await request(app)
        .post("/api/v1/essencepascher/stations/lastpriceFiltered")
        .send({ station_id: [1, 2, 3] })
        .expect(500);

      expect(res.text).toBe("Erreur lors de la récupération des prix");
    });
  });
});
